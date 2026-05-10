import React from "react";
import { ManageAccounts } from "@mui/icons-material";

import { useRooms } from "./hooks/useRooms";
import { useRoomManagers } from "./hooks/useRoomManagers";
import ManagerAssignPanel from "./components/ManagerAssignPanel";
import "./styles/base.css";
import "./styles/staff.css";

export default function RoomManagerAssignment() {
  const { rooms, stats } = useRooms();
  const {
    managers,
    assignableTeachers,
    loading,
    fetchManagers,
    fetchAssignableTeachers,
    assign,
    remove,
  } = useRoomManagers();

  const roomsList = Array.isArray(rooms) ? rooms : [];

  return (
    <div className="rm-root">
      {/* ── Page Header ── */}
      <div className="rm-header rm-header--purple">
        <div className="rm-header-left">
          <div className="rm-header-icon rm-header-icon--purple">
            <ManageAccounts />
          </div>
          <div>
            <div className="rm-header-title">Phân Quyền Quản Lý Phòng</div>
            <div className="rm-header-sub">
              Gán giáo viên làm quản lý cho từng phòng thí nghiệm
            </div>
          </div>
        </div>

        <div className="rm-stats">
          <div className="rm-stat-badge">
            <div className="num">{stats.active}</div>
            <div className="lbl">Phòng hoạt động</div>
          </div>

          {stats.roomsWithoutStaff > 0 && (
            <div className="rm-stat-badge rm-stat-badge--red">
              <div className="num">{stats.roomsWithoutStaff}</div>
              <div className="lbl">Chưa có QL</div>
            </div>
          )}

          <div className="rm-stat-badge rm-stat-badge--purple">
            <div className="num">{stats.totalActiveTeachers ?? 0}</div>
            <div className="lbl">Giáo viên</div>
          </div>
        </div>
      </div>

      {/* ── Manager Panel ── */}
      <ManagerAssignPanel
        rooms={roomsList}
        managers={managers}
        assignableTeachers={assignableTeachers}
        loading={loading}
        onFetchManagers={fetchManagers}
        onFetchAssignableTeachers={fetchAssignableTeachers}
        onAssign={assign}
        onRemove={remove}
      />
    </div>
  );
}
