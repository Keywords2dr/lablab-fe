import React from "react";
import { LocalShipping } from "@mui/icons-material";

import { useRooms } from "./hooks/useRooms";
import SupplyAllocatePanel from "./components/SupplyAllocatePanel";
import SupplyRevokePanel from "./components/SupplyRevokePanel";
import "./styles/index.css";
import { useState } from "react";
import { SendOutlined, UndoOutlined } from "@mui/icons-material";

export default function RoomSupplyDistribution() {
  const { rooms, stats } = useRooms();
  const [activeTab, setActiveTab] = useState("allocate");

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
            <div className="rm-header-title">Phân Phối & Thu Hồi Vật Tư</div>
            <div className="rm-header-sub">
              Điều chuyển hoặc thu hồi hóa chất và vật tư từ các phòng thí nghiệm
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

      <div style={{ padding: "0 24px", marginBottom: "16px", display: 'flex', justifyContent: 'center' }}>
        <div className="stp-tabs--main">
          <button
            className={`stp-tab--main ${activeTab === "allocate" ? "stp-tab--active" : ""}`}
            onClick={() => setActiveTab("allocate")}
          >
            <SendOutlined style={{ fontSize: 18 }} />
            Phân phối vào phòng
          </button>
          <button
            className={`stp-tab--main ${activeTab === "revoke" ? "stp-tab--active stp-tab--revoke" : ""}`}
            onClick={() => setActiveTab("revoke")}
          >
            <UndoOutlined style={{ fontSize: 18 }} />
            Thu hồi từ phòng
          </button>
        </div>
      </div>

      {/* ── Supply Panel ── */}
      {activeTab === "allocate" ? (
        <SupplyAllocatePanel rooms={activeRooms} />
      ) : (
        <SupplyRevokePanel rooms={activeRooms} />
      )}
    </div>
  );
}
