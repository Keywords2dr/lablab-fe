import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";

import { Avatar, Menu, MenuItem, ListItemIcon } from "@mui/material";
import { Logout } from "@mui/icons-material";

import NotificationBell from "../../common/NotificationBell";
import SidebarNav from "./SidebarNav";

import "./AdminLayout.css";

export default function AdminLayout() {
  const navigate         = useNavigate();
  const { user, logout } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate("/login");
  };

  return (
    <div className="admin-layout-root">
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo" onClick={() => navigate("/admin")}>
          Lab<span>Lab.</span>
        </div>
        <SidebarNav />
      </aside>

      {/* ── Main area ── */}
      <div className="admin-main-wrapper">
        <header className="admin-topbar">
          <div className="admin-topbar-title">Khu vực Quản Trị Viên</div>

          <div className="admin-topbar-actions">
            <NotificationBell onViewAll={() => navigate("/notifications")} />

            <div
              className="admin-profile-section"
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              <div className="admin-profile-info">
                <strong>{user?.username || "Admin"}</strong>
                <span>{user?.role || "ADMIN"}</span>
              </div>
              <Avatar sx={{ bgcolor: "#0f172a", width: 36, height: 36 }}>
                {user?.username?.charAt(0)?.toUpperCase() || "A"}
              </Avatar>
            </div>
          </div>
        </header>

        <main className="admin-content-area">
          <Outlet />
        </main>
      </div>

      {/* ── Avatar dropdown menu ── */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <Logout fontSize="small" color="error" />
          </ListItemIcon>
          Đăng xuất
        </MenuItem>
      </Menu>
    </div>
  );
}
