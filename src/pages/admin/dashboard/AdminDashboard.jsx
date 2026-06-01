import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowForward,
  Receipt,
  MeetingRoom,
  Inventory2,
  PeopleAlt,
  TrendingUp,
  TrendingDown,
  FiberManualRecord,
  AccessTime,
  Science,
  CheckCircle,
  HourglassEmpty,
  Cancel,
  BarChart,
  Circle,
} from "@mui/icons-material";
import "./AdminDashboard.css";

// ── Mock Data ────────────────────────────────────────────────
const STATS = [
  {
    id: "tickets",
    label: "Phiếu chờ duyệt",
    value: "12",
    change: "+3",
    up: true,
    icon: <Receipt />,
    color: "blue",
    path: "/admin/tickets",
  },
  {
    id: "rooms",
    label: "Phòng đang hoạt động",
    value: "8",
    change: "+1",
    up: true,
    icon: <MeetingRoom />,
    color: "green",
    path: "/admin/rooms",
  },
  {
    id: "materials",
    label: "Vật tư cảnh báo",
    value: "5",
    change: "+2",
    up: false,
    icon: <Inventory2 />,
    color: "orange",
    path: "/admin/materials",
  },
  {
    id: "users",
    label: "Người dùng",
    value: "124",
    change: "+7",
    up: true,
    icon: <PeopleAlt />,
    color: "purple",
    path: "/admin/users",
  },
];

const PENDING_TICKETS = [
  {
    id: 1,
    user: "Nguyễn Văn An",
    role: "Giảng viên",
    type: "room",
    detail: "Phòng Thực Hành Hóa 01",
    time: "10 phút trước",
    avatar: "A",
    avatarColor: "#3b82f6",
  },
  {
    id: 2,
    user: "Trần Thị Bình",
    role: "Sinh viên",
    type: "material",
    detail: "Axit Sunfuric (2 Lít)",
    time: "25 phút trước",
    avatar: "B",
    avatarColor: "#8b5cf6",
  },
  {
    id: 3,
    user: "Lê Minh Cường",
    role: "Giảng viên",
    type: "room",
    detail: "Phòng Vật Lý B202",
    time: "1 giờ trước",
    avatar: "C",
    avatarColor: "#10b981",
  },
  {
    id: 4,
    user: "Phạm Thị Duyên",
    role: "Sinh viên",
    type: "material",
    detail: "NaOH (500g), HCl (1L)",
    time: "2 giờ trước",
    avatar: "D",
    avatarColor: "#f59e0b",
  },
];

const RECENT_ACTIVITY = [
  { id: 1, text: "Nguyễn Văn An được phê duyệt mượn phòng TH Hóa 01", time: "5 phút trước", status: "approved" },
  { id: 2, text: "Phiếu mượn Acetic Anhydride bị từ chối (hết hàng)", time: "20 phút trước", status: "rejected" },
  { id: 3, text: "Lê Hoàng Nam trả lại Phòng Vật Lý B101", time: "45 phút trước", status: "returned" },
  { id: 4, text: "Thêm 10 Lọ NaOH vào kho vật tư Lab 3", time: "1 giờ trước", status: "added" },
  { id: 5, text: "Phân quyền: TS. Trần Minh quản lý Phòng TH Hóa", time: "2 giờ trước", status: "system" },
];

// Biểu đồ phiếu 7 ngày — [T2..CN]
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

// Trạng thái phòng Lab
const ROOMS = [
  { name: "TH Hóa 01", status: "occupied", user: "Nguyễn Văn An", until: "11:30" },
  { name: "TH Hóa 02", status: "available", user: null, until: null },
  { name: "Vật Lý B101", status: "occupied", user: "Lê Hoàng Nam", until: "14:00" },
  { name: "Vật Lý B202", status: "available", user: null, until: null },
  { name: "Sinh học S01", status: "maintenance", user: null, until: null },
  { name: "Điện tử E301", status: "occupied", user: "Trần Minh Tú", until: "16:30" },
];

