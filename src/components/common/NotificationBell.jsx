import { useState, useEffect, useRef, useCallback } from "react";

/* ════════════════════════ CONFIG ════════════════════════ */
const TYPE_CONFIG = {
  ROOM_ASSIGN: { bg: "linear-gradient(135deg,#43e97b,#38f9d7)", icon: "🔑" },
  ROOM_REMOVE: { bg: "linear-gradient(135deg,#f857a6,#ff5858)", icon: "🚫" },
  BORROW:      { bg: "linear-gradient(135deg,#4facfe,#00f2fe)", icon: "🧪" },
  default:     { bg: "linear-gradient(135deg,#a18cd1,#fbc2eb)", icon: "🔔" },
};

const BASE_URL = "http://localhost:8080/api/notifications";

/* ════════════════════════ HELPERS ════════════════════════ */
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

/* ════════════════════════ STYLES ════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* ── Bell button ── */
.nb-btn {
  position: relative;
  width: 40px; height: 40px;
  border-radius: 50%;
  background: #E4E6EA;
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: #050505;
  transition: background .2s;
  font-family: 'Inter', sans-serif;
}
.nb-btn:hover { background: #D8DADF; }
.nb-btn svg  { width:22px; height:22px; fill:currentColor; }
.nb-btn.ring svg { animation: nb-ring .55s ease; }
@keyframes nb-ring {
  0%,100%{transform:rotate(0)}20%{transform:rotate(-22deg)}
  40%{transform:rotate(22deg)}60%{transform:rotate(-14deg)}80%{transform:rotate(10deg)}
}

/* ── Badge ── */
.nb-badge {
  position:absolute; top:0; right:0;
  background:#f02849; color:#fff;
  border-radius:10px; min-width:18px; height:18px;
  font-size:10px; font-weight:700;
  display:flex; align-items:center; justify-content:center;
  padding:0 3px; line-height:1;
  box-shadow:0 0 0 2px rgba(240,40,73,.25);
  animation: nb-pop .3s cubic-bezier(.36,.07,.19,.97);
}
@keyframes nb-pop{0%{transform:scale(0)}70%{transform:scale(1.25)}100%{transform:scale(1)}}

/* ── Panel ── */
.nb-panel {
  position:absolute; right:0; top:calc(100% + 12px);
  width:390px;
  background:#fff;
  border-radius:12px;
  box-shadow:0 12px 40px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.08);
  z-index:9999;
  overflow:hidden;
  font-family:'Inter', sans-serif;
  animation: nb-in .22s cubic-bezier(.34,1.56,.64,1);
  transform-origin: top right;
}
@keyframes nb-in{
  from{opacity:0;transform:scale(.88) translateY(-10px)}
  to  {opacity:1;transform:scale(1)   translateY(0)}
}

/* Arrow caret */
.nb-panel::before{
  content:''; position:absolute; top:-5px; right:14px;
  width:11px; height:11px;
  background:#fff;
  transform:rotate(45deg);
  box-shadow:-2px -2px 5px rgba(0,0,0,.06);
  border-radius:2px; z-index:1;
}

