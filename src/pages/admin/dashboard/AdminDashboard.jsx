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
  Cancel,
  BarChart,
  Refresh,
  InfoOutlined,
  OpenInNew,
  History,
} from "@mui/icons-material";
import { rentTicketApi } from "../../../api/rentTicketApi";
import { roomApi } from "../../../api/roomApi";
import { userApi } from "../../../api/userApi";
import { chemicalApi } from "../../../api/chemicalApi";
import "./AdminDashboard.css";

// ── Mock / Placeholder data ─────────────────────────────────
// TODO: Biểu đồ phiếu 7 ngày — cần backend bổ sung endpoint:
//   GET /tickets/admin/stats?startDate=...&endDate=...
//   hoặc GET /tickets/admin/stats/weekly
//   Trả về: [{ date, approved, rejected, pending }]
const WEEKLY_DATA = [
  { day: "T2", approved: 8, rejected: 2, pending: 3 },
  { day: "T3", approved: 12, rejected: 1, pending: 5 },
  { day: "T4", approved: 6, rejected: 3, pending: 2 },
  { day: "T5", approved: 15, rejected: 0, pending: 7 },
  { day: "T6", approved: 10, rejected: 2, pending: 4 },
  { day: "T7", approved: 4, rejected: 1, pending: 1 },
  { day: "CN", approved: 2, rejected: 0, pending: 2 },
];
const MAX_WEEKLY = Math.max(...WEEKLY_DATA.map((d) => d.approved + d.rejected + d.pending));

// TODO: Phòng Lab hôm nay — cần backend bổ sung endpoint:
//   GET /tickets/admin/active-borrowings
//   Trả về: [{ roomId, roomName, userId, userName, endTime }]
//   Hoặc: GET /rooms/current-usage
//   Hiện tại chỉ có isActive (hoạt động/ngừng) không có real-time occupancy
const ROOMS_MOCK = [
  { name: "TH Hóa 01", status: "occupied", user: "Nguyễn Văn An", until: "11:30" },
  { name: "TH Hóa 02", status: "available", user: null, until: null },
  { name: "Vật Lý B101", status: "occupied", user: "Lê Hoàng Nam", until: "14:00" },
  { name: "Vật Lý B202", status: "available", user: null, until: null },
  { name: "Sinh học S01", status: "maintenance", user: null, until: null },
  { name: "Điện tử E301", status: "occupied", user: "Trần Minh Tú", until: "16:30" },
];

// Loại phiếu map
const TICKET_TYPE_LABEL = {
  ROOM_ONLY: "Phòng Lab",
  CHEMICAL_ONLY: "Vật tư",
  ROOM_AND_CHEMICAL: "Phòng & Vật tư",
};

// Avatar màu cố định theo index
const AVATAR_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#6366f1"];

