import { TYPE_CONFIG } from "../notifications/notificationConstants";
import { useNotificationsPage } from "./useNotificationsPage";
import "./NotificationsPage.css";

// ── Sub-component: một item thông báo trong danh sách ─────────────────────
function NotificationItem({ n, onClick, timeAgo }) {
  const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.default;
  return (
    <div
      className={`noti-item ${!n.isRead ? "unread" : ""}`}
      onClick={() => onClick(n)}
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
}

// ── Component chính ────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const {
    filtered,
    loading,
    hasMore,
    filter,
    setFilter,
    loadMore,
    markAllRead,
    handleNotiClick,
    timeAgo,
  } = useNotificationsPage();

  return (
    <div className="notifications-page">
      <div className="page-container">
        {/* Header */}
        <div className="page-header">
          <h1>Thông báo</h1>
          <button className="mark-all-btn" onClick={markAllRead}>
            Đánh dấu tất cả đã đọc
          </button>
        </div>

        {/* Tabs */}
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

        {/* Danh sách */}
        <div className="noti-list">
          {filtered.length === 0 && !loading ? (
            <div className="empty-state">
              <div className="empty-icon">🔔</div>
              <h3>Không có thông báo</h3>
              <p>Bạn đã xem hết tất cả thông báo</p>
            </div>
          ) : (
            filtered.map((n) => (
              <NotificationItem
                key={n.id}
                n={n}
                onClick={handleNotiClick}
                timeAgo={timeAgo}
              />
            ))
          )}
        </div>

        {/* Load more */}
        {hasMore && !loading && (
          <button className="load-more" onClick={loadMore}>
            Tải thêm
          </button>
        )}
      </div>
    </div>
  );
}