/* ── Header ── */
.nb-hd{
  display:flex; align-items:center; justify-content:space-between;
  padding:16px 16px 6px;
}
.nb-hd-title{ font-size:20px; font-weight:700; color:#050505; letter-spacing:-.3px; }
.nb-mark-all{
  background:none; border:none; cursor:pointer;
  color:#1877f2; font-size:13px; font-weight:500;
  padding:6px 8px; border-radius:6px;
  transition:background .15s; font-family:inherit;
}
.nb-mark-all:hover{ background:#f0f2f5; }

/* ── Tabs ── */
.nb-tabs{ display:flex; gap:4px; padding:4px 16px 10px; }
.nb-tab{
  padding:7px 16px; border-radius:20px; border:none; cursor:pointer;
  font-size:14px; font-weight:600; font-family:inherit;
  transition:background .15s, color .15s;
}
.nb-tab.on{ background:#e7f0fd; color:#1877f2; }
.nb-tab:not(.on){ background:#f0f2f5; color:#050505; }
.nb-tab:not(.on):hover{ background:#e4e6e9; }

.nb-sep{ height:1px; background:#f0f2f5; }

/* ── Section label ── */
.nb-sec{ padding:10px 16px 2px; font-size:13px; font-weight:700; color:#050505; }

/* ── List ── */
.nb-list{ max-height:440px; overflow-y:auto; padding-bottom:8px; }
.nb-list::-webkit-scrollbar{ width:4px; }
.nb-list::-webkit-scrollbar-thumb{ background:#dadde1; border-radius:4px; }

/* ── Item ── */
.nb-item{
  display:flex; align-items:flex-start; gap:12px;
  padding:8px 12px; margin:2px 6px;
  border-radius:10px; cursor:pointer;
  transition:background .15s; position:relative;
}
.nb-item:hover{ background:#f2f2f2; }
.nb-item.unread{ background:#edf2fc; }
.nb-item.unread:hover{ background:#e4ecf8; }

/* ── Avatar ── */
.nb-av{
  position:relative; flex-shrink:0;
  width:52px; height:52px;
}
.nb-av-circle{
  width:52px; height:52px; border-radius:50%;
  display:flex; align-items:center; justify-content:center;
  font-size:22px;
  box-shadow:0 2px 8px rgba(0,0,0,.12);
}
.nb-av-badge{
  position:absolute; bottom:-1px; right:-3px;
  width:22px; height:22px; border-radius:50%;
  background:#1877f2;
  display:flex; align-items:center; justify-content:center;
  font-size:11px;
  border:2px solid #fff;
  box-shadow:0 1px 4px rgba(0,0,0,.18);
}

/* ── Content ── */
.nb-body{ flex:1; min-width:0; padding-top:2px; }
.nb-title{
  font-size:14px; line-height:1.4; color:#050505;
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
}
.nb-item.unread .nb-title{ font-weight:600; }
.nb-msg{
  font-size:12px; color:#65676b; margin-top:2px;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.nb-time{ font-size:12px; margin-top:4px; }
.nb-item.unread .nb-time{ color:#1877f2; font-weight:600; }
.nb-item:not(.unread) .nb-time{ color:#65676b; }

/* ── Unread dot ── */
.nb-dot{
  width:10px; height:10px; border-radius:50%;
  background:#1877f2; flex-shrink:0; margin-top:18px;
  box-shadow:0 0 0 3px rgba(24,119,242,.18);
}

/* ── Empty state ── */
.nb-empty{
  padding:44px 20px; text-align:center; color:#65676b;
}
.nb-empty-ico{ font-size:44px; margin-bottom:12px; }
.nb-empty-txt{ font-size:15px; font-weight:600; color:#050505; }
.nb-empty-sub{ font-size:13px; color:#bcc0c4; margin-top:5px; }

/* Wrapper */
.nb-wrap{ position:relative; display:inline-block; }
`;

/* ════════════════════════ COMPONENT ════════════════════════ */
export default function NotificationBell() {
  const [open, setOpen]                 = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]   = useState(0);
  const [tab, setTab]                   = useState("all");
  const [ring, setRing]                 = useState(false);
  const panelRef  = useRef(null);
  const prevCount = useRef(0);

  /* ─── fetch unread count ─── */
  const fetchCount = useCallback(async () => {
    const data = await apiFetch("/unread-count");
    if (data === null) return;
    const c = Number(typeof data === "number" ? data : data.unreadCount ?? 0);
    if (c > prevCount.current) {
      setRing(true);
      setTimeout(() => setRing(false), 600);
    }
    prevCount.current = c;
    setUnreadCount(c);
  }, []);

  useEffect(() => {
    fetchCount();
    const id = setInterval(fetchCount, 30000);
    return () => clearInterval(id);
  }, [fetchCount]);

  /* ─── fetch list on open ─── */
  useEffect(() => {
    if (!open) return;
    apiFetch("?page=0&size=30").then((data) => {
      if (data?.content)      setNotifications(data.content);
      else if (Array.isArray(data)) setNotifications(data);
    });
  }, [open]);

  /* ─── close on outside click ─── */
  useEffect(() => {
    const fn = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  /* ─── mark one read ─── */
  const markRead = async (id) => {
    const ok = await apiFetch(`/${id}/read`, { method: "PATCH" });
    if (ok !== null) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
  };

  /* ─── mark all read ─── */
  const markAll = async () => {
    const ok = await apiFetch("/read-all", { method: "PATCH" });
    if (ok !== null) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  /* ─── filter by tab ─── */
  const shown = tab === "unread"
    ? notifications.filter((n) => !n.read)
    : notifications;

  /* ─── split into sections ─── */
  const DAY = 86_400_000;
  const now  = Date.now();
  const recent  = shown.filter((n) => n.createdAt && now - new Date(n.createdAt) < DAY);
  const earlier = shown.filter((n) => !n.createdAt || now - new Date(n.createdAt) >= DAY);

  /* ─── single notification row ─── */
  function Item({ n }) {
    const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.default;
    return (
      <div
        className={`nb-item${n.read ? "" : " unread"}`}
        onClick={() => !n.read && markRead(n.id)}
      >
        <div className="nb-av">
          <div className="nb-av-circle" style={{ background: cfg.bg }}>
            {cfg.icon}
          </div>
          <div className="nb-av-badge">{cfg.icon}</div>
        </div>

        <div className="nb-body">
          <div className="nb-title">{n.title || n.message}</div>
          {n.title && n.message && <div className="nb-msg">{n.message}</div>}
          <div className="nb-time">{timeAgo(n.createdAt)}</div>
        </div>

        {!n.read && <div className="nb-dot" />}
      </div>
    );
  }

  /* ─── render ─── */
  return (
    <>
      <style>{CSS}</style>

      <div ref={panelRef} className="nb-wrap">
        {/* Bell */}
        <button
          className={`nb-btn${ring ? " ring" : ""}`}
          onClick={() => setOpen((o) => !o)}
          aria-label="Thông báo"
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zm6-6V11a6 6 0 0 0-5-5.92V4a1 1 0 1 0-2 0v1.08A6 6 0 0 0 6 11v5l-2 2v1h16v-1l-2-2z"/>
          </svg>

          {unreadCount > 0 && (
            <span className="nb-badge">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {open && (
          <div className="nb-panel" role="dialog" aria-label="Thông báo">

            {/* Header */}
            <div className="nb-hd">
              <span className="nb-hd-title">Thông báo</span>
              {unreadCount > 0 && (
                <button className="nb-mark-all" onClick={markAll}>
                  Đánh dấu tất cả là đã đọc
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="nb-tabs">
              <button
                className={`nb-tab${tab === "all" ? " on" : ""}`}
                onClick={() => setTab("all")}
              >
                Tất cả
              </button>
              <button
                className={`nb-tab${tab === "unread" ? " on" : ""}`}
                onClick={() => setTab("unread")}
              >
                Chưa đọc{unreadCount > 0 ? ` (${unreadCount})` : ""}
              </button>
            </div>

            <div className="nb-sep" />

            {/* List */}
            <div className="nb-list">
              {shown.length === 0 ? (
                <div className="nb-empty">
                  <div className="nb-empty-ico">🔔</div>
                  <div className="nb-empty-txt">
                    {tab === "unread"
                      ? "Không có thông báo chưa đọc"
                      : "Chưa có thông báo nào"}
                  </div>
                  <div className="nb-empty-sub">Bạn đã xem hết rồi!</div>
                </div>
              ) : (
                <>
                  {recent.length > 0 && (
                    <>
                      <div className="nb-sec">Mới</div>
                      {recent.map((n) => <Item key={n.id} n={n} />)}
                    </>
                  )}
                  {earlier.length > 0 && (
                    <>
                      <div className="nb-sec">Trước đó</div>
                      {earlier.map((n) => <Item key={n.id} n={n} />)}
                    </>
                  )}
                </>
              )}
            </div>

          </div>
        )}
      </div>
    </>
  );
}