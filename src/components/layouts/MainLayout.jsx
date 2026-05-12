import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { userApi } from "../../api/userApi";
import { toast } from "react-toastify";

import {
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  InputAdornment,
} from "@mui/material";

import {
  Logout,
  Person,
  Lock,
  Visibility,
  VisibilityOff,
  ScienceOutlined,
} from "@mui/icons-material";

import NotificationBell from "../../components/common/NotificationBell";
import "./MainLayout.css";

export default function MainLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // ========================
  // STATE
  // ========================
  const [anchorEl, setAnchorEl] = useState(null);
  const [openPassword, setOpenPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [passData, setPassData] = useState({
    old: "",
    new: "",
    confirm: "",
  });

  // ========================
  // HANDLERS
  // ========================
  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate("/login");
  };

  const closePasswordModal = () => {
    setOpenPassword(false);
    setPassData({ old: "", new: "", confirm: "" });
    setShowPassword(false);
  };

  const handleChangePassword = async () => {
    const { old, new: newPass, confirm } = passData;

    if (!old || !newPass || !confirm) {
      return toast.warning("Vui lòng nhập đầy đủ!");
    }

    if (newPass !== confirm) {
      return toast.warning("Mật khẩu không khớp!");
    }

    try {
      await userApi.changePassword({
        oldPassword: old,
        newPassword: newPass,
        confirmPassword: confirm,
      });

      toast.success("Đổi mật khẩu thành công!");
      closePasswordModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Đổi mật khẩu thất bại!");
    }
  };

  // ========================
  // RENDER
  // ========================
  return (
    <div className="layout-root">
      {/* HEADER */}
      <header className="user-topbar">
        {/* LOGO */}
        <div className="user-logo" onClick={() => navigate("/")}>
          <ScienceOutlined sx={{ color: "#2563eb" }} />
          Lab<span>Lab</span>.
        </div>

        {/* RIGHT */}
        <div className="topbar-right">
          <NotificationBell />

          {/* USER */}
          <div
            className="avatar-section"
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <div className="user-info">
              <div className="username">{user?.username || "Guest"}</div>
              <div className="role">{user?.role || "STUDENT"}</div>

              {/* ADMIN QUICK LINK */}
              {user?.role?.toLowerCase() === "admin" && (
                <div
                  className="admin-link"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/admin");
                  }}
                >
                  Quản trị hệ thống
                </div>
              )}
            </div>

            <Avatar sx={{ bgcolor: "#2563eb" }}>
              {user?.username?.charAt(0)?.toUpperCase() || "U"}
            </Avatar>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="layout-content">
        <Outlet />
      </main>

      {/* MENU */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
      >
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
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
            setAnchorEl(null);
            setOpenPassword(true);
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

      {/* PASSWORD MODAL */}
      <Dialog open={openPassword} onClose={closePasswordModal}>
        <DialogTitle>Đổi mật khẩu</DialogTitle>

        <DialogContent>
          {["old", "new", "confirm"].map((field, index) => {
            const labelMap = {
              old: "Mật khẩu cũ",
              new: "Mật khẩu mới",
              confirm: "Xác nhận mật khẩu",
            };

            return (
              <TextField
                key={field}
                fullWidth
                label={labelMap[field]}
                margin="normal"
                type={showPassword ? "text" : "password"}
                value={passData[field]}
                onChange={(e) =>
                  setPassData({ ...passData, [field]: e.target.value })
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {index === 0 ? null : (
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      )}
                    </InputAdornment>
                  ),
                }}
              />
            );
          })}
        </DialogContent>

        <DialogActions>
          <Button onClick={closePasswordModal}>Hủy</Button>
          <Button variant="contained" onClick={handleChangePassword}>
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}