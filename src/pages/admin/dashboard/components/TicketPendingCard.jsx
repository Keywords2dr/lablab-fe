import { useNavigate } from "react-router-dom";
import {
  ArrowForward, AccessTime, Science, MeetingRoom,
  CheckCircle, HourglassEmpty, OpenInNew,
} from "@mui/icons-material";
import { AVATAR_COLORS, TICKET_TYPE_LABEL } from "../constants/dashboardConstants";

function getTicketTypeClass(type) {
  if (!type) return "material";
  return type === "ROOM_ONLY" || type === "ROOM_AND_CHEMICAL" ? "room" : "material";
}
function getTicketTypeLabel(type) {
  return TICKET_TYPE_LABEL[type] || type || "—";
}
function getTicketTypeIcon(type) {
  return type === "ROOM_ONLY"
    ? <MeetingRoom style={{ fontSize: 12 }} />
    : <Science     style={{ fontSize: 12 }} />;
}

function TicketSkeleton() {
  return (
    <div className="adnew-ticket-list">
      {[1, 2, 3].map((i) => (
        <div key={i} className="adnew-ticket adnew-ticket-skeleton">
          <div className="adnew-skeleton adnew-skeleton-avatar" />
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
 * Card danh sách phiếu chờ duyệt — hiển thị tối đa 5 phiếu.
 */
export default function TicketPendingCard({ tickets, loading }) {
  const navigate = useNavigate();

  return (
    <div className="adnew-card">
      <div className="adnew-card-header">
        <div className="adnew-card-title-wrap">
          <HourglassEmpty className="adnew-card-icon" style={{ color: "#f59e0b" }} />
          <h2 className="adnew-card-title">
            Phiếu chờ duyệt
            {!loading && <span className="adnew-badge-count">{tickets.length}</span>}
          </h2>
        </div>
        <button className="adnew-btn-link" onClick={() => navigate("/admin/tickets")}>
          Xem tất cả <ArrowForward style={{ fontSize: 14 }} />
        </button>
      </div>

      {loading ? (
        <TicketSkeleton />
      ) : tickets.length === 0 ? (
        <div className="adnew-empty-state">
          <CheckCircle style={{ fontSize: 40, color: "#10b981", marginBottom: 8 }} />
          <p>Không còn phiếu nào cần xử lý!</p>
        </div>
      ) : (
        <div className="adnew-ticket-list">
          {tickets.slice(0, 5).map((t, idx) => (
            <div
              key={t.ticketId}
              className="adnew-ticket adnew-ticket-clickable"
              onClick={() => navigate(`/admin/tickets/${t.ticketId}`)}
              title="Bấm để xem chi tiết phiếu này"
            >
              <div
                className="adnew-ticket-avatar"
                style={{ background: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}
              >
                {(t.requesterName || t.userName || "?").charAt(0).toUpperCase()}
              </div>

              <div className="adnew-ticket-meta">
                <div className="adnew-ticket-user">
                  {t.requesterName || t.userName || "Người dùng"}
                  <span className="adnew-ticket-role">{t.requesterRole || t.role || ""}</span>
                </div>
                <div className="adnew-ticket-detail">
                  <span className={`adnew-ticket-type ${getTicketTypeClass(t.ticketType)}`}>
                    {getTicketTypeIcon(t.ticketType)}
                    {getTicketTypeLabel(t.ticketType)}
                  </span>
                  {t.roomName
                    ? t.roomName
                    : t.ticketType === "CHEMICAL_ONLY" ? "Yêu cầu vật tư" : "—"}
                </div>
                {t.createdAt && (
                  <div className="adnew-ticket-time">
                    <AccessTime style={{ fontSize: 11 }} />
                    {new Date(t.createdAt).toLocaleString("vi-VN", {
                      hour: "2-digit", minute: "2-digit",
                      day: "2-digit", month: "2-digit",
                    })}
                  </div>
                )}
              </div>

              <div className="adnew-ticket-actions" onClick={(e) => e.stopPropagation()}>
                <button
                  className="adnew-btn-detail"
                  onClick={() => navigate(`/admin/tickets/${t.ticketId}`)}
                >
                  <OpenInNew style={{ fontSize: 15 }} /> Chi tiết
                </button>
              </div>
            </div>
          ))}

          {tickets.length > 5 && (
            <button
              className="adnew-btn-link adnew-view-more"
              onClick={() => navigate("/admin/tickets")}
            >
              Xem thêm {tickets.length - 5} phiếu khác{" "}
              <ArrowForward style={{ fontSize: 14 }} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
