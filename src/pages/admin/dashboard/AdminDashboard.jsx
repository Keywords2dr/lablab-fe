import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowForward,
  Receipt,
  MeetingRoom,
  Inventory2,
  PeopleAlt,
  FiberManualRecord,
  AccessTime,
  Science,
  CheckCircle,
  HourglassEmpty,
  BarChart,
  Refresh,
  OpenInNew,
  History,
  Person,
  Build,
  Science as ScienceIcon,
  AdminPanelSettings,
} from "@mui/icons-material";
import { rentTicketApi } from "../../../api/rentTicketApi";
import { roomApi } from "../../../api/roomApi";
import { userApi } from "../../../api/userApi";
import { chemicalApi } from "../../../api/chemicalApi";
import { dashboardApi } from "../../../api/dashboardApi";
import "./AdminDashboard.css";

// ── Constants ────────────────────────────────────────────────
const TICKET_TYPE_LABEL = {
  ROOM_ONLY: "Phòng Lab",
  CHEMICAL_ONLY: "Vật tư",
  ROOM_AND_CHEMICAL: "Phòng & Vật tư",
};

const AVATAR_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#6366f1",
];

// Icon cho từng category của activity feed
const FEED_CATEGORY_ICON = {
  TICKET: <Receipt style={{ fontSize: 15 }} />,
  ROOM: <MeetingRoom style={{ fontSize: 15 }} />,
  CHEMICAL: <ScienceIcon style={{ fontSize: 15 }} />,
  USER: <Person style={{ fontSize: 15 }} />,
  INVENTORY: <Inventory2 style={{ fontSize: 15 }} />,
  SYSTEM: <Build style={{ fontSize: 15 }} />,
};

const FEED_CATEGORY_COLOR = {
  TICKET: "#3b82f6",
  ROOM: "#10b981",
  CHEMICAL: "#8b5cf6",
  USER: "#f59e0b",
  INVENTORY: "#6366f1",
  SYSTEM: "#94a3b8",
};

