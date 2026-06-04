import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";

import { Avatar, Menu, MenuItem, ListItemIcon } from "@mui/material";
import { Logout, Person, Lock, ScienceOutlined } from "@mui/icons-material";

import NotificationBell from "../../common/NotificationBell";
import AIChatBox from "../../common/AIChatBox";
import ChangePasswordDialog from "./ChangePasswordDialog";
import { useChangePassword } from "./useChangePassword";

import "./MainLayout.css";

export default function MainLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const {
    open: pwOpen,
    loading: pwLoading,
    passData,
    showPass,
    openDialog,
    closeDialog,
    toggleShow,
    setField,
    handleSubmit,
  } = useChangePassword();

  const handleCloseMenu = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleCloseMenu();
    logout();
    navigate("/login");
  };

  return (
    <div className="layout-root">
      {/* ── Topbar ── */}
      <header className="user-topbar">
        <div className="user-logo" onClick={() => navigate("/")}>
          <ScienceOutlined sx={{ color: "#2563eb" }} />
          Lab<span>Lab</span>.
        </div>

        <div className="topbar-right">
          <NotificationBell onViewAll={() => navigate("/notifications")} />

          <div
            className="avatar-section"
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <div className="user-info">
              <div className="username">{user?.username || "Guest"}</div>
              <div className="role">{user?.role || "STUDENT"}</div>
            </div>
            <Avatar sx={{ bgcolor: "#2563eb" }}>
              {user?.username?.charAt(0)?.toUpperCase() || "U"}
            </Avatar>
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="layout-content">
        <Outlet />
      </main>

      {/* ── Avatar dropdown menu ── */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        disableScrollLock
      >
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            navigate("/profile");
          }}
        >
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          Hồ sơ cá nhân
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleCloseMenu();
            openDialog();
          }}
        >
          <ListItemIcon>
            <Lock fontSize="small" />
          </ListItemIcon>
          Đổi mật khẩu
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <Logout fontSize="small" color="error" />
          </ListItemIcon>
          Đăng xuất
        </MenuItem>
      </Menu>

      {/* ── Change Password Dialog ── */}
      <ChangePasswordDialog
        open={pwOpen}
        loading={pwLoading}
        passData={passData}
        showPass={showPass}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        onToggleShow={toggleShow}
        onSetField={setField}
      />

      {/* AI Chat Assistant Widget */}
      <AIChatBox />
    </div>
  );
}
