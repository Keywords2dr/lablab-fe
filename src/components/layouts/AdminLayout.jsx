import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Avatar, Menu, MenuItem, ListItemIcon } from "@mui/material";
import {
  Dashboard, Receipt, Inventory, MeetingRoom, PeopleAlt, WarningAmber,
  History, Settings, Logout, ManageAccounts, LocalShipping, DomainOutlined,
  ExpandMore, ExpandLess,
} from "@mui/icons-material";

// ĐƯỜNG DẪN IMPORT CHÍNH XÁC CỦA BẠN
import NotificationBell from "../../components/common/NotificationBell";
import "./AdminLayout.css";

const NAV_ITEMS = [
  {
    group: "CHỨC NĂNG CHÍNH",
    items: [
      { label: "Tổng Quan", icon: <Dashboard fontSize="small" />, path: "/admin" },
      { label: "Duyệt Phiếu Mượn", icon: <Receipt fontSize="small" />, path: null },
      { label: "Quản lý Vật tư", icon: <Inventory fontSize="small" />, path: "/admin/materials" },
      {
        label: "Quản lý Phòng Lab",
        icon: <MeetingRoom fontSize="small" />,
        path: "/admin/rooms",
        groupKey: "rooms",
        children: [
          { label: "Danh sách Phòng", icon: <DomainOutlined fontSize="small" />, path: "/admin/rooms" },
          { label: "Phân quyền Quản lý", icon: <ManageAccounts fontSize="small" />, path: "/admin/rooms/managers" },
          { label: "Phân phối Vật tư", icon: <LocalShipping fontSize="small" />, path: "/admin/rooms/supplies" },
        ],
      },
      { label: "Quản lý Người dùng", icon: <PeopleAlt fontSize="small" />, path: null },
    ],
  },
  {
    group: "QUẢN TRỊ & GIÁM SÁT",
    items: [
      { label: "Báo cáo Sự cố", icon: <WarningAmber fontSize="small" />, path: null },
      { label: "Nhật ký Hệ thống", icon: <History fontSize="small" />, path: "/admin/audit-logs" },
    ],
  },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const [anchorEl, setAnchorEl] = useState(null);
  const [expanded, setExpanded] = useState(() => ({
    rooms: location.pathname.startsWith("/admin/rooms"),
  }));

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate("/login");
  };

  const toggleExpand = (key) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  const isActive = (path) => {
    if (!path) return false;
    return path === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(path);
  };

  return (
    <div className="admin-layout-root">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo" onClick={() => navigate("/admin")}>
          Lab<span>Lab.</span>
        </div>
        <ul className="admin-nav-list">
          {NAV_ITEMS.map(({ group, items }) => (
            <div className="admin-nav-group" key={group}>
              <p className="admin-nav-title">{group}</p>
              {items.map((item) => (
                <li key={item.label}>
                  <div 
                    className={`admin-nav-item ${isActive(item.path) ? "active" : ""}`}
                    onClick={() => item.children ? toggleExpand(item.groupKey) : item.path && navigate(item.path)}
                  >
                    {item.icon} <span>{item.label}</span>
                    {item.children && (expanded[item.groupKey] ? <ExpandLess fontSize="small"/> : <ExpandMore fontSize="small"/>)}
                  </div>
                  {item.children && expanded[item.groupKey] && (
                    <ul className="admin-nav-sub-list">
                      {item.children.map(child => (
                        <li key={child.path} className={`admin-nav-sub-item ${isActive(child.path) ? "active" : ""}`} onClick={() => navigate(child.path)}>
                          {child.icon} <span>{child.label}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </div>
          ))}
        </ul>
      </aside>

      <div className="admin-main-wrapper">
        <header className="admin-topbar">
          <div className="admin-topbar-title">Khu vực Quản Trị Viên</div>
          <div className="admin-topbar-actions">
            
            {/* COMPONENT THÔNG BÁO Ở ĐÂY */}
            <NotificationBell />

            <div className="admin-profile-section" onClick={(e) => setAnchorEl(e.currentTarget)}>
              <div className="admin-profile-info">
                <strong>{user?.username || "Admin"}</strong>
                <span>{user?.role || "ADMIN"}</span>
              </div>
              <Avatar sx={{ bgcolor: "#0f172a", width: 36, height: 36 }}>
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
            </div>
          </div>
        </header>

        <main className="admin-content-area">
          <Outlet />
        </main>
      </div>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
          <ListItemIcon><Logout fontSize="small" color="error" /></ListItemIcon>
          Đăng xuất
        </MenuItem>
      </Menu>
    </div>
  );
}