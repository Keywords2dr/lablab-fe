import React, { useState, useEffect } from "react";
import { ManageAccounts } from "@mui/icons-material";

import { useRooms } from "./hooks/useRooms";
import { useRoomManagers } from "./hooks/useRoomManagers";
import ManagerGridCard from "./components/ManagerGridCard";
import ManagerSideDrawer from "./components/ManagerSideDrawer";
import "./styles/index.css";

export default function RoomManagerAssignment() {
  const { rooms, stats, loading: roomsLoading } = useRooms();
  const {
    managers,
    assignableTeachers,
    loading,
    fetchManagers,
    fetchAssignableTeachers,
    assign,
    remove,
  } = useRoomManagers();

  const [selectedRoom, setSelectedRoom] = useState(null);

  const roomsList = Array.isArray(rooms) ? rooms : [];

  useEffect(() => {
    if (roomsList.length > 0) {
      const timer = setTimeout(() => {
        roomsList.forEach((room, index) => {
          if (managers[room.roomId] === undefined && !loading[room.roomId]) {
            setTimeout(() => {
              fetchManagers(room.roomId);
            }, index * 50); // Stagger requests by 50ms to prevent network clogging
          }
        });
      }, 300);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomsList]);

  return (
    <div className="rm-root">
      {/* ── Page Header ── */}
      <div className="rm-header--premium">
        <div className="rm-header-left">
          <div className="rm-header-icon">
            <ManageAccounts style={{ fontSize: 28 }} />
          </div>
          <div className="rm-header-text">
            <div className="rm-header-title">Phân Quyền Quản Lý Phòng</div>
            <div className="rm-header-sub">
              Gán giáo viên làm quản lý cho từng phòng thí nghiệm
            </div>
          </div>
        </div>

        <div className="rm-stats">
          <div className="rm-stat-badge">
            <div className="rm-stat-num">{stats.active}</div>
            <div className="rm-stat-lbl">Phòng hoạt động</div>
          </div>

          {stats.roomsWithoutStaff > 0 && (
            <div className="rm-stat-badge rm-stat-badge--warn">
              <div className="rm-stat-num">{stats.roomsWithoutStaff}</div>
              <div className="rm-stat-lbl">Chưa có QL</div>
            </div>
          )}

          <div className="rm-stat-badge rm-stat-badge--info">
            <div className="rm-stat-num">{stats.totalActiveTeachers ?? 0}</div>
            <div className="rm-stat-lbl">Giáo viên</div>
          </div>
        </div>
      </div>

      {/* ── Grid Area ── */}
      <div className="rm-grid">
        {roomsLoading && roomsList.length === 0 ? (
          Array.from({ length: 8 }).map((_, i) => (
            <ManagerGridCard key={`skel-${i}`} room={null} />
          ))
        ) : (
          roomsList.map((room) => (
            <ManagerGridCard
              key={room.roomId}
              room={room}
              managers={managers[room.roomId]}
              isActive={selectedRoom?.roomId === room.roomId}
              onClick={() => setSelectedRoom(room)}
            />
          ))
        )}
      </div>

      {/* ── Side Drawer ── */}
      <ManagerSideDrawer
        room={selectedRoom}
        managers={selectedRoom ? managers[selectedRoom.roomId] : []}
        assignableTeachers={selectedRoom ? assignableTeachers[selectedRoom.roomId] : []}
        loadingMap={loading}
        onClose={() => setSelectedRoom(null)}
        onFetchAssignableTeachers={fetchAssignableTeachers}
        onAssign={assign}
        onRemove={remove}
      />
    </div>
  );
}
