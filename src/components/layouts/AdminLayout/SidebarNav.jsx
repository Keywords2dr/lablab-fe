import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import { NAV_ITEMS } from "./adminNavItems";

function isActive(path, currentPath, isChild = false) {
  if (!path) return false;
  if (isChild) return currentPath === path;

  if (path === "/admin/tickets") {
    return (
      currentPath.startsWith("/admin/tickets") ||
      currentPath.startsWith("/admin/borrow-history")
    );
  }
  if (path === "/admin/rooms") {
    return currentPath === "/admin/rooms" || currentPath.startsWith("/admin/rooms/");
  }
  return currentPath === path;
}

export default function SidebarNav() {
  const navigate         = useNavigate();
  const { pathname }     = useLocation();

  const [expanded, setExpanded] = useState({
    rooms:   pathname.startsWith("/admin/rooms"),
    tickets: pathname.startsWith("/admin/tickets") || pathname.startsWith("/admin/borrow-history"),
  });

  const toggleExpand = (key) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <ul className="admin-nav-list">
      {NAV_ITEMS.map((group) => (
        <div key={group.group} className="admin-nav-group">
          <p className="admin-nav-title">{group.group}</p>

          {group.items.map((item) => {
            const active = isActive(item.path, pathname);

            return (
              <li key={item.label}>
                {/* Nav item (có thể có sub-menu) */}
                <div
                  className={`admin-nav-item ${active ? "active" : ""} ${
                    !item.path && !item.children ? "disabled" : ""
                  }`}
                  onClick={() => {
                    if (item.children) {
                      toggleExpand(item.groupKey);
                      if (item.path && pathname !== item.path) navigate(item.path);
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

                {/* Sub-menu */}
                {item.children && expanded[item.groupKey] && (
                  <ul className="admin-nav-sub-list">
                    {item.children.map((child) => (
                      <li
                        key={child.path}
                        className={`admin-nav-sub-item ${
                          isActive(child.path, pathname, true) ? "active" : ""
                        }`}
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
  );
}
