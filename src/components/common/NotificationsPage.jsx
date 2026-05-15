import { useState, useEffect, useCallback } from "react";
import "./NotificationsPage.css";

const TYPE_CONFIG = {
  ROOM_ASSIGN:              { bg: "linear-gradient(135deg,#43e97b,#38f9d7)", icon: "🔑" },
  ROOM_REMOVE:              { bg: "linear-gradient(135deg,#f857a6,#ff5858)", icon: "🚫" },
  BORROW:                   { bg: "linear-gradient(135deg,#4facfe,#00f2fe)", icon: "🧪" },
  TICKET_PENDING_ADMIN_ALERT: { bg: "linear-gradient(135deg,#f7971e,#ffd200)", icon: "📋" },
  default:                  { bg: "linear-gradient(135deg,#a18cd1,#fbc2eb)", icon: "🔔" },
};

const BASE_URL = "http://localhost:8080/api/notifications";

function getUserRole() {
  try {
    const raw = localStorage.getItem("auth-storage");
    if (raw) {
      const p = JSON.parse(raw);
      return p.state?.user?.role || null;
    }
  } catch {}
  return null;
}

function authHeaders() {
  let token = null;
  const directToken = localStorage.getItem("token") || localStorage.getItem("accessToken");
  if (!directToken) {
    const raw = localStorage.getItem("auth-storage");
    if (raw) {
      try {
        const p = JSON.parse(raw);
        token = p.state?.token || p.state?.user?.token;
      } catch {}
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

function getRedirectUrl(type) {
  const role = getUserRole();
  if (type === "TICKET_PENDING_ADMIN_ALERT" || type === "BORROW") {
    return role === "ADMIN"
      ? "http://localhost:5173/admin/tickets"
      : "/borrow/chemical";
  }
  // ROOM_ASSIGN, ROOM_REMOVE
  return "/manage/assigned-rooms";
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchNotifications = useCallback(async (reset = false) => {
    setLoading(true);
    const currentPage = reset ? 0 : page;
    const res = await apiFetch(`?page=${currentPage}&size=20`);

    if (res) {
      const newData = res.content || res;
      if (reset) setNotifications(newData);
      else setNotifications((prev) => [...prev, ...newData]);
      setHasMore(newData.length === 20);
      if (!reset) setPage((p) => p + 1);
    }
    setLoading(false);
  }, [page]);

  useEffect(() => {
    fetchNotifications(true);
  }, []);

  const markAllRead = async () => {
    await apiFetch("/read-all", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotiClick = async (n) => {
    if (!n.read) {
      await apiFetch(`/${n.id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
      );
    }
    window.location.href = getRedirectUrl(n.type);
  };

  const filtered = filter === "unread"
    ? notifications.filter((n) => !n.read)
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
          <button className={`tab ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
            Tất cả
          </button>
          <button className={`tab ${filter === "unread" ? "active" : ""}`} onClick={() => setFilter("unread")}>
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
                  className={`noti-item ${!n.read ? "unread" : ""}`}
                  onClick={() => handleNotiClick(n)}
                >
                  <div className="noti-icon" style={{ background: cfg.bg }}>
                    {cfg.icon}
                  </div>
                  <div className="noti-content">
                    <div className="noti-title">{n.title || n.message}</div>
                    {n.message && n.title && <div className="noti-desc">{n.message}</div>}
                    <div className="noti-time">{timeAgo(n.createdAt)}</div>
                  </div>
                  {!n.read && <div className="unread-dot" />}
                </div>
              );
            })
          )}
        </div>

        {hasMore && !loading && (
          <button className="load-more" onClick={() => fetchNotifications(false)}>
            Tải thêm
          </button>
        )}
      </div>
    </div>
  );
}