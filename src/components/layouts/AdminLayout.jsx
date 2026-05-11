import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Badge, Avatar, Menu, MenuItem, ListItemIcon } from "@mui/material";
import {
  Dashboard,
  Receipt,
  Inventory,
  MeetingRoom,
  PeopleAlt,
  WarningAmber,
  History,
  Settings,
  Notifications,
  Logout,
  ManageAccounts,
  LocalShipping,
  DomainOutlined,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";

import "./AdminLayout.css";

const NAV_ITEMS = [
  {
    group: "CHỨC NĂNG CHÍNH",
    items: [
      {
        label: "Tổng Quan",
        icon: <Dashboard fontSize="small" />,
        path: "/admin",
      },
      {
        label: "Duyệt Phiếu Mượn",
        icon: <Receipt fontSize="small" />,
        path: null,
      },
      {
        label: "Quản lý Vật tư",
        icon: <Inventory fontSize="small" />,
        path: "/admin/materials",
      },
      {
        label: "Quản lý Phòng Lab",
        icon: <MeetingRoom fontSize="small" />,
        path: "/admin/rooms",
        groupKey: "rooms",
        children: [
          {
            label: "Danh sách Phòng",
            icon: <DomainOutlined fontSize="small" />,
            path: "/admin/rooms",
          },
          {
            label: "Phân quyền Quản lý",
            icon: <ManageAccounts fontSize="small" />,
            path: "/admin/rooms/managers",
          },
          {
            label: "Phân phối Vật tư",
            icon: <LocalShipping fontSize="small" />,
            path: "/admin/rooms/supplies",
          },
        ],
      },
      {
        label: "Quản lý Người dùng",
        icon: <PeopleAlt fontSize="small" />,
        path: null,
      },
    ],
  },
  {
    group: "QUẢN TRỊ & GIÁM SÁT",
    items: [
      {
        label: "Báo cáo Sự cố",
        icon: <WarningAmber fontSize="small" />,
        path: null,
      },
      {
        label: "Nhật ký Hệ thống",
        icon: <History fontSize="small" />,
        path: "/admin/audit-logs",
      },
    ],
  },
  {
    group: "HỆ THỐNG",
    items: [
      {
        label: "Cài đặt chung",
        icon: <Settings fontSize="small" />,
        path: null,
      },
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
  const openMenu = Boolean(anchorEl);

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate("/login");
  };

  const toggleExpand = (key) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  const isActive = (path) => {
    if (!path) return false;
    if (path === "/admin") return location.pathname === "/admin";
    if (path === "/admin/rooms") return location.pathname === "/admin/rooms";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-layout-root">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo" onClick={() => navigate("/admin")}>
          Lab<span>Lab.</span>
        </div>

        {NAV_ITEMS.map(({ group, items }) => (
          <div className="admin-nav-group" key={group}>
            <p className="admin-nav-title">{group}</p>
            <ul className="admin-nav-list">
              {items.map(({ label, icon, path, children, groupKey }) => (
                <li key={label} style={{ listStyle: "none" }}>
                  <div
                    className={`admin-nav-item${isActive(path) ? " active" : ""}${!path && !children ? " disabled" : ""}`}
                    onClick={() => {
                      if (children) {
                        toggleExpand(groupKey);
                        if (path) navigate(path);
                      } else if (path) navigate(path);
                    }}
                  >
                    {icon}
                    <span>{label}</span>
                    {children && (
                      <span
                        style={{
                          marginLeft: "auto",
                          display: "flex",
                          opacity: 0.6,
                        }}
                      >
                        {expanded[groupKey] ? (
                          <ExpandLess fontSize="small" />
                        ) : (
                          <ExpandMore fontSize="small" />
                        )}
                      </span>
                    )}
                  </div>
                  {children && expanded[groupKey] && (
                    <ul className="admin-nav-sub-list">
                      {children.map((child) => (
                        <li
                          key={child.path}
                          className={`admin-nav-sub-item${isActive(child.path) ? " active" : ""}`}
                          onClick={() => navigate(child.path)}
                        >
                          {child.icon}
                          <span>{child.label}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </aside>

      {/* ── MAIN WRAPPER ── */}
      <div className="admin-main-wrapper">
        {/* TOPBAR */}
        <header className="admin-topbar">
          <div className="admin-topbar-title">Khu vực Quản Trị Viên</div>

          <div className="admin-topbar-actions">
            <Badge
              badgeContent={12}
              color="error"
              style={{ cursor: "pointer" }}
            >
              <Notifications color="action" />
            </Badge>

            <div
              className="admin-profile-section"
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              <div className="admin-profile-info">
                <strong>{user?.username || "Admin"}</strong>
                <span>{user?.role || "ADMIN"}</span>
              </div>
              <Avatar sx={{ bgcolor: "#0f172a", width: 36, height: 36 }}>
                {user?.username?.charAt(0).toUpperCase() || "A"}
              </Avatar>
            </div>

            <Menu
              anchorEl={anchorEl}
              open={openMenu}
              onClose={() => setAnchorEl(null)}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              slotProps={{
                paper: {
                  elevation: 3,
                  sx: { mt: 1.5, minWidth: 160, borderRadius: "12px" },
                },
              }}
            >
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
        <main className="admin-content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
