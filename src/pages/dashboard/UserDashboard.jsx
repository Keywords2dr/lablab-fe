import React from "react";
import { Grid } from "@mui/material";
import {
  Science,
  MeetingRoom,
  MenuBook,
  ArrowForward,
  Inventory,
  History,
  CheckCircle,
  ReportProblem,
  AccessTime,
  CalendarToday,
  SupervisorAccount,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import "./UserDashboard.css";

export default function UserDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const isTeacher = user?.role === "TEACHER";

  const gridCol = isTeacher ? 3 : 4;

  return (
    <div className="ud-wrapper">
      {/* ── 1. HERO BANNER ───────────────────────────────── */}
      <div className="ud-hero-banner">
        <div className="ud-hero-content">
          <div className="ud-hero-eyebrow">Hệ thống đang hoạt động</div>
          <h1 className="ud-hero-title">Trung tâm Tri thức LabLab</h1>
          <p className="ud-hero-subtitle">
            Nền tảng tra cứu thông tin, đặt vé mượn theo ca và quản lý vật tư
            thí nghiệm thời gian thực.
          </p>
          <button
            className="ud-hero-btn"
            onClick={() => navigate("/wiki")}   // ← Đã sửa ở đây
          >
            <MenuBook fontSize="small" /> Truy cập Wiki
          </button>
        </div>
      </div>

      {/* ── 2. PHÍM TẮT THAO TÁC ─────────────────────────── */}
      <div className="ud-section-header">
        <span className="ud-section-number">01</span>
        <h2 className="ud-section-title">Phím tắt thao tác</h2>
        <div className="ud-section-line" />
      </div>

      <Grid container spacing={3} mb={6}>
        <Grid item xs={12} sm={6} md={gridCol}>
          <div
            className="ud-action-card chemical"
            onClick={() => navigate("/borrow/chemical")}
          >
            <div className="ud-icon-wrapper chemical">
              <Science fontSize="large" />
            </div>
            <div className="ud-action-info">
              <h3>Mượn Hóa Chất</h3>
              <p>Đăng ký vật tư theo ca</p>
            </div>
          </div>
        </Grid>

        <Grid item xs={12} sm={6} md={gridCol}>
          <div
            className="ud-action-card room"
            onClick={() => navigate("/borrow/room")}
          >
            <div className="ud-icon-wrapper room">
              <MeetingRoom fontSize="large" />
            </div>
            <div className="ud-action-info">
              <h3>Đăng Ký Phòng</h3>
              <p>Đặt lịch sử dụng phòng</p>
            </div>
          </div>
        </Grid>

        {/* NẾU LÀ TEACHER -> HIỆN THÊM Ô QUẢN LÝ PHÒNG */}
        {isTeacher && (
          <Grid item xs={12} sm={6} md={gridCol}>
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

        <Grid item xs={12} sm={6} md={gridCol}>
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

      {/* ── 3. THỐNG KÊ CHI TIẾT ─────────────────────────── */}
      <div className="ud-section-header">
        <span className="ud-section-number">02</span>
        <h2 className="ud-section-title">Tổng quan cá nhân</h2>
        <div className="ud-section-line" />
      </div>

      <Grid container spacing={3} mb={6}>
        <Grid item xs={12} sm={6} md={3}>
          <div className="ud-stat-card">
            <div className="ud-stat-top">
              <span className="ud-stat-label">Đang mượn</span>
              <div className="ud-stat-badge borrow">
                <Inventory fontSize="small" />
              </div>
            </div>
            <div className="ud-stat-value">3</div>
            <div className="ud-stat-trend">Ca mượn đang diễn ra</div>
          </div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <div className="ud-stat-card">
            <div className="ud-stat-top">
              <span className="ud-stat-label">Chờ duyệt</span>
              <div className="ud-stat-badge pending">
                <History fontSize="small" />
              </div>
            </div>
            <div className="ud-stat-value">1</div>
            <div className="ud-stat-trend">Yêu cầu đang chờ duyệt</div>
          </div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <div className="ud-stat-card">
            <div className="ud-stat-top">
              <span className="ud-stat-label">Cảnh báo trả</span>
              <div className="ud-stat-badge danger">
                <AccessTime fontSize="small" />
              </div>
            </div>
            <div className="ud-stat-value">1</div>
            <div className="ud-stat-trend danger-text">
              Sắp kết thúc ca mượn!
            </div>
          </div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <div className="ud-stat-card">
            <div className="ud-stat-top">
              <span className="ud-stat-label">Hoàn tất</span>
              <div className="ud-stat-badge returned">
                <CheckCircle fontSize="small" />
              </div>
            </div>
            <div className="ud-stat-value">15</div>
            <div className="ud-stat-trend">Lịch sử trả đồ an toàn</div>
          </div>
        </Grid>
      </Grid>

      {/* ── 4. BẢNG LỊCH SỬ THỰC TẾ (THEO CA) ─────────────── */}
      <div className="ud-section-header">
        <span className="ud-section-number">03</span>
        <h2 className="ud-section-title">Lịch trình mượn hiện tại</h2>
        <div className="ud-section-line" />
      </div>

      <div className="ud-table-wrapper">
        <table className="ud-table">
          <thead>
            <tr>
              <th>Vật tư / Phòng Lab</th>
              <th>Ngày Đăng Ký</th>
              <th>Khung giờ (Ca mượn)</th>
              <th>Trạng Thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {/* Dòng 1: Đang mượn */}
            <tr>
              <td>
                <span className="ud-item-name">Phòng Thực Hành Hóa 01</span>
                <span className="ud-item-desc">Mã phiếu: RL022</span>
              </td>
              <td>
                <div className="ud-date-item">
                  <CalendarToday fontSize="small" /> 19/04/2026
                </div>
              </td>
              <td>
                <div className="ud-date-group">
                  <div className="ud-date-item danger">
                    <AccessTime fontSize="small" />{" "}
                    <strong>18:30 - 22:30 (Ca Tối)</strong>
                  </div>
                </div>
              </td>
              <td>
                <span className="ud-status-chip active">Đang mượn</span>
              </td>
              <td>
                <div className="ud-action-btns">
                  <button className="ud-btn-small primary">
                    Bàn giao & Trả
                  </button>
                  <button className="ud-btn-small">Báo sự cố</button>
                </div>
              </td>
            </tr>

            {/* Dòng 2: Chờ duyệt */}
            <tr>
              <td>
                <span className="ud-item-name">Ống nghiệm thủy tinh x10</span>
                <span className="ud-item-desc">Mã phiếu: PM045</span>
              </td>
              <td>
                <div className="ud-date-item">
                  <CalendarToday fontSize="small" /> 20/04/2026
                </div>
              </td>
              <td>
                <div className="ud-date-group">
                  <div className="ud-date-item">
                    <AccessTime fontSize="small" />{" "}
                    <strong>07:30 - 11:30 (Ca Sáng)</strong>
                  </div>
                </div>
              </td>
              <td>
                <span className="ud-status-chip waiting">Chờ duyệt</span>
              </td>
              <td>
                <div className="ud-action-btns">
                  <button className="ud-btn-small">Hủy yêu cầu</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}