// ── Component chính ──────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();

  // ── State: Stats ─────────────────────────────────────────
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

  // ── Fetch tất cả stats song song ──────────────────────────
  const fetchDashboardData = useCallback(async () => {
    setStatsLoading(true);
    setTicketsLoading(true);

    try {
      const [pendingRes, roomsRes, usersRes, inventoryRes] = await Promise.allSettled([
        rentTicketApi.getAdminPending(),
        roomApi.getRooms({ status: "active", size: 1 }),
        userApi.getUsers({ size: 1 }),
        chemicalApi.getInventoryGlobal(),
      ]);

      // 1. Phiếu chờ duyệt (list + count)
      let pendingList = [];
      if (pendingRes.status === "fulfilled") {
        const data = pendingRes.value?.data;
        // API trả về array trực tiếp hoặc { content: [...] }
        pendingList = Array.isArray(data)
          ? data
          : Array.isArray(data?.content)
          ? data.content
          : [];
      }
      setTickets(pendingList);
      setTicketsLoading(false);

      // 2. Phòng đang hoạt động
      let activeRooms = 0;
      if (roomsRes.status === "fulfilled") {
        const data = roomsRes.value?.data;
        activeRooms =
          data?.totalElements ?? data?.data?.totalElements ?? 0;
      }

      // 3. Tổng người dùng
      let totalUsers = 0;
      if (usersRes.status === "fulfilled") {
        const data = usersRes.value?.data;
        totalUsers =
          data?.totalElements ?? data?.data?.totalElements ?? 0;
      }

      let lowStockCount = 0;
      if (inventoryRes.status === "fulfilled") {
        const inv = inventoryRes.value?.data;
        if (inv && typeof inv === "object") {
          lowStockCount = Object.values(inv).filter(
            (item) => (item?.grandTotal ?? 1) === 0
          ).length;
        }
      }

      setStats({
        pendingCount: pendingList.length,
        activeRooms,
        totalUsers,
        lowStockCount,
      });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ── STATS config (dùng data real) ─────────────────────────
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

  // ── Helper: render type badge ──────────────────────────────
  const getTicketTypeClass = (type) => {
    if (!type) return "material";
    if (type === "ROOM_ONLY" || type === "ROOM_AND_CHEMICAL") return "room";
    return "material";
  };

  const getTicketTypeLabel = (type) =>
    TICKET_TYPE_LABEL[type] || type || "—";

  const getTicketTypeIcon = (type) =>
    type === "ROOM_ONLY" ? (
      <MeetingRoom style={{ fontSize: 12 }} />
    ) : (
      <Science style={{ fontSize: 12 }} />
    );

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
          <button className="adnew-refresh-btn" onClick={fetchDashboardData} title="Tải lại dữ liệu">
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
          {/* Pending Tickets */}
          <div className="adnew-card">
            <div className="adnew-card-header">
              <div className="adnew-card-title-wrap">
                <HourglassEmpty className="adnew-card-icon" style={{ color: "#f59e0b" }} />
                <h2 className="adnew-card-title">
                  Phiếu chờ duyệt
                  {!ticketsLoading && (
                    <span className="adnew-badge-count">{tickets.length}</span>
                  )}
                </h2>
              </div>
              <button className="adnew-btn-link" onClick={() => navigate("/admin/tickets")}>
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
                <CheckCircle style={{ fontSize: 40, color: "#10b981", marginBottom: 8 }} />
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
                      style={{ background: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}
                    >
                      {(t.requesterName || t.userName || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="adnew-ticket-meta">
                      <div className="adnew-ticket-user">
                        {t.requesterName || t.userName || "Người dùng"}
                        <span className="adnew-ticket-role">
                          {t.requesterRole || t.role || ""}
                        </span>
                      </div>
                      <div className="adnew-ticket-detail">
                        <span className={`adnew-ticket-type ${getTicketTypeClass(t.ticketType)}`}>
                          {getTicketTypeIcon(t.ticketType)}
                          {getTicketTypeLabel(t.ticketType)}
                        </span>
                        {t.roomName ? t.roomName : t.ticketType === "CHEMICAL_ONLY" ? "Yêu cầu vật tư" : "—"}
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
                    <div className="adnew-ticket-actions"  onClick={(e) => e.stopPropagation()}>
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
                    Xem thêm {tickets.length - 5} phiếu khác <ArrowForward style={{ fontSize: 14 }} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Activity Feed — dùng audit-logs API nhưng format feed không có sẵn */}
          <div className="adnew-card">
            <div className="adnew-card-header">
              <div className="adnew-card-title-wrap">
                <History className="adnew-card-icon" style={{ color: "#3b82f6" }} />
                <h2 className="adnew-card-title">Hoạt động gần đây</h2>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  className="adnew-mock-badge"
                  title="Dữ liệu mẫu — cần backend bổ sung endpoint GET /audit-logs/feed trả về activity feed thân thiện"
                >
                  <InfoOutlined style={{ fontSize: 12 }} />
                  Dữ liệu mẫu
                </span>
                <button className="adnew-btn-link" onClick={() => navigate("/admin/audit-logs")}>
                  Xem logs <ArrowForward style={{ fontSize: 14 }} />
                </button>
              </div>
            </div>
            <div className="adnew-activity-explain">
              <History style={{ fontSize: 28, color: "#cbd5e1" }} />
              <div>
                <p className="adnew-activity-explain-title">Cần API rêtng</p>
                <p className="adnew-activity-explain-sub">
                  Hiện có <code>GET /audit-logs</code> nhưng trả về log kỹ thuật (action, entity, oldData/newData).
                  Cần backend bổ sung <code>GET /audit-logs/feed</code> để hiện
                  activity thân thiện cho dashboard.
                </p>
                <button
                  className="adnew-btn-link"
                  style={{ marginTop: 8 }}
                  onClick={() => navigate("/admin/audit-logs")}
                >
                  Xem Nhật ký Hệ thống ày →
                </button>
              </div>
            </div>
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
                  <span>{statsLoading ? "—" : stats.activeRooms} phòng đang hoạt động</span>
                </div>
                <div className="adnew-hero-stat">
                  <PeopleAlt style={{ fontSize: 14 }} />
                  <span>{statsLoading ? "—" : stats.totalUsers} người dùng</span>
                </div>
                <div className="adnew-hero-stat red">
                  <Inventory2 style={{ fontSize: 14 }} />
                  <span>{statsLoading ? "—" : stats.lowStockCount} vật tư hết hàng</span>
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

          {/* ── BIỂU ĐỒ PHIẾU 7 NGÀY ── */}
          <div className="adnew-card">
            <div className="adnew-card-header">
              <div className="adnew-card-title-wrap">
                <BarChart className="adnew-card-icon" style={{ color: "#6366f1" }} />
                <h2 className="adnew-card-title">Phiếu mượn 7 ngày qua</h2>
              </div>
              <span className="adnew-mock-badge" title="Dữ liệu mẫu — cần backend bổ sung API /tickets/admin/stats/weekly">
                <InfoOutlined style={{ fontSize: 12 }} />
                Dữ liệu mẫu
              </span>
            </div>

            {/* Legend */}
            <div className="adnew-chart-legend">
              <span className="adnew-legend-item">
                <span className="adnew-legend-dot" style={{ background: "#3b82f6" }} />
                Đã duyệt
              </span>
              <span className="adnew-legend-item">
                <span className="adnew-legend-dot" style={{ background: "#ef4444" }} />
                Từ chối
              </span>
              <span className="adnew-legend-item">
                <span className="adnew-legend-dot" style={{ background: "#f59e0b" }} />
                Đang xử lý
              </span>
            </div>

            {/* Bar Chart */}
            <div className="adnew-chart">
              {WEEKLY_DATA.map((d) => {
                const total = d.approved + d.rejected + d.pending;
                const empty = MAX_WEEKLY - total;
                return (
                  <div key={d.day} className="adnew-chart-col">
                    <div className="adnew-bar-wrap">
                      <div className="adnew-bar-empty" style={{ flex: empty > 0 ? empty : 0.01 }} />
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
                    <span className="adnew-chart-total">{total}</span>
                    <span className="adnew-chart-day">{d.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── TRẠNG THÁI PHÒNG LAB HÔM NAY ── */}
          <div className="adnew-card">
            <div className="adnew-card-header">
              <div className="adnew-card-title-wrap">
                <MeetingRoom className="adnew-card-icon" style={{ color: "#10b981" }} />
                <h2 className="adnew-card-title">Phòng Lab hôm nay</h2>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="adnew-mock-badge" title="Dữ liệu mẫu — cần backend: GET /rooms/current-usage trả về trạng thái real-time">
                  <InfoOutlined style={{ fontSize: 12 }} />
                  Dữ liệu mẫu
                </span>
                <button className="adnew-btn-link" onClick={() => navigate("/admin/rooms")}>
                  Quản lý <ArrowForward style={{ fontSize: 14 }} />
                </button>
              </div>
            </div>

            <div className="adnew-room-summary">
              <span className="adnew-room-pill occupied">
                {ROOMS_MOCK.filter((r) => r.status === "occupied").length} đang dùng
              </span>
              <span className="adnew-room-pill available">
                {ROOMS_MOCK.filter((r) => r.status === "available").length} trống
              </span>
              <span className="adnew-room-pill maintenance">
                {ROOMS_MOCK.filter((r) => r.status === "maintenance").length} bảo trì
              </span>
            </div>

            <div className="adnew-room-list">
              {ROOMS_MOCK.map((room, i) => (
                <div key={i} className={`adnew-room-item adnew-room-${room.status}`}>
                  <div className="adnew-room-indicator" />
                  <div className="adnew-room-info">
                    <span className="adnew-room-name">{room.name}</span>
                    {room.status === "occupied" && (
                      <span className="adnew-room-user">
                        {room.user} · đến {room.until}
                      </span>
                    )}
                    {room.status === "available" && (
                      <span className="adnew-room-user">Sẵn sàng sử dụng</span>
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
          </div>
        </div>
      </div>
    </div>
  );
}
