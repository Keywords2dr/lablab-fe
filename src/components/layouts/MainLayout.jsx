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

  const [anchorEl, setAnchorEl] = useState(null);
  const [openPassword, setOpenPassword] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const [passData, setPassData] = useState({
    old: "",
    new: "",
    confirm: "",
  });

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

  const closePasswordModal = () => {
    setOpenPassword(false);
    setPassData({ old: "", new: "", confirm: "" });
    setShowPassword({ old: false, new: false, confirm: false });
  };

  const handleChangePassword = async () => {
    const { old, new: newPass, confirm } = passData;
    if (!old || !newPass || !confirm)
      return toast.warning("Vui lòng nhập đầy đủ!");
    if (newPass === old)
      return toast.warning("Mật khẩu mới không được trùng với mật khẩu cũ!");
    if (newPass !== confirm)
      return toast.warning("Mật khẩu xác nhận không khớp!");

    setLoadingPassword(true);
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
    } finally {
      setLoadingPassword(false);
    }
  };

  const toggleShow = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="layout-root">
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

      <main className="layout-content">
        <Outlet />
      </main>

      {/* Menu */}
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

      {/* Password Dialog */}
      <Dialog open={openPassword} onClose={closePasswordModal}>
        <DialogTitle>Đổi mật khẩu</DialogTitle>
        <DialogContent>
          {["old", "new", "confirm"].map((field) => (
            <TextField
              key={field}
              fullWidth
              label={
                field === "old"
                  ? "Mật khẩu cũ"
                  : field === "new"
                    ? "Mật khẩu mới"
                    : "Xác nhận mật khẩu"
              }
              margin="normal"
              type={showPassword[field] ? "text" : "password"}
              value={passData[field]}
              onChange={(e) =>
                setPassData({ ...passData, [field]: e.target.value })
              }
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => toggleShow(field)} edge="end">
                        {showPassword[field] ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={closePasswordModal}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleChangePassword}
            disabled={loadingPassword}
          >
            {loadingPassword ? "Đang xử lý..." : "Xác nhận"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
