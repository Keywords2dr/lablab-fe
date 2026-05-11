import React from "react";
import { LocalShipping } from "@mui/icons-material";

import { useRooms } from "./hooks/useRooms";
import SupplyTransferPanel from "./components/SupplyTransferPanel";
import "./styles/base.css";
import "./styles/supply.css";

export default function RoomSupplyDistribution() {
  const { rooms, stats } = useRooms();

  const roomsList = Array.isArray(rooms) ? rooms : [];
  const activeRooms = roomsList.filter((r) => r.isActive === true);

  return (
    <div className="rm-root">
      {/* ── Page Header ── */}
      <div className="rm-header rm-header--amber">
        <div className="rm-header-left">
          <div className="rm-header-icon rm-header-icon--amber">
            <LocalShipping />
          </div>
          <div>
            <div className="rm-header-title">Phân Phối Vật Tư về Phòng</div>
            <div className="rm-header-sub">
              Điều chuyển hóa chất và vật tư từ kho trung tâm vào các phòng thí
              nghiệm
            </div>
          </div>
        </div>

        <div className="rm-stats">
          <div className="rm-stat-badge">
            <div className="num">{stats.active}</div>
            <div className="lbl">Phòng hoạt động</div>
          </div>

          <div className="rm-stat-badge rm-stat-badge--red">
            <div className="num">{stats.inactive}</div>
            <div className="lbl">Ngừng hoạt động</div>
          </div>
        </div>
      </div>

      {/* ── Supply Panel ── */}
      <SupplyTransferPanel rooms={activeRooms} />
    </div>
  );
}
