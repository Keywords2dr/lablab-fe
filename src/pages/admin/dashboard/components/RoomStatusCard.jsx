import { useNavigate } from "react-router-dom";
import { ArrowForward, MeetingRoom } from "@mui/icons-material";

function RoomSkeleton() {
  return (
    <div className="adnew-room-list">
      {[1, 2, 3].map((i) => (
        <div key={i} className="adnew-room-item">
          <div className="adnew-skeleton" style={{ width: 10, height: 10, borderRadius: "50%" }} />
          <div className="adnew-skeleton-lines" style={{ flex: 1 }}>
            <div className="adnew-skeleton adnew-skeleton-line" />
            <div className="adnew-skeleton adnew-skeleton-line short" />
          </div>
        </div>
      ))}
    </div>
  );
}

function formatReturnTime(isoString) {
  if (!isoString) return null;
  try {
    return new Date(isoString).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  } catch { return null; }
}

const STATUS_COUNT = (roomUsage, status) =>
  roomUsage.filter((r) => r.status === status).length;

/**
 * Card trạng thái phòng lab hôm nay (occupied / available / maintenance).
 */
export default function RoomStatusCard({ roomUsage, loading }) {
  const navigate = useNavigate();

  return (
    <div className="adnew-card">
      <div className="adnew-card-header">
        <div className="adnew-card-title-wrap">
          <MeetingRoom className="adnew-card-icon" style={{ color: "#10b981" }} />
          <h2 className="adnew-card-title">Phòng Lab hôm nay</h2>
        </div>
        <button className="adnew-btn-link" onClick={() => navigate("/admin/rooms")}>
          Quản lý <ArrowForward style={{ fontSize: 14 }} />
        </button>
      </div>

      {loading ? (
        <RoomSkeleton />
      ) : roomUsage.length === 0 ? (
        <div className="adnew-empty-state" style={{ minHeight: 80 }}>
          <MeetingRoom style={{ fontSize: 36, color: "#cbd5e1", marginBottom: 8 }} />
          <p>Không có dữ liệu phòng.</p>
        </div>
      ) : (
        <>
          <div className="adnew-room-summary">
            <span className="adnew-room-pill occupied">
              {STATUS_COUNT(roomUsage, "occupied")} đang dùng
            </span>
            <span className="adnew-room-pill available">
              {STATUS_COUNT(roomUsage, "available")} trống
            </span>
            <span className="adnew-room-pill maintenance">
              {STATUS_COUNT(roomUsage, "maintenance")} bảo trì
            </span>
          </div>

          <div className="adnew-room-list">
            {roomUsage.map((room) => (
              <div key={room.roomId} className={`adnew-room-item adnew-room-${room.status}`}>
                <div className="adnew-room-indicator" />
                <div className="adnew-room-info">
                  <span className="adnew-room-name">{room.roomName}</span>
                  {room.status === "occupied" && (
                    <span className="adnew-room-user">
                      {room.borrowerName}
                      {room.expectedReturnDate && (
                        <> · đến {formatReturnTime(room.expectedReturnDate)}</>
                      )}
                    </span>
                  )}
                  {room.status === "available"   && <span className="adnew-room-user">Sẵn sàng sử dụng</span>}
                  {room.status === "maintenance"  && <span className="adnew-room-user">Đang bảo trì</span>}
                </div>
                <span className="adnew-room-badge">
                  {room.status === "occupied"   && "Đang dùng"}
                  {room.status === "available"  && "Trống"}
                  {room.status === "maintenance" && "Bảo trì"}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
