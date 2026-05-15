import React from "react";
import { MeetingRoom, AccessTime, Circle } from "@mui/icons-material";
import { ROOM_STATUS_MAP } from "../hooks/useRoomManagement";
import "../styles/RoomCard.css";

export default function RoomCard({ room, pendingCount }) {
  return (
    <div className="trm-room-card">
      <div className="trm-room-left">
        <div className="trm-room-icon-wrap">
          <MeetingRoom />
        </div>
        <div className="trm-room-info">
          <div className="trm-room-eyebrow">Phòng bạn quản lý</div>
          <h1 className="trm-room-name">{room.name}</h1>
          <div className="trm-room-meta">
            <span>{room.building}</span>
            <span className="trm-dot">·</span>
            <span>Sức chứa: {room.capacity} người</span>
            <span className="trm-dot">·</span>
            <span>
              Mã: <strong>{room.id}</strong>
            </span>
          </div>
          <p className="trm-room-desc">{room.description}</p>
        </div>
      </div>
      <div className="trm-room-right">
        <span className={`trm-room-status ${ROOM_STATUS_MAP[room.status].cls}`}>
          <Circle sx={{ fontSize: 9 }} />
          {ROOM_STATUS_MAP[room.status].label}
        </span>
        {pendingCount > 0 && (
          <div className="trm-pending-alert">
            <AccessTime fontSize="small" />
            <span>
              <strong>{pendingCount}</strong> phiếu chờ duyệt
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
