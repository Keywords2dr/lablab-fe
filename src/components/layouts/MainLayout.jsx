import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { userApi } from "../../api/userApi";
import { toast } from "react-toastify";

import {
  Avatar,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  InputAdornment,
} from "@mui/material";

import {
  Notifications,
  Logout,
  Person,
  Lock,
  Visibility,
  VisibilityOff,
  ScienceOutlined,
} from "@mui/icons-material";

import "./MainLayout.css";

export default function MainLayout() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  // PASSWORD MODAL
  const [openPassword, setOpenPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // LOGOUT
  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate("/login");
  };

  // CHANGE PASSWORD
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.warning("Vui lòng nhập đầy đủ!");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.warning("Mật khẩu không khớp!");
      return;
    }

    try {
      await userApi.changePassword({
        oldPassword,
        newPassword,
        confirmPassword,
      });

      toast.success("Đổi mật khẩu thành công!");

      setOpenPassword(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Đổi mật khẩu thất bại!");
    }
  };

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
          <IconButton>
            <Badge badgeContent={2} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          {/* USER */}
          <div
            className="avatar-section"
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <div className="user-info">
              <div className="username">
                {user?.username || "Guest"}
              </div>

              <div className="role">
                {user?.role || "STUDENT"}
              </div>

              {/* 🔥 ADMIN MENU (FIX CHÍNH Ở ĐÂY) */}
              {user?.role?.toLowerCase() === "admin" && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "#2563eb",
                    cursor: "pointer",
                    marginTop: "4px",
                    fontWeight: "500"
                  }}
                  onClick={(e) => {
                    e.stopPropagation(); // tránh mở menu avatar
                    navigate("/admin");
                  }}
                >
                  Quản trị hệ thống
                </div>
              )}
            </div>

            <Avatar>
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </Avatar>
          </div>

          {/* MENU */}
          <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
          >
            {/* PROFILE */}
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

            {/* CHANGE PASSWORD */}
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

            {/* LOGOUT */}
            <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
              <ListItemIcon>
                <Logout fontSize="small" color="error" />
              </ListItemIcon>
              Đăng xuất
            </MenuItem>
          </Menu>
        </div>
      </header>

      {/* CONTENT */}
      <div className="layout-content">
        <Outlet />
      </div>

      {/* MODAL PASSWORD */}
      <Dialog open={openPassword} onClose={() => setOpenPassword(false)}>
        <DialogTitle>Đổi mật khẩu</DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            label="Mật khẩu cũ"
            type={showPassword ? "text" : "password"}
            margin="normal"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            inputProps={{ autoComplete: "new-password" }}
          />

          <TextField
            fullWidth
            label="Mật khẩu mới"
            type={showPassword ? "text" : "password"}
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            inputProps={{ autoComplete: "new-password" }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Xác nhận mật khẩu"
            type={showPassword ? "text" : "password"}
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            inputProps={{ autoComplete: "new-password" }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenPassword(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleChangePassword}>
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}