import React from "react";
import { MeetingRoom, Circle } from "@mui/icons-material";
import { ROOM_STATUS_MAP } from "../hooks/useRoomManagement";
import "../styles/RoomCard.css";

export default function RoomCard({
  room,
  managedRooms,
  selectedRoomId,
  setSelectedRoomId,
}) {
  if (!room) return null;

  return (
    <div className="trm-room-card">
      <div className="trm-room-left">
        <div className="trm-room-icon-wrap">
          <MeetingRoom />
        </div>
        <div className="trm-room-info">
          <div
            className="trm-room-eyebrow"
            style={{ display: "flex", alignItems: "center" }}
          >
            PHÒNG BẠN QUẢN LÝ
            {managedRooms && managedRooms.length > 1 && (
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                style={{
                  marginLeft: "12px",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  border: "1px solid rgba(255,255,255,0.4)",
                  background: "rgba(255,255,255,0.1)",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: "600",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {managedRooms.map((r) => {
                  const rId = r.roomId || r.room?.roomId || r.id;
                  const rName =
                    r.roomName ||
                    r.room?.roomName ||
                    r.name ||
                    `Phòng chưa xác định`;
                  return (
                    <option key={rId} value={rId} style={{ color: "#0f172a" }}>
                      Phòng {rName}
                    </option>
                  );
                })}
              </select>
            )}
          </div>
          <h1 className="trm-room-name">Phòng {room.name}</h1>
          <div className="trm-room-meta">
            <span>
              Quản lý bởi: <strong>Bạn (Giáo viên phụ trách)</strong>
            </span>
          </div>
          <p className="trm-room-desc">{room.description}</p>
        </div>
      </div>
      <div className="trm-room-right">
        <span
          className={`trm-room-status ${ROOM_STATUS_MAP[room.status]?.cls || "active"}`}
        >
          <Circle sx={{ fontSize: 9 }} />
          {ROOM_STATUS_MAP[room.status]?.label || "Hoạt động"}
        </span>
      </div>
    </div>
  );
}
