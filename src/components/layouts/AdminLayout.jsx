import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Avatar, Menu, MenuItem, ListItemIcon } from "@mui/material";
import {
  Dashboard,
  Receipt,
  Inventory,
  MeetingRoom,
  PeopleAlt,
  WarningAmber,
  History,
  Settings,
  Logout,
  ManageAccounts,
  LocalShipping,
  DomainOutlined,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";


import NotificationBell from "../../components/common/NotificationBell";
import NotificationsPage from "../../components/common/NotificationsPage";
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
  {
    group: "HỆ THỐNG",
    items: [
      { label: "Cài đặt chung", icon: <Settings fontSize="small" />, path: null },
    ],
  },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const [anchorEl, setAnchorEl] = useState(null);
  const [expanded, setExpanded] = useState({
    rooms: location.pathname.startsWith("/admin/rooms"),
  });

  // ========================
  // HANDLERS
  // ========================
  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate("/login");
  };

  const toggleExpand = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ========================
  // IS ACTIVE - PHIÊN BẢN MỚI (FIX TRIỆT ĐỂ)
  // ========================
  const isActive = (path, isChild = false) => {
    if (!path) return false;
    const currentPath = location.pathname;

    if (isChild) {
      // Item con: active nếu path khớp chính xác
      return currentPath === path;
    } else {
      // Item cha: chỉ active khi đang ở chính path của nó
      if (path === "/admin/rooms") {
        return currentPath === "/admin/rooms";
      }
      return currentPath === path;
    }
  };

  // ========================
  // RENDER
  // ========================
  return (
    <div className="admin-layout-root">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo" onClick={() => navigate("/admin")}>
          Lab<span>Lab.</span>
        </div>

        <ul className="admin-nav-list">
          {NAV_ITEMS.map((group) => (
            <div key={group.group} className="admin-nav-group">
              <p className="admin-nav-title">{group.group}</p>

              {group.items.map((item) => {
                const active = isActive(item.path);

                return (
                  <li key={item.label}>
                    {/* PARENT ITEM */}
                    <div
                      className={`admin-nav-item ${active ? "active" : ""} 
                        ${!item.path && !item.children ? "disabled" : ""}`}
                      onClick={() => {
                        if (item.children) {
                          toggleExpand(item.groupKey);
                          if (item.path && location.pathname !== item.path) {
                            navigate(item.path);
                          }
                        } else if (item.path) {
                          navigate(item.path);
                        }
                      }}
                    >
                      {item.icon}
                      <span>{item.label}</span>

                      {item.children && (
                        <span className="expand-icon">
                          {expanded[item.groupKey] ? <ExpandLess /> : <ExpandMore />}
                        </span>
                      )}
                    </div>

                    {/* SUB ITEMS */}
                    {item.children && expanded[item.groupKey] && (
                      <ul className="admin-nav-sub-list">
                        {item.children.map((child) => (
                          <li
                            key={child.path}
                            className={`admin-nav-sub-item ${isActive(child.path, true) ? "active" : ""}`}
                            onClick={() => navigate(child.path)}
                          >
                            {child.icon}
                            <span>{child.label}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </div>
          ))}
        </ul>
      </aside>

      {/* MAIN AREA */}
      <div className="admin-main-wrapper">
        {/* TOPBAR */}
        <header className="admin-topbar">
          <div className="admin-topbar-title">Khu vực Quản Trị Viên</div>

          <div className="admin-topbar-actions">
            <NotificationBell />

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

        {/* CONTENT */}
        <main className="admin-content-area">
          <Outlet />
        </main>
      </div>

      {/* LOGOUT MENU */}
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