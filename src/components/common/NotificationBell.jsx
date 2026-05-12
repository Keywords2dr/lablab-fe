import { useState, useEffect, useRef, useCallback } from "react";

const TYPE_CONFIG = {
  ROOM_ASSIGN: { bg: "#EAF3DE", color: "#3B6D11", icon: "🔑" },
  ROOM_REMOVE: { bg: "#FCEBEB", color: "#A32D2D", icon: "🚫" },
  BORROW:      { bg: "#E6F1FB", color: "#185FA5", icon: "🧪" },
  default:     { bg: "#F1EFE8", color: "#5F5E5A", icon: "🔔" },
};

const BASE_URL = "http://localhost:8080/api/notifications";

function authHeaders() {
  let token = null;
  
  // CHIẾN THUẬT LẤY TOKEN MỚI: 
  // 1. Thử lấy trực tiếp
  const directToken = localStorage.getItem("token") || localStorage.getItem("accessToken");
  
  // 2. Nếu không có, thử bóc từ auth-storage của Zustand
  if (!directToken) {
    const zustandRaw = localStorage.getItem("auth-storage");
    if (zustandRaw) {
      try {
        const parsed = JSON.parse(zustandRaw);
        token = parsed.state?.token || parsed.state?.user?.token;
      } catch (e) { console.error("Lỗi parse auth-storage"); }
    }
  } else {
    token = directToken;
  }

  // Xóa bỏ dấu ngoặc kép nếu có (Zustand hay bị dính)
  const cleanToken = token ? token.replace(/"/g, '') : null;

  return {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(cleanToken ? { "Authorization": `Bearer ${cleanToken}` } : {}),
  };
}

async function apiFetch(path, options = {}) {
  try {
    const headers = authHeaders();
    // Nếu không có Token, không gọi API để tránh spam lỗi 403
    if (!headers.Authorization) return null;

    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: { ...headers, ...options.headers },
      mode: 'cors',
    });

    if (res.status === 403) return null;
    if (!res.ok) return null;

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) return null;

    return await res.json();
  } catch (err) {
    return null;
  }
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef(null);

  const fetchUnreadCount = useCallback(async () => {
    const data = await apiFetch("/unread-count");
    if (data !== null) {
      const count = typeof data === "number" ? data : (data.unreadCount || 0);
      setUnreadCount(Number(count));
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (open) {
      apiFetch("?page=0&size=20").then(data => {
        if (data && data.content) setNotifications(data.content);
        else if (Array.isArray(data)) setNotifications(data);
      });
    }
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    const success = await apiFetch(`/${id}/read`, { method: "PATCH" });
    if (success !== null) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  return (
    <div ref={panelRef} style={{ position: "relative", display: "inline-block" }}>
      <button onClick={() => setOpen(!open)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "22px", padding: "8px", position: "relative" }}>
        🔔
        {unreadCount > 0 && (
          <span style={{ position: "absolute", top: 4, right: 4, background: "#ef4444", color: "white", borderRadius: "50%", minWidth: "18px", height: "18px", fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid white", fontWeight: "bold" }}>
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: "absolute", right: 0, top: "100%", marginTop: "12px", width: "350px", background: "white", boxShadow: "0 12px 30px rgba(0,0,0,0.15)", borderRadius: "12px", zIndex: 1000, overflow: "hidden", border: "1px solid #f0f0f0" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #f0f0f0", fontWeight: 700, fontSize: "16px" }}>Thông báo</div>
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {notifications.length > 0 ? (
              notifications.map(n => (
                <div key={n.id} onClick={() => !n.read && markAsRead(n.id)} style={{ 
                  padding: "12px 16px", borderBottom: "1px solid #f5f5f5", cursor: "pointer",
                  backgroundColor: n.read ? "transparent" : "#f0f7ff" 
                }}>
                  <div style={{ fontWeight: n.read ? 400 : 600, fontSize: "14px" }}>{n.title}</div>
                  <div style={{ fontSize: "13px", color: "#666" }}>{n.message}</div>
                </div>
              ))
            ) : (
              <div style={{ padding: "30px", textAlign: "center", color: "#999" }}>Không có thông báo mới</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}