// ── Component chính ──────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();

  // ── State: Stats cards ───────────────────────────────────
  const [stats, setStats] = useState({
    pendingCount: 0,
    activeRooms: 0,
    totalUsers: 0,
    lowStockCount: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // ── State: Phiếu chờ duyệt ───────────────────────────────
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);

  // ── State: Biểu đồ 7 ngày ────────────────────────────────
  const [weeklyData, setWeeklyData] = useState([]);
  const [weeklyLoading, setWeeklyLoading] = useState(true);

  // ── State: Trạng thái phòng ───────────────────────────────
  const [roomUsage, setRoomUsage] = useState([]);
  const [roomUsageLoading, setRoomUsageLoading] = useState(true);

  // ── State: Activity feed ──────────────────────────────────
  const [feedItems, setFeedItems] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);

  // ── Fetch tất cả data song song ───────────────────────────
  const fetchDashboardData = useCallback(async () => {
    setStatsLoading(true);
    setTicketsLoading(true);
    setWeeklyLoading(true);
    setRoomUsageLoading(true);
    setFeedLoading(true);

    const [
      pendingRes,
      roomsRes,
      usersRes,
      inventoryRes,
      weeklyRes,
      roomUsageRes,
      feedRes,
    ] = await Promise.allSettled([
      rentTicketApi.getAdminPending(),
      roomApi.getRooms({ status: "active", size: 1 }),
      userApi.getUsers({ size: 1 }),
      chemicalApi.getInventoryGlobal(),
      dashboardApi.getWeeklyStats(),
      dashboardApi.getRoomCurrentUsage(),
      dashboardApi.getActivityFeed(8),
    ]);

    // 1. Phiếu chờ duyệt
    let pendingList = [];
    if (pendingRes.status === "fulfilled") {
      const data = pendingRes.value?.data;
      pendingList = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
          ? data.content
          : [];
    }
    setTickets(pendingList);
    setTicketsLoading(false);

    // 2. Stats cards
    let activeRooms = 0;
    if (roomsRes.status === "fulfilled") {
      const data = roomsRes.value?.data;
      activeRooms = data?.totalElements ?? data?.data?.totalElements ?? 0;
    }

    let totalUsers = 0;
    if (usersRes.status === "fulfilled") {
      const data = usersRes.value?.data;
      totalUsers = data?.totalElements ?? data?.data?.totalElements ?? 0;
    }

    let lowStockCount = 0;
    if (inventoryRes.status === "fulfilled") {
      const inv = inventoryRes.value?.data;
      if (Array.isArray(inv)) {
        lowStockCount = inv.filter(
          (item) => (item?.grandTotal ?? 1) === 0,
        ).length;
      } else if (inv && typeof inv === "object") {
        lowStockCount = Object.values(inv).filter(
          (item) => (item?.grandTotal ?? 1) === 0,
        ).length;
      }
    }

    setStats({
      pendingCount: pendingList.length,
      activeRooms,
      totalUsers,
      lowStockCount,
    });
    setStatsLoading(false);

    // 3. Biểu đồ 7 ngày
    if (weeklyRes.status === "fulfilled") {
      const data = weeklyRes.value?.data;
      setWeeklyData(Array.isArray(data) ? data : []);
    } else {
      setWeeklyData([]);
    }
    setWeeklyLoading(false);

    // 4. Trạng thái phòng
    if (roomUsageRes.status === "fulfilled") {
      const data = roomUsageRes.value?.data;
      setRoomUsage(Array.isArray(data) ? data : []);
    } else {
      setRoomUsage([]);
    }
    setRoomUsageLoading(false);

    // 5. Activity feed
    if (feedRes.status === "fulfilled") {
      const data = feedRes.value?.data;
      setFeedItems(Array.isArray(data) ? data : []);
    } else {
      setFeedItems([]);
    }
    setFeedLoading(false);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ── Tính MAX cho biểu đồ ──────────────────────────────────
  const maxWeekly =
    weeklyData.length > 0
      ? Math.max(
          ...weeklyData.map((d) => d.approved + d.rejected + d.pending),
          1,
        )
      : 1;

  // ── STATS config ──────────────────────────────────────────
  const STATS_CONFIG = [
    {
      id: "tickets",
      label: "Phiếu chờ duyệt",
      value: statsLoading ? "—" : String(stats.pendingCount),
      icon: <Receipt />,
      color: "blue",
      path: "/admin/tickets",
    },
    {
      id: "rooms",
      label: "Phòng đang hoạt động",
      value: statsLoading ? "—" : String(stats.activeRooms),
      icon: <MeetingRoom />,
      color: "green",
      path: "/admin/rooms",
    },
    {
      id: "materials",
      label: "Vật tư hết hàng",
      value: statsLoading ? "—" : String(stats.lowStockCount),
      icon: <Inventory2 />,
      color: "orange",
      path: "/admin/materials",
    },
    {
      id: "users",
      label: "Tổng người dùng",
      value: statsLoading ? "—" : String(stats.totalUsers),
      icon: <PeopleAlt />,
      color: "purple",
      path: "/admin/users",
    },
  ];

  // ── Helpers ───────────────────────────────────────────────
  const getTicketTypeClass = (type) => {
    if (!type) return "material";
    if (type === "ROOM_ONLY" || type === "ROOM_AND_CHEMICAL") return "room";
    return "material";
  };

  const getTicketTypeLabel = (type) => TICKET_TYPE_LABEL[type] || type || "—";

  const getTicketTypeIcon = (type) =>
    type === "ROOM_ONLY" ? (
      <MeetingRoom style={{ fontSize: 12 }} />
    ) : (
      <Science style={{ fontSize: 12 }} />
    );

  // Format expectedReturnDate → "HH:mm"
  const formatReturnTime = (isoString) => {
    if (!isoString) return null;
    try {
      return new Date(isoString).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return null;
    }
  };

  // ── RENDER ────────────────────────────────────────────────
  return (
    <div className="adnew-root">
      {/* ── GREETING HEADER ── */}
      <div className="adnew-header">
        <div className="adnew-header-left">
          <div className="adnew-greeting-tag">
            <FiberManualRecord className="adnew-live-dot" />
            Hệ thống đang hoạt động
          </div>
          <h1 className="adnew-heading">Tổng Quan Hệ Thống</h1>
          <p className="adnew-subheading">
            Chào mừng trở lại, Admin! Dưới đây là tình trạng hệ thống hôm nay.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            className="adnew-refresh-btn"
            onClick={fetchDashboardData}
            title="Tải lại dữ liệu"
          >
            <Refresh style={{ fontSize: 16 }} />
            Làm mới
          </button>
          <div className="adnew-header-time">
            <AccessTime style={{ fontSize: 16 }} />
            {new Date().toLocaleDateString("vi-VN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* ── STATS GRID ── */}
      <div className="adnew-stats-grid">
        {STATS_CONFIG.map((s) => (
          <div
            key={s.id}
            className={`adnew-stat-card adnew-stat-${s.color} ${statsLoading ? "adnew-stat-loading" : ""}`}
            onClick={() => navigate(s.path)}
          >
            <div className="adnew-stat-icon">{s.icon}</div>
            <div className="adnew-stat-body">
              <span className="adnew-stat-label">{s.label}</span>
              <span className="adnew-stat-value">
                {statsLoading ? <span className="adnew-skeleton" /> : s.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="adnew-body">
        {/* ── CỘT TRÁI ── */}
        <div className="adnew-col-main">
          {/* Phiếu chờ duyệt */}
          <div className="adnew-card">
            <div className="adnew-card-header">
              <div className="adnew-card-title-wrap">
                <HourglassEmpty
                  className="adnew-card-icon"
                  style={{ color: "#f59e0b" }}
                />
                <h2 className="adnew-card-title">
                  Phiếu chờ duyệt
                  {!ticketsLoading && (
                    <span className="adnew-badge-count">{tickets.length}</span>
                  )}
                </h2>
              </div>
              <button
                className="adnew-btn-link"
                onClick={() => navigate("/admin/tickets")}
              >
                Xem tất cả <ArrowForward style={{ fontSize: 14 }} />
              </button>
            </div>

            {ticketsLoading ? (
              <div className="adnew-ticket-list">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="adnew-ticket adnew-ticket-skeleton">
                    <div className="adnew-skeleton adnew-skeleton-avatar" />
                    <div className="adnew-skeleton-lines">
                      <div className="adnew-skeleton adnew-skeleton-line" />
                      <div className="adnew-skeleton adnew-skeleton-line short" />
                    </div>
                  </div>
                ))}
              </div>
            ) : tickets.length === 0 ? (
              <div className="adnew-empty-state">
                <CheckCircle
                  style={{ fontSize: 40, color: "#10b981", marginBottom: 8 }}
                />
                <p>Không còn phiếu nào cần xử lý!</p>
              </div>
            ) : (
              <div className="adnew-ticket-list">
                {tickets.slice(0, 5).map((t, idx) => (
                  <div
                    key={t.ticketId}
                    className="adnew-ticket adnew-ticket-clickable"
                    onClick={() => navigate(`/admin/tickets/${t.ticketId}`)}
                    title="Bấm để xem chi tiết phiếu này"
                  >
                    <div
                      className="adnew-ticket-avatar"
                      style={{
                        background: AVATAR_COLORS[idx % AVATAR_COLORS.length],
                      }}
                    >
                      {(t.requesterName || t.userName || "?")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div className="adnew-ticket-meta">
                      <div className="adnew-ticket-user">
                        {t.requesterName || t.userName || "Người dùng"}
                        <span className="adnew-ticket-role">
                          {t.requesterRole || t.role || ""}
                        </span>
                      </div>
                      <div className="adnew-ticket-detail">
                        <span
                          className={`adnew-ticket-type ${getTicketTypeClass(t.ticketType)}`}
                        >
                          {getTicketTypeIcon(t.ticketType)}
                          {getTicketTypeLabel(t.ticketType)}
                        </span>
                        {t.roomName
                          ? t.roomName
                          : t.ticketType === "CHEMICAL_ONLY"
                            ? "Yêu cầu vật tư"
                            : "—"}
                      </div>
                      {t.createdAt && (
                        <div className="adnew-ticket-time">
                          <AccessTime style={{ fontSize: 11 }} />
                          {new Date(t.createdAt).toLocaleString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "2-digit",
                          })}
                        </div>
                      )}
                    </div>
                    <div
                      className="adnew-ticket-actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="adnew-btn-detail"
                        onClick={() => navigate(`/admin/tickets/${t.ticketId}`)}
                        title="Xem chi tiết & duyệt phiếu"
                      >
                        <OpenInNew style={{ fontSize: 15 }} />
                        Chi tiết
                      </button>
                    </div>
                  </div>
                ))}
                {tickets.length > 5 && (
                  <button
                    className="adnew-btn-link adnew-view-more"
                    onClick={() => navigate("/admin/tickets")}
                  >
                    Xem thêm {tickets.length - 5} phiếu khác{" "}
                    <ArrowForward style={{ fontSize: 14 }} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Activity Feed*/}
          <div className="adnew-card">
            <div className="adnew-card-header">
              <div className="adnew-card-title-wrap">
                <History
                  className="adnew-card-icon"
                  style={{ color: "#3b82f6" }}
                />
                <h2 className="adnew-card-title">Hoạt động gần đây</h2>
              </div>
              <button
                className="adnew-btn-link"
                onClick={() => navigate("/admin/audit-logs")}
              >
                Xem logs <ArrowForward style={{ fontSize: 14 }} />
              </button>
            </div>

            {feedLoading ? (
              <div className="adnew-feed-list">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="adnew-feed-item adnew-feed-skeleton">
                    <div className="adnew-skeleton adnew-skeleton-circle" />
                    <div className="adnew-skeleton-lines">
                      <div className="adnew-skeleton adnew-skeleton-line" />
                      <div className="adnew-skeleton adnew-skeleton-line short" />
                    </div>
                  </div>
                ))}
              </div>
            ) : feedItems.length === 0 ? (
              <div className="adnew-empty-state">
                <History
                  style={{ fontSize: 36, color: "#cbd5e1", marginBottom: 8 }}
                />
                <p>Chưa có hoạt động nào được ghi nhận.</p>
              </div>
            ) : (
              <div className="adnew-feed-list">
                {feedItems.map((item) => (
                  <div key={item.logId} className="adnew-feed-item">
                    <div
                      className="adnew-feed-icon"
                      style={{
                        background: `${FEED_CATEGORY_COLOR[item.category] ?? "#94a3b8"}18`,
                        color: FEED_CATEGORY_COLOR[item.category] ?? "#94a3b8",
                      }}
                    >
                      {FEED_CATEGORY_ICON[item.category] ?? (
                        <Build style={{ fontSize: 15 }} />
                      )}
                    </div>
                    <div className="adnew-feed-body">
                      <p className="adnew-feed-desc">{item.description}</p>
                      <div className="adnew-feed-meta">
                        <span className="adnew-feed-actor">
                          <AdminPanelSettings style={{ fontSize: 12 }} />
                          {item.actorName}
                        </span>
                        <span className="adnew-feed-time">{item.timeAgo}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── CỘT PHẢI ── */}
        <div className="adnew-col-side">
          {/* Hero Summary */}
          <div className="adnew-hero-card">
            <div className="adnew-hero-bg-orb" />
            <div className="adnew-hero-content">
              <p className="adnew-hero-label">Phiếu chờ Admin duyệt</p>
              <div className="adnew-hero-number">
                {statsLoading ? "—" : stats.pendingCount}
              </div>
              <div className="adnew-hero-stats">
                <div className="adnew-hero-stat">
                  <MeetingRoom style={{ fontSize: 14 }} />
                  <span>
                    {statsLoading ? "—" : stats.activeRooms} phòng đang hoạt
                    động
                  </span>
                </div>
                <div className="adnew-hero-stat">
                  <PeopleAlt style={{ fontSize: 14 }} />
                  <span>
                    {statsLoading ? "—" : stats.totalUsers} người dùng
                  </span>
                </div>
                <div className="adnew-hero-stat red">
                  <Inventory2 style={{ fontSize: 14 }} />
                  <span>
                    {statsLoading ? "—" : stats.lowStockCount} vật tư hết hàng
                  </span>
                </div>
              </div>
              <button
                className="adnew-hero-btn"
                onClick={() => navigate("/admin/tickets")}
              >
                Quản lý phiếu mượn <ArrowForward style={{ fontSize: 14 }} />
              </button>
            </div>
          </div>

          {/* ── BIỂU ĐỒ PHIẾU 7 NGÀY── */}
          <div className="adnew-card">
            <div className="adnew-card-header">
              <div className="adnew-card-title-wrap">
                <BarChart
                  className="adnew-card-icon"
                  style={{ color: "#6366f1" }}
                />
                <h2 className="adnew-card-title">Phiếu mượn 7 ngày qua</h2>
              </div>
            </div>

            <div className="adnew-chart-legend">
              <span className="adnew-legend-item">
                <span
                  className="adnew-legend-dot"
                  style={{ background: "#3b82f6" }}
                />
                Đã duyệt
              </span>
              <span className="adnew-legend-item">
                <span
                  className="adnew-legend-dot"
                  style={{ background: "#ef4444" }}
                />
                Từ chối
              </span>
              <span className="adnew-legend-item">
                <span
                  className="adnew-legend-dot"
                  style={{ background: "#f59e0b" }}
                />
                Đang xử lý
              </span>
            </div>

            {weeklyLoading ? (
              <div className="adnew-chart adnew-chart-loading">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="adnew-chart-col">
                    <div className="adnew-bar-wrap">
                      <div
                        className="adnew-skeleton"
                        style={{
                          width: "100%",
                          height: `${30 + Math.random() * 50}%`,
                          borderRadius: 4,
                        }}
                      />
                    </div>
                    <span className="adnew-chart-day">—</span>
                  </div>
                ))}
              </div>
            ) : weeklyData.length === 0 ? (
              <div className="adnew-empty-state" style={{ minHeight: 120 }}>
                <BarChart
                  style={{ fontSize: 36, color: "#cbd5e1", marginBottom: 8 }}
                />
                <p>Không có dữ liệu thống kê.</p>
              </div>
            ) : (
              <div className="adnew-chart">
                {weeklyData.map((d) => {
                  const total = d.approved + d.rejected + d.pending;
                  const empty = maxWeekly - total;
                  return (
                    <div key={d.date ?? d.dayLabel} className="adnew-chart-col">
                      <div className="adnew-bar-wrap">
                        <div
                          className="adnew-bar-empty"
                          style={{ flex: empty > 0 ? empty : 0.01 }}
                        />
                        {d.pending > 0 && (
                          <div
                            className="adnew-bar-pending"
                            style={{ flex: d.pending }}
                            title={`Đang xử lý: ${d.pending}`}
                          />
                        )}
                        {d.rejected > 0 && (
                          <div
                            className="adnew-bar-rejected"
                            style={{ flex: d.rejected }}
                            title={`Từ chối: ${d.rejected}`}
                          />
                        )}
                        {d.approved > 0 && (
                          <div
                            className="adnew-bar-approved"
                            style={{ flex: d.approved }}
                            title={`Đã duyệt: ${d.approved}`}
                          />
                        )}
                      </div>
                      <span className="adnew-chart-total">
                        {total > 0 ? total : ""}
                      </span>
                      <span className="adnew-chart-day">{d.dayLabel}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── TRẠNG THÁI PHÒNG LAB HÔM NAY ── */}
          <div className="adnew-card">
            <div className="adnew-card-header">
              <div className="adnew-card-title-wrap">
                <MeetingRoom
                  className="adnew-card-icon"
                  style={{ color: "#10b981" }}
                />
                <h2 className="adnew-card-title">Phòng Lab hôm nay</h2>
              </div>
              <button
                className="adnew-btn-link"
                onClick={() => navigate("/admin/rooms")}
              >
                Quản lý <ArrowForward style={{ fontSize: 14 }} />
              </button>
            </div>

            {roomUsageLoading ? (
              <div className="adnew-room-list">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="adnew-room-item">
                    <div
                      className="adnew-skeleton"
                      style={{ width: 10, height: 10, borderRadius: "50%" }}
                    />
                    <div className="adnew-skeleton-lines" style={{ flex: 1 }}>
                      <div className="adnew-skeleton adnew-skeleton-line" />
                      <div className="adnew-skeleton adnew-skeleton-line short" />
                    </div>
                  </div>
                ))}
              </div>
            ) : roomUsage.length === 0 ? (
              <div className="adnew-empty-state" style={{ minHeight: 80 }}>
                <MeetingRoom
                  style={{ fontSize: 36, color: "#cbd5e1", marginBottom: 8 }}
                />
                <p>Không có dữ liệu phòng.</p>
              </div>
            ) : (
              <>
                <div className="adnew-room-summary">
                  <span className="adnew-room-pill occupied">
                    {roomUsage.filter((r) => r.status === "occupied").length}{" "}
                    đang dùng
                  </span>
                  <span className="adnew-room-pill available">
                    {roomUsage.filter((r) => r.status === "available").length}{" "}
                    trống
                  </span>
                  <span className="adnew-room-pill maintenance">
                    {roomUsage.filter((r) => r.status === "maintenance").length}{" "}
                    bảo trì
                  </span>
                </div>

                <div className="adnew-room-list">
                  {roomUsage.map((room) => (
                    <div
                      key={room.roomId}
                      className={`adnew-room-item adnew-room-${room.status}`}
                    >
                      <div className="adnew-room-indicator" />
                      <div className="adnew-room-info">
                        <span className="adnew-room-name">{room.roomName}</span>
                        {room.status === "occupied" && (
                          <span className="adnew-room-user">
                            {room.borrowerName}
                            {room.expectedReturnDate && (
                              <>
                                {" "}
                                · đến{" "}
                                {formatReturnTime(room.expectedReturnDate)}
                              </>
                            )}
                          </span>
                        )}
                        {room.status === "available" && (
                          <span className="adnew-room-user">
                            Sẵn sàng sử dụng
                          </span>
                        )}
                        {room.status === "maintenance" && (
                          <span className="adnew-room-user">Đang bảo trì</span>
                        )}
                      </div>
                      <span className="adnew-room-badge">
                        {room.status === "occupied" && "Đang dùng"}
                        {room.status === "available" && "Trống"}
                        {room.status === "maintenance" && "Bảo trì"}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
