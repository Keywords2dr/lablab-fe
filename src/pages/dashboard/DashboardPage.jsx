import React, { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import UserDashboard from "./UserDashboard";
import {
  Avatar,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import {
  Dashboard,
  Science,
  MeetingRoom,
  People,
  Assignment,
  Settings,
  Notifications,
  Logout,
  Person,
  ReportProblem,
  ManageHistory,
  ScienceOutlined,
} from "@mui/icons-material";
import "./DashboardPage.css";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate("/login");
  };

  const isAdmin = user?.role === "ADMIN";

  const userProfileSection = (
    <div className="topbar-right">
      <IconButton>
        <Badge badgeContent={isAdmin ? 12 : 2} color="error">
          <Notifications sx={{ color: "#64748b" }} />
        </Badge>
      </IconButton>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          cursor: "pointer",
        }}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        <div
          style={{ textAlign: "right", display: { xs: "none", sm: "block" } }}
        >
          <div
            style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a" }}
          >
            {user?.username || "Guest"}
          </div>
          <div
            style={{
              fontSize: "0.75rem",
              color: "#64748b",
              textTransform: "uppercase",
            }}
          >
            {user?.role || "STUDENT"}
          </div>
        </div>
        <Avatar
          sx={{
            bgcolor: isAdmin ? "#0f172a" : "#2563eb",
            width: 40,
            height: 40,
            fontWeight: "bold",
          }}
        >
          {user?.username?.charAt(0).toUpperCase() || "U"}
        </Avatar>
      </div>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        PaperProps={{
          elevation: 3,
          sx: { mt: 1.5, minWidth: 180, borderRadius: 2 },
        }}
      >
        <MenuItem onClick={() => setAnchorEl(null)}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>{" "}
          Hồ sơ cá nhân
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <Logout fontSize="small" color="error" />
          </ListItemIcon>{" "}
          Đăng xuất
        </MenuItem>
      </Menu>
    </div>
  );

  if (isAdmin) {
    return (
      <div className="admin-layout-root">
        <aside className="sidebar">
          <div className="sidebar-logo">
            Lab<span>Lab</span>.
          </div>
          <div className="sidebar-menu">
            <div className="menu-label">Chức năng chính</div>
            <div className="nav-item active">
              <Dashboard /> Tổng Quan
            </div>
            <div className="nav-item">
              <Assignment /> Duyệt Phiếu Mượn
            </div>
            <div className="nav-item">
              <Science /> Quản lý Vật tư
            </div>
            <div className="nav-item">
              <MeetingRoom /> Quản lý Phòng Lab
            </div>
            <div className="nav-item">
              <People /> Quản lý Người dùng
            </div>

            <div className="menu-label">Quản trị & Giám sát</div>
            <div className="nav-item">
              <ReportProblem /> Báo cáo Sự cố
            </div>
            <div className="nav-item">
              <ManageHistory /> Nhật ký Hệ thống
            </div>

            <div className="menu-label" style={{ marginTop: "auto" }}>
              Hệ thống
            </div>
            <div className="nav-item">
              <Settings /> Cài đặt chung
            </div>
          </div>
        </aside>

        <main className="main-wrapper">
          <header className="topbar">
            <div
              style={{ fontWeight: 600, color: "#475569", fontSize: "1.1rem" }}
            >
              Khu vực Quản Trị Viên (Admin)
            </div>
            {userProfileSection}
          </header>
          <div className="content-area">
            <AdminDashboard />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="user-layout-root">
      <header className="user-topbar">
        <div className="user-logo" onClick={() => navigate("/")}>
          <ScienceOutlined sx={{ color: "#2563eb", fontSize: 28 }} />
          Lab<span>Lab</span>.
        </div>

        {userProfileSection}
      </header>

      <div className="user-content-area">
        <UserDashboard />
      </div>
    </div>
  );
}