// ── Component chính ──────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState(PENDING_TICKETS);

  const handleApprove = (id) => setTickets((prev) => prev.filter((t) => t.id !== id));
  const handleReject = (id) => setTickets((prev) => prev.filter((t) => t.id !== id));

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

      {/* ── STATS GRID ── */}
      <div className="adnew-stats-grid">
        {STATS.map((s) => (
          <div
            key={s.id}
            className={`adnew-stat-card adnew-stat-${s.color}`}
            onClick={() => navigate(s.path)}
          >
            <div className="adnew-stat-icon">{s.icon}</div>
            <div className="adnew-stat-body">
              <span className="adnew-stat-label">{s.label}</span>
              <span className="adnew-stat-value">{s.value}</span>
            </div>
            <div className={`adnew-stat-badge ${s.up ? "up" : "down"}`}>
              {s.up ? <TrendingUp style={{ fontSize: 14 }} /> : <TrendingDown style={{ fontSize: 14 }} />}
              {s.change}
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
                  <span className="adnew-badge-count">{tickets.length}</span>
                </h2>
              </div>
              <button className="adnew-btn-link" onClick={() => navigate("/admin/tickets")}>
                Xem tất cả <ArrowForward style={{ fontSize: 14 }} />
              </button>
            </div>

            {tickets.length === 0 ? (
              <div className="adnew-empty-state">
                <CheckCircle style={{ fontSize: 40, color: "#10b981", marginBottom: 8 }} />
                <p>Không còn phiếu nào cần xử lý!</p>
              </div>
            ) : (
              <div className="adnew-ticket-list">
                {tickets.map((t) => (
                  <div key={t.id} className="adnew-ticket">
                    <div
                      className="adnew-ticket-avatar"
                      style={{ background: t.avatarColor }}
                    >
                      {t.avatar}
                    </div>
                    <div className="adnew-ticket-meta">
                      <div className="adnew-ticket-user">
                        {t.user}
                        <span className="adnew-ticket-role">{t.role}</span>
                      </div>
                      <div className="adnew-ticket-detail">
                        <span className={`adnew-ticket-type ${t.type}`}>
                          {t.type === "room" ? <MeetingRoom style={{ fontSize: 12 }} /> : <Science style={{ fontSize: 12 }} />}
                          {t.type === "room" ? "Phòng Lab" : "Vật tư"}
                        </span>
                        {t.detail}
                      </div>
                      <div className="adnew-ticket-time">
                        <AccessTime style={{ fontSize: 11 }} />
                        {t.time}
                      </div>
                    </div>
                    <div className="adnew-ticket-actions">
                      <button
                        className="adnew-btn-reject"
                        onClick={() => handleReject(t.id)}
                        title="Từ chối"
                      >
                        <Cancel style={{ fontSize: 16 }} />
                        Từ chối
                      </button>
                      <button
                        className="adnew-btn-approve"
                        onClick={() => handleApprove(t.id)}
                        title="Phê duyệt"
                      >
                        <CheckCircle style={{ fontSize: 16 }} />
                        Duyệt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Feed */}
          <div className="adnew-card">
            <div className="adnew-card-header">
              <div className="adnew-card-title-wrap">
                <AccessTime className="adnew-card-icon" style={{ color: "#3b82f6" }} />
                <h2 className="adnew-card-title">Hoạt động gần đây</h2>
              </div>
            </div>
            <div className="adnew-activity-list">
              {RECENT_ACTIVITY.map((act) => (
                <div key={act.id} className="adnew-activity-item">
                  <div className={`adnew-activity-dot adnew-dot-${act.status}`} />
                  <div className="adnew-activity-content">
                    <span className="adnew-activity-text">{act.text}</span>
                    <span className="adnew-activity-time">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CỘT PHẢI ── */}
        <div className="adnew-col-side">
          {/* Hero Summary */}
          <div className="adnew-hero-card">
            <div className="adnew-hero-bg-orb" />
            <div className="adnew-hero-content">
              <p className="adnew-hero-label">Tổng phiếu hôm nay</p>
              <div className="adnew-hero-number">28</div>
              <div className="adnew-hero-stats">
                <div className="adnew-hero-stat">
                  <CheckCircle style={{ fontSize: 14 }} />
                  <span>18 đã duyệt</span>
                </div>
                <div className="adnew-hero-stat">
                  <HourglassEmpty style={{ fontSize: 14 }} />
                  <span>7 đang xử lý</span>
                </div>
                <div className="adnew-hero-stat red">
                  <Cancel style={{ fontSize: 14 }} />
                  <span>3 từ chối</span>
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
                      {/* khoảng trống trên cùng */}
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
              <button className="adnew-btn-link" onClick={() => navigate("/admin/rooms")}>
                Quản lý <ArrowForward style={{ fontSize: 14 }} />
              </button>
            </div>

            {/* Summary pills */}
            <div className="adnew-room-summary">
              <span className="adnew-room-pill occupied">
                {ROOMS.filter((r) => r.status === "occupied").length} đang dùng
              </span>
              <span className="adnew-room-pill available">
                {ROOMS.filter((r) => r.status === "available").length} trống
              </span>
              <span className="adnew-room-pill maintenance">
                {ROOMS.filter((r) => r.status === "maintenance").length} bảo trì
              </span>
            </div>

            {/* Room List */}
            <div className="adnew-room-list">
              {ROOMS.map((room, i) => (
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
