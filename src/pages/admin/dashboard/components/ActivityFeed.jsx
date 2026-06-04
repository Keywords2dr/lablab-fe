import { useNavigate } from "react-router-dom";
import { ArrowForward, History, Build, AdminPanelSettings } from "@mui/icons-material";
import { FEED_CATEGORY_ICON, FEED_CATEGORY_COLOR } from "../constants/dashboardConstants";

function FeedSkeleton() {
  return (
    <div className="adnew-feed-list">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="adnew-feed-item adnew-feed-skeleton">
          <div className="adnew-skeleton adnew-skeleton-circle" />
          <div className="adnew-skeleton-lines">
            <div className="adnew-skeleton adnew-skeleton-line" />
            <div className="adnew-skeleton adnew-skeleton-line short" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Card hoạt động gần đây.
 */
export default function ActivityFeed({ feedItems, loading }) {
  const navigate = useNavigate();

  return (
    <div className="adnew-card">
      <div className="adnew-card-header">
        <div className="adnew-card-title-wrap">
          <History className="adnew-card-icon" style={{ color: "#3b82f6" }} />
          <h2 className="adnew-card-title">Hoạt động gần đây</h2>
        </div>
        <button className="adnew-btn-link" onClick={() => navigate("/admin/audit-logs")}>
          Xem logs <ArrowForward style={{ fontSize: 14 }} />
        </button>
      </div>

      {loading ? (
        <FeedSkeleton />
      ) : feedItems.length === 0 ? (
        <div className="adnew-empty-state">
          <History style={{ fontSize: 36, color: "#cbd5e1", marginBottom: 8 }} />
          <p>Chưa có hoạt động nào được ghi nhận.</p>
        </div>
      ) : (
        <div className="adnew-feed-list">
          {feedItems.map((item) => (
            <div key={item.logId} className="adnew-feed-item">
              <div
                className="adnew-feed-icon"
                style={{
                  background: `${FEED_CATEGORY_COLOR[item.category] ?? "#94a3b8"}18`,
                  color: FEED_CATEGORY_COLOR[item.category] ?? "#94a3b8",
                }}
              >
                {FEED_CATEGORY_ICON[item.category] ?? <Build style={{ fontSize: 15 }} />}
              </div>
              <div className="adnew-feed-body">
                <p className="adnew-feed-desc">{item.description}</p>
                <div className="adnew-feed-meta">
                  <span className="adnew-feed-actor">
                    <AdminPanelSettings style={{ fontSize: 12 }} />
                    {item.actorName}
                  </span>
                  <span className="adnew-feed-time">{item.timeAgo}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
