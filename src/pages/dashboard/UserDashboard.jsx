import React, { useEffect, useState } from "react";
import { Grid } from "@mui/material";
import {
  Science,
  MeetingRoom,
  MenuBook,
  Inventory,
  History,
  CheckCircle,
  ReportProblem,
  CalendarToday,
  SupervisorAccount,
  TrackChanges,
  InboxOutlined,
  AssignmentReturn,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { rentTicketApi } from "../../api/rentTicketApi";
import {
  TICKET_STATUS_MAP,
  TICKET_TYPE_MAP,
  mapPurpose,
} from "../MyTickets/hooks/useTickets";
import "./UserDashboard.css";

// Các status thuộc nhóm "đang xử lý" (tracking)
const ACTIVE_STATUSES = [
  "PENDING_OWNER",
  "PENDING_ADMIN",
  "APPROVED",
  "BORROWED",
  "PENDING_RETURN",
];

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function UserDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const isTeacher = user?.role === "TEACHER";
  const gridCol = isTeacher ? 3 : 4;

  const [stats, setStats] = useState({
    borrowed: 0,
    pending: 0,
    pendingReturn: 0,
    returned: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const [activeTickets, setActiveTickets] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Gọi song song: 4 API đếm stats + 1 API lấy danh sách bảng
        const [
          borrowedRes,
          pendingRes,
          pendingReturnRes,
          returnedRes,
          listRes,
        ] = await Promise.allSettled([
          rentTicketApi.getMyTicketsByStatus("BORROWED", 0, 1),
          rentTicketApi.getMyTicketsByStatus("PENDING_OWNER", 0, 1),
          rentTicketApi.getMyTicketsByStatus("PENDING_RETURN", 0, 1),
          rentTicketApi.getMyTicketsByStatus("RETURNED", 0, 1),
          rentTicketApi.getMyTicketsFiltered({
            excludeStatus: "RETURNED,REJECTED,CANCELLED",
            size: 500,
          }),
        ]);

        // Hàm helper lấy totalElements an toàn
        const getTotal = (settled) =>
          settled.status === "fulfilled"
            ? (settled.value.data?.totalElements ?? 0)
            : 0;

        setStats({
          borrowed: getTotal(borrowedRes),
          // Cộng cả PENDING_OWNER + PENDING_ADMIN vào "Chờ duyệt"
          // PENDING_ADMIN không cần call riêng vì đã có trong danh sách
          pending: getTotal(pendingRes),
          pendingReturn: getTotal(pendingReturnRes),
          returned: getTotal(returnedRes),
        });

        // Xử lý danh sách bảng
        if (listRes.status === "fulfilled") {
          const rawData =
            listRes.value.data?.content || listRes.value.data || [];
          const hydrated = rawData.map((t) => ({
            ...t,
            subject: t.subjectName || t.subject || "Chưa cập nhật môn",
            purpose: mapPurpose(t.purposeType),
          }));
          setActiveTickets(hydrated);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu dashboard:", err);
      } finally {
        setStatsLoading(false);
        setTableLoading(false);
      }
    };

    fetchAll();
  }, []);

  return (
    <div className="ud-wrapper">
      <div className="ud-hero-banner">
        <div className="ud-hero-content">
          <div className="ud-hero-eyebrow">Hệ thống đang hoạt động</div>
          <h1 className="ud-hero-title">Trung tâm Tri thức LabLab</h1>
          <p className="ud-hero-subtitle">
            Nền tảng tra cứu thông tin, đặt vé mượn theo ca và quản lý vật tư
            thí nghiệm thời gian thực.
          </p>
          <button className="ud-hero-btn" onClick={() => navigate("/wiki")}>
            <MenuBook fontSize="small" /> Truy cập Wiki
          </button>
        </div>
      </div>

      {/* ── Section 01: Đăng ký mượn mới ── */}
      <div className="ud-section-header">
        <span className="ud-section-number">01</span>
        <h2 className="ud-section-title">Đăng ký mượn mới</h2>
        <div className="ud-section-line" />
      </div>

      <Grid container spacing={3} mb={6}>
        <Grid size={{ xs: 12, sm: 6, md: gridCol }}>
          <div
            className="ud-action-card room"
            onClick={() => navigate("/borrow/room")}
          >
            <div className="ud-icon-wrapper room">
              <MeetingRoom fontSize="large" />
            </div>
            <div className="ud-action-info">
              <h3>Đăng Ký Phòng</h3>
              <p>Đặt lịch sử dụng phòng Lab</p>
            </div>
          </div>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: gridCol }}>
          <div
            className="ud-action-card chemical"
            onClick={() => navigate("/borrow/chemical")}
          >
            <div className="ud-icon-wrapper chemical">
              <Science fontSize="large" />
            </div>
            <div className="ud-action-info">
              <h3>Mượn Hóa Chất</h3>
              <p>Đăng ký vật tư & dụng cụ</p>
            </div>
          </div>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: gridCol }}>
          <div
            className="ud-action-card track"
            onClick={() => navigate("/my-tickets")}
          >
            <div className="ud-icon-wrapper track">
              <TrackChanges fontSize="large" />
            </div>
            <div className="ud-action-info">
              <h3>Phiếu Của Tôi</h3>
              <p>Theo dõi & lịch sử mượn</p>
            </div>
          </div>
        </Grid>

        {isTeacher && (
          <Grid size={{ xs: 12, sm: 6, md: gridCol }}>
            <div
              className="ud-action-card manage"
              onClick={() => navigate("/manage/assigned-rooms")}
            >
              <div className="ud-icon-wrapper manage">
                <SupervisorAccount fontSize="large" />
              </div>
              <div className="ud-action-info">
                <h3>Quản Lý Phòng</h3>
                <p>Duyệt yêu cầu sinh viên</p>
              </div>
            </div>
          </Grid>
        )}

        <Grid size={{ xs: 12, sm: 6, md: gridCol }}>
          <div
            className="ud-action-card report"
            onClick={() => navigate("/report")}
          >
            <div className="ud-icon-wrapper report">
              <ReportProblem fontSize="large" />
            </div>
            <div className="ud-action-info">
              <h3>Báo Cáo Sự Cố</h3>
              <p>Hư hỏng, mất mát thiết bị</p>
            </div>
          </div>
        </Grid>
      </Grid>

      {/* ── Section 02: Tổng quan cá nhân ── */}
      <div className="ud-section-header">
        <span className="ud-section-number">02</span>
        <h2 className="ud-section-title">Tổng quan cá nhân</h2>
        <div className="ud-section-line" />
      </div>

      <Grid container spacing={3} mb={6}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <div className="ud-stat-card">
            <div className="ud-stat-top">
              <span className="ud-stat-label">Đang mượn</span>
              <div className="ud-stat-badge borrow">
                <Inventory fontSize="small" />
              </div>
            </div>
            <div className="ud-stat-value">
              {statsLoading ? "..." : stats.borrowed}
            </div>
            <div className="ud-stat-trend">Ca mượn đang diễn ra</div>
          </div>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <div className="ud-stat-card">
            <div className="ud-stat-top">
              <span className="ud-stat-label">Chờ duyệt</span>
              <div className="ud-stat-badge pending">
                <History fontSize="small" />
              </div>
            </div>
            <div className="ud-stat-value">
              {statsLoading ? "..." : stats.pending}
            </div>
            <div className="ud-stat-trend">Yêu cầu đang chờ duyệt</div>
          </div>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <div className="ud-stat-card">
            <div className="ud-stat-top">
              <span className="ud-stat-label">Chờ xác nhận trả</span>
              <div className="ud-stat-badge pending-return">
                <AssignmentReturn fontSize="small" />
              </div>
            </div>
            <div className="ud-stat-value">
              {statsLoading ? "..." : stats.pendingReturn}
            </div>
            <div className="ud-stat-trend">Đang chờ giáo viên xác nhận</div>
          </div>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <div className="ud-stat-card">
            <div className="ud-stat-top">
              <span className="ud-stat-label">Hoàn tất</span>
              <div className="ud-stat-badge returned">
                <CheckCircle fontSize="small" />
              </div>
            </div>
            <div className="ud-stat-value">
              {statsLoading ? "..." : stats.returned}
            </div>
            <div className="ud-stat-trend">Lịch sử trả đồ an toàn</div>
          </div>
        </Grid>
      </Grid>

      {/* ── Section 03: Lịch trình mượn hiện tại ── */}
      <div className="ud-section-header">
        <span className="ud-section-number">03</span>
        <h2 className="ud-section-title">Lịch trình mượn hiện tại</h2>
        <div className="ud-section-line" />
      </div>

      <div className="ud-table-wrapper">
        {tableLoading ? (
          <div
            style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}
          >
            Đang tải...
          </div>
        ) : activeTickets.length === 0 ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              color: "#94a3b8",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <InboxOutlined style={{ fontSize: 40, opacity: 0.4 }} />
            <span>Không có phiếu nào đang xử lý</span>
          </div>
        ) : (
          <table className="ud-table">
            <thead>
              <tr>
                <th>Loại phiếu</th>
                <th>Phòng Lab</th>
                <th>Môn học</th>
                <th>Ngày mượn</th>
                <th>Dự kiến trả</th>
                <th>Trạng Thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {activeTickets.map((ticket) => {
                const statusInfo = TICKET_STATUS_MAP[ticket.status] || {};
                const typeInfo = TICKET_TYPE_MAP[ticket.ticketType] || {};

                return (
                  <tr key={ticket.ticketId}>
                    <td>
                      <span
                        className={`ud-type-badge ${
                          ticket.ticketType === "ROOM_ONLY"
                            ? "room"
                            : "chemical"
                        }`}
                      >
                        {typeInfo.short || ticket.ticketType}
                      </span>
                    </td>
                    <td>
                      <span className="ud-item-name">
                        {ticket.roomName || "—"}
                      </span>
                    </td>
                    <td>
                      <span className="ud-item-desc">
                        {ticket.subject}
                        {ticket.classCode ? ` — ${ticket.classCode}` : ""}
                      </span>
                    </td>
                    <td>
                      <div className="ud-date-item">
                        <CalendarToday fontSize="small" />
                        {formatDate(ticket.borrowDate)}
                      </div>
                    </td>
                    <td>
                      <div className="ud-date-item">
                        <CalendarToday fontSize="small" />
                        {formatDate(ticket.expectedReturnDate)}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`ud-status-chip ${statusInfo.cls || ""}`}
                      >
                        {statusInfo.label || ticket.status}
                      </span>
                    </td>
                    <td>
                      <div className="ud-action-btns">
                        <button
                          className="ud-btn-small primary"
                          onClick={() => navigate("/my-tickets")}
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
