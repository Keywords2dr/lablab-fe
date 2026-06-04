import { TYPE_CONFIG } from "../notifications/notificationConstants";
import { useNotificationBell } from "./useNotificationBell";
import "./NotificationBell.css";

// ── Sub-component: một item thông báo trong dropdown ──────────────────────
function NotificationItem({ n, onItemClick, timeAgo }) {
  const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.default;
  return (
    <div
      className={`nb-item${n.read ? "" : " unread"}`}
      onClick={() => onItemClick(n)}
    >
      <div className="nb-av">
        <div className="nb-av-circle" style={{ background: cfg.bg }}>
          {cfg.icon}
        </div>
      </div>
      <div className="nb-body">
        <div className="nb-title">{n.title || n.message}</div>
        {n.message && <div className="nb-msg">{n.message}</div>}
        <div className="nb-time">{timeAgo(n.createdAt)}</div>
      </div>
      {!n.read && <div className="nb-dot" />}
    </div>
  );
}

// ── Component chính ────────────────────────────────────────────────────────
export default function NotificationBell({ onViewAll }) {
  const {
    open,
    tab,
    ring,
    shown,
    recent,
    earlier,
    unreadCount,
    panelRef,
    setTab,
    handleToggleOpen,
    handleItemClick,
    markAll,
    handleViewAll,
    timeAgo,
  } = useNotificationBell({ onViewAll });

  return (
    <div ref={panelRef} className="nb-wrap">
      {/* ── Bell Button ── */}
      <button
        className={`nb-btn${ring ? " ring" : ""}`}
        onClick={handleToggleOpen}
        aria-label="Thông báo"
      >
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zm6-6V11a6 6 0 0 0-5-5.92V4a1 1 0 1 0-2 0v1.08A6 6 0 0 0 6 11v5l-2 2v1h16v-1l-2-2z" />
        </svg>
        {unreadCount > 0 && (
          <span className="nb-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown Panel ── */}
      {open && (
        <div className="nb-panel">
          {/* Header */}
          <div className="nb-hd">
            <span className="nb-hd-title">Thông báo</span>
            {unreadCount > 0 && (
              <button className="nb-mark-all" onClick={markAll}>
                Đánh dấu tất cả đã đọc
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
              <div style={{ padding: "44px 20px", textAlign: "center" }}>
                <div style={{ fontSize: "44px", marginBottom: "12px" }}>🔔</div>
                <div>Chưa có thông báo nào</div>
              </div>
            ) : (
              <>
                {recent.length > 0 && (
                  <>
                    <div className="nb-sec">Mới</div>
                    {recent.map((n) => (
                      <NotificationItem
                        key={n.id}
                        n={n}
                        onItemClick={handleItemClick}
                        timeAgo={timeAgo}
                      />
                    ))}
                  </>
                )}
                {earlier.length > 0 && (
                  <>
                    <div className="nb-sec">Trước đó</div>
                    {earlier.map((n) => (
                      <NotificationItem
                        key={n.id}
                        n={n}
                        onItemClick={handleItemClick}
                        timeAgo={timeAgo}
                      />
                    ))}
                  </>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {shown.length > 0 && (
            <div className="nb-footer">
              <button className="nb-view-all" onClick={handleViewAll}>
                Xem tất cả thông báo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
