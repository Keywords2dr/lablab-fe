import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { userApi } from "../../api/userApi";
import { toast } from "react-toastify";
import {
  Avatar, IconButton, Menu, MenuItem, ListItemIcon, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Button, InputAdornment,
} from "@mui/material";
import { Logout, Person, Lock, Visibility, VisibilityOff, ScienceOutlined } from "@mui/icons-material";

// ĐƯỜNG DẪN IMPORT CHÍNH XÁC CỦA BẠN
import NotificationBell from "../../components/common/NotificationBell";
import "./MainLayout.css";

export default function MainLayout() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const [openPassword, setOpenPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [passData, setPassData] = useState({ old: "", new: "", confirm: "" });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleChangePassword = async () => {
    if (passData.new !== passData.confirm) return toast.warning("Mật khẩu không khớp!");
    try {
      await userApi.changePassword({ oldPassword: passData.old, newPassword: passData.new });
      toast.success("Đổi mật khẩu thành công!");
      setOpenPassword(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Thất bại!");
    }
  };

  return (
    <div className="layout-root">
      <header className="user-topbar">
        <div className="user-logo" onClick={() => navigate("/")}>
          <ScienceOutlined sx={{ color: "#2563eb" }} /> Lab<span>Lab</span>.
        </div>

        <div className="topbar-right">
          
          {/* COMPONENT THÔNG BÁO Ở ĐÂY */}
          <NotificationBell />

          <div className="avatar-section" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <div className="user-info">
              <div className="username">{user?.username || "Guest"}</div>
              <div className="role">{user?.role || "STUDENT"}</div>
              {user?.role === "ADMIN" && (
                <div 
                  style={{ fontSize: "12px", color: "#2563eb", fontWeight: "500", cursor: "pointer" }} 
                  onClick={(e) => { e.stopPropagation(); navigate("/admin"); }}
                >
                  Quản trị hệ thống
                </div>
              )}
            </div>
            <Avatar sx={{ bgcolor: "#2563eb" }}>{user?.username?.charAt(0).toUpperCase()}</Avatar>
          </div>
        </div>
      </header>

      <main className="layout-content">
        <Outlet />
      </main>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => navigate("/profile")}><ListItemIcon><Person fontSize="small"/></ListItemIcon>Hồ sơ</MenuItem>
        <MenuItem onClick={() => setOpenPassword(true)}><ListItemIcon><Lock fontSize="small"/></ListItemIcon>Mật khẩu</MenuItem>
        <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}><ListItemIcon><Logout fontSize="small" color="error"/></ListItemIcon>Đăng xuất</MenuItem>
      </Menu>

      {/* Password Dialog lược bỏ bớt nội dung lặp lại để tập trung vào logic layout */}
      <Dialog open={openPassword} onClose={() => setOpenPassword(false)}>
        <DialogTitle>Đổi mật khẩu</DialogTitle>
        <DialogContent>
           <TextField 
             fullWidth label="Mật khẩu mới" margin="normal" type={showPassword ? "text" : "password"}
             onChange={(e) => setPassData({...passData, new: e.target.value})}
           />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPassword(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleChangePassword}>Xác nhận</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}