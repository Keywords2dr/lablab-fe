import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./NotificationsPage.css";

const TYPE_CONFIG = {
  // Phòng Lab
  ROOM_ASSIGN: { bg: "linear-gradient(135deg,#43e97b,#38f9d7)", icon: "🔑" },
  ROOM_REMOVE: { bg: "linear-gradient(135deg,#f857a6,#ff5858)", icon: "🚫" },

  // Phiếu mượn — tạo mới
  TICKET_CREATED: { bg: "linear-gradient(135deg,#f7971e,#ffd200)", icon: "📋" },
  TICKET_CREATED_NO_STAFF: {
    bg: "linear-gradient(135deg,#f7971e,#ffd200)",
    icon: "📋",
  },

  // Phiếu mượn — duyệt / từ chối
  TICKET_APPROVED: {
    bg: "linear-gradient(135deg,#43e97b,#38f9d7)",
    icon: "✅",
  },
  TICKET_APPROVED_NOTIFY_TEACHER: {
    bg: "linear-gradient(135deg,#43e97b,#38f9d7)",
    icon: "✅",
  },
  TICKET_PENDING_ADMIN: {
    bg: "linear-gradient(135deg,#f7971e,#ffd200)",
    icon: "⏳",
  },
  TICKET_PENDING_ADMIN_ALERT: {
    bg: "linear-gradient(135deg,#f7971e,#ffd200)",
    icon: "📋",
  },
  TICKET_REJECTED_BY_TEACHER: {
    bg: "linear-gradient(135deg,#f857a6,#ff5858)",
    icon: "❌",
  },
  TICKET_REJECTED_BY_ADMIN: {
    bg: "linear-gradient(135deg,#f857a6,#ff5858)",
    icon: "❌",
  },
  TICKET_REJECTED_BY_ADMIN_NOTIFY_TEACHER: {
    bg: "linear-gradient(135deg,#f857a6,#ff5858)",
    icon: "❌",
  },

  // Phiếu mượn — bàn giao / trả
  TICKET_BORROWED: {
    bg: "linear-gradient(135deg,#4facfe,#00f2fe)",
    icon: "🧪",
  },
  TICKET_PENDING_RETURN: {
    bg: "linear-gradient(135deg,#43e97b,#38f9d7)",
    icon: "📦",
  },
  TICKET_RETURNED: {
    bg: "linear-gradient(135deg,#43e97b,#38f9d7)",
    icon: "✅",
  },
  RETURN_ISSUE_ALERT: {
    bg: "linear-gradient(135deg,#f7971e,#ffd200)",
    icon: "⚠️",
  },
  RETURN_ISSUE_REQUESTER: {
    bg: "linear-gradient(135deg,#f7971e,#ffd200)",
    icon: "⚠️",
  },

  // Phiếu mượn — hủy
  TICKET_CANCELLED: {
    bg: "linear-gradient(135deg,#f857a6,#ff5858)",
    icon: "🚫",
  },
  TICKET_CANCELLED_CONFIRMATION: {
    bg: "linear-gradient(135deg,#f857a6,#ff5858)",
    icon: "🚫",
  },

  // Nhắc nhở / quá hạn
  TICKET_EXPIRY_REMINDER: {
    bg: "linear-gradient(135deg,#f7971e,#ffd200)",
    icon: "⏰",
  },
  TICKET_EXPIRY_REMINDER_STAFF: {
    bg: "linear-gradient(135deg,#f7971e,#ffd200)",
    icon: "⏰",
  },
  TICKET_OVERDUE: { bg: "linear-gradient(135deg,#f857a6,#ff5858)", icon: "🚨" },
  TICKET_OVERDUE_STAFF: {
    bg: "linear-gradient(135deg,#f857a6,#ff5858)",
    icon: "🚨",
  },
  TICKET_OVERDUE_CRITICAL: {
    bg: "linear-gradient(135deg,#f857a6,#ff5858)",
    icon: "🚨",
  },

  // Tồn kho
  STOCK_LOW: { bg: "linear-gradient(135deg,#f7971e,#ffd200)", icon: "📉" },
  STOCK_OUT: { bg: "linear-gradient(135deg,#f857a6,#ff5858)", icon: "❗" },
  INVENTORY_ALLOCATE: {
    bg: "linear-gradient(135deg,#4facfe,#00f2fe)",
    icon: "📥",
  },
  INVENTORY_REVOKE: {
    bg: "linear-gradient(135deg,#a18cd1,#fbc2eb)",
    icon: "📤",
  },

  default: { bg: "linear-gradient(135deg,#a18cd1,#fbc2eb)", icon: "🔔" },
};

const BASE_URL = "http://localhost:8080/api/notifications";

