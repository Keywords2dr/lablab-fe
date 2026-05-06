import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { 
  Grid, Typography, Badge, Avatar, 
  Menu, MenuItem, ListItemIcon 
} from "@mui/material";
import {
  AssignmentLate, Inventory, PeopleAlt, ReportProblem,
  CheckCircle, Cancel, Dashboard, Receipt, MeetingRoom,
  WarningAmber, History, Settings, Notifications,
  Logout
} from "@mui/icons-material";
import "./AdminDashboard.css"; 

export default function AdminDashboard() {
  const navigate = useNavigate();

  // =====================================
  // STATE & HÀM XỬ LÝ MENU AVATAR
  // =====================================
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleCloseMenu();
    // Xóa token hoặc gọi API đăng xuất ở đây
    
    // Đã xóa dòng alert ở đây, chuyển thẳng trang
    navigate("/login"); 
  };

  return (
    <div className="app-layout">
      {/* =====================
          1. SIDEBAR (MENU TRÁI)
      ====================== */}
      <aside className="sidebar">
        <div className="sidebar-logo" onClick={() => navigate("/admin")}>
          Lab<span>Lab.</span>
        </div>

        <div className="sidebar-menu-group">
          <p className="menu-title">CHỨC NĂNG CHÍNH</p>
          <ul className="menu-list">
            <li className="menu-item active">
              <Dashboard fontSize="small" /> <span>Tổng Quan</span>
            </li>
            <li className="menu-item">
              <Receipt fontSize="small" /> <span>Duyệt Phiếu Mượn</span>
            </li>
            <li className="menu-item">
              <Inventory fontSize="small" /> <span>Quản lý Vật tư</span>
            </li>
            <li className="menu-item">
              <MeetingRoom fontSize="small" /> <span>Quản lý Phòng Lab</span>
            </li>
            <li className="menu-item">
              <PeopleAlt fontSize="small" /> <span>Quản lý Người dùng</span>
            </li>
          </ul>
        </div>

        <div className="sidebar-menu-group">
          <p className="menu-title">QUẢN TRỊ & GIÁM SÁT</p>
          <ul className="menu-list">
            <li className="menu-item">
              <WarningAmber fontSize="small" /> <span>Báo cáo Sự cố</span>
            </li>
            <li className="menu-item">
              <History fontSize="small" /> <span>Nhật ký Hệ thống</span>
            </li>
          </ul>
        </div>

        <div className="sidebar-menu-group" style={{ marginTop: 'auto' }}>
          <p className="menu-title">HỆ THỐNG</p>
          <ul className="menu-list">
            <li className="menu-item">
              <Settings fontSize="small" /> <span>Cài đặt chung</span>
            </li>
          </ul>
        </div>
      </aside>

      {/* =====================
          2. RIGHT AREA (TOPBAR & CONTENT)
      ====================== */}
      <div className="main-wrapper">
        
        {/* --- TOPBAR --- */}
        <header className="topbar">
          <Typography variant="subtitle1" fontWeight="600" color="#64748b">
            Khu vực Quản Trị Viên (Admin)
          </Typography>
          <div className="topbar-actions">
            <Badge badgeContent={12} color="error" className="notification-badge">
              <Notifications color="action" />
            </Badge>

            {/* AVATAR KHU VỰC CLICK */}
            <div 
              className="admin-profile" 
              onClick={handleAvatarClick}
              style={{ cursor: 'pointer' }}
            >
              <div className="admin-info">
                <strong>admin</strong>
                <span>ADMIN</span>
              </div>
              <Avatar sx={{ bgcolor: '#0f172a', width: 36, height: 36 }}>A</Avatar>
            </div>

            {/* MENU DROPDOWN (Chỉ còn nút Đăng xuất) */}
            <Menu
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleCloseMenu}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              sx={{ zIndex: 10000 }} 
              PaperProps={{
                elevation: 3,
                sx: { mt: 1.5, minWidth: 160, borderRadius: '12px' }
              }}
            >
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <ListItemIcon><Logout fontSize="small" color="error" /></ListItemIcon>
                Đăng xuất
              </MenuItem>
            </Menu>

          </div>
        </header>

        {/* --- MAIN CONTENT --- */}
        <main className="content-area">
          <Typography variant="h5" fontWeight="800" color="#0f172a" mb={4}>
            Tổng quan Hệ thống
          </Typography>

          <Grid container spacing={3} mb={6}>
            <Grid item xs={12} sm={6} md={3}>
              <div className="admin-card">
                <div className="ac-info">
                  <h4>CHỜ PHÊ DUYỆT</h4>
                  <h2>12</h2>
                </div>
                <div className="ac-icon orange"><AssignmentLate fontSize="large" /></div>
              </div>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <div className="admin-card">
                <div className="ac-info">
                  <h4>VẬT TƯ ĐANG MƯỢN</h4>
                  <h2>85</h2>
                </div>
                <div className="ac-icon blue"><Inventory fontSize="large" /></div>
              </div>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <div className="admin-card">
                <div className="ac-info">
                  <h4>TỔNG NGƯỜI DÙNG</h4>
                  <h2>450</h2>
                </div>
                <div className="ac-icon green"><PeopleAlt fontSize="large" /></div>
              </div>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <div className="admin-card">
                <div className="ac-info">
                  <h4>CẢNH BÁO VẬT TƯ</h4>
                  <h2>3</h2>
                </div>
                <div className="ac-icon red"><ReportProblem fontSize="large" /></div>
              </div>
            </Grid>
          </Grid>

          <Typography variant="h6" fontWeight="700" color="#0f172a" mb={2}>
            Yêu cầu cần xử lý ngay
          </Typography>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã Phiếu</th>
                  <th>Người Yêu Cầu</th>
                  <th>Chi tiết mượn</th>
                  <th>Khung giờ sử dụng</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>PM089</strong></td>
                  <td>
                    <div style={{ fontWeight: 600, color: "#0f172a" }}>Nguyễn Văn A</div>
                    <span className="role-badge teacher">GIẢNG VIÊN</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>Phòng Thực Hành Hóa 01</div>
                    <div style={{ fontSize: "0.85rem", color: "#64748b" }}>Đăng ký dạy thực hành</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>20/04/2026</div>
                    <div style={{ color: "#2563eb", fontSize: "0.85rem", fontWeight: 600 }}>Ca Sáng (07:30 - 11:30)</div>
                  </td>
                  <td>
                    <button className="action-btn btn-approve"><CheckCircle fontSize="small" /> Duyệt</button>
                    <button className="action-btn btn-reject"><Cancel fontSize="small" /> Từ chối</button>
                  </td>
                </tr>
                <tr>
                  <td><strong>PM090</strong></td>
                  <td>
                    <div style={{ fontWeight: 600, color: "#0f172a" }}>Trần Thị B</div>
                    <span className="role-badge student">SINH VIÊN</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>Axit Sunfuric (H2SO4) x2 Lít</div>
                    <div style={{ fontSize: "0.85rem", color: "#64748b" }}>Dùng cho báo cáo đồ án</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>22/04/2026</div>
                    <div style={{ color: "#2563eb", fontSize: "0.85rem", fontWeight: 600 }}>Ca Chiều (13:30 - 17:00)</div>
                  </td>
                  <td>
                    <button className="action-btn btn-approve"><CheckCircle fontSize="small" /> Duyệt</button>
                    <button className="action-btn btn-reject"><Cancel fontSize="small" /> Từ chối</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}