const TEACHER_MANAGE_TYPES = new Set([
  "ROOM_ASSIGN",
  "ROOM_REMOVE",
  "TICKET_PENDING_ADMIN_ALERT",
  "RETURN_ISSUE_ALERT",
]);

const STUDENT_HISTORY_TYPES = new Set([
  "TICKET_RETURNED",
  "TICKET_CANCELLED",
  "TICKET_CANCELLED_CONFIRMATION",
  "RETURN_ISSUE_ALERT",
  "RETURN_ISSUE_REQUESTER",
]);

function getUserRole() {
  try {
    const raw = localStorage.getItem("auth-storage");
    if (raw) {
      const p = JSON.parse(raw);
      return p.state?.user?.role || null;
    }
  } catch {
    // parse thất bại, trả về null bên dưới
  }
  return null;
}

function authHeaders() {
  let token = null;
  const directToken =
    localStorage.getItem("token") || localStorage.getItem("accessToken");
  if (!directToken) {
    const raw = localStorage.getItem("auth-storage");
    if (raw) {
      try {
        const p = JSON.parse(raw);
        token = p.state?.token || p.state?.user?.token;
      } catch {
        // parse thất bại, token vẫn là null
      }
    }
  } else {
    token = directToken;
  }
  const clean = token ? token.replace(/"/g, "") : null;
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(clean ? { Authorization: `Bearer ${clean}` } : {}),
  };
}

async function apiFetch(path, options = {}) {
  try {
    const headers = authHeaders();
    if (!headers.Authorization) return null;
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: { ...headers, ...options.headers },
      mode: "cors",
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "Vừa xong";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} ngày trước`;
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

function getRedirectPath(type, role) {
  if (role === "ADMIN") return "/admin/tickets";
  if (role === "STUDENT") {
    return STUDENT_HISTORY_TYPES.has(type) ? "/borrow-history" : "/my-tickets";
  }
  if (role === "TEACHER") {
    return TEACHER_MANAGE_TYPES.has(type)
      ? "/manage/assigned-rooms"
      : "/borrow-history";
  }
  return "/";
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState("all");

  // Load trang đầu tiên khi mount — fetch trực tiếp trong effect, không qua callback
  useEffect(() => {
    let cancelled = false;
    async function loadFirst() {
      setLoading(true);
      const res = await apiFetch("?page=0&size=20");
      if (!cancelled && res) {
        const data = res.content || res;
        setNotifications(data);
        setPage(1);
        setHasMore(data.length === 20);
      }
      if (!cancelled) setLoading(false);
    }
    loadFirst();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load thêm khi bấm nút "Tải thêm"
  const loadMore = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch(`?page=${page}&size=20`);
    if (res) {
      const data = res.content || res;
      setNotifications((prev) => [...prev, ...data]);
      setPage((p) => p + 1);
      setHasMore(data.length === 20);
    }
    setLoading(false);
  }, [page]);

  const markAllRead = async () => {
    await apiFetch("/read-all", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleNotiClick = async (n) => {
    if (!n.isRead) {
      await apiFetch(`/${n.id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === n.id ? { ...item, isRead: true } : item,
        ),
      );
    }
    navigate(getRedirectPath(n.type, getUserRole()));
  };

  const filtered =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  return (
    <div className="notifications-page">
      <div className="page-container">
        <div className="page-header">
          <h1>Thông báo</h1>
          <button className="mark-all-btn" onClick={markAllRead}>
            Đánh dấu tất cả đã đọc
          </button>
        </div>

        <div className="tabs">
          <button
            className={`tab ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            Tất cả
          </button>
          <button
            className={`tab ${filter === "unread" ? "active" : ""}`}
            onClick={() => setFilter("unread")}
          >
            Chưa đọc
          </button>
        </div>

        <div className="noti-list">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔔</div>
              <h3>Không có thông báo</h3>
              <p>Bạn đã xem hết tất cả thông báo</p>
            </div>
          ) : (
            filtered.map((n) => {
              const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.default;
              return (
                <div
                  key={n.id}
                  className={`noti-item ${!n.isRead ? "unread" : ""}`}
                  onClick={() => handleNotiClick(n)}
                >
                  <div className="noti-icon" style={{ background: cfg.bg }}>
                    {cfg.icon}
                  </div>
                  <div className="noti-content">
                    <div className="noti-title">{n.title || n.message}</div>
                    {n.message && n.title && (
                      <div className="noti-desc">{n.message}</div>
                    )}
                    <div className="noti-time">{timeAgo(n.createdAt)}</div>
                  </div>
                  {!n.isRead && <div className="unread-dot" />}
                </div>
              );
            })
          )}
        </div>

        {hasMore && !loading && (
          <button className="load-more" onClick={loadMore}>
            Tải thêm
          </button>
        )}
      </div>
    </div>
  );
}