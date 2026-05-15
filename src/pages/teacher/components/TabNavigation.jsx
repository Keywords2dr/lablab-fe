import React from "react";
import { CheckCircle, Inventory, ReportProblem } from "@mui/icons-material";
import "../styles/TabNavigation.css";

const TABS = [
  {
    key: "approval",
    label: "Duyệt Phiếu",
    icon: <CheckCircle fontSize="small" />,
  },
  {
    key: "supplies",
    label: "Vật Tư Phòng",
    icon: <Inventory fontSize="small" />,
  },
  {
    key: "incident",
    label: "Báo Cáo Sự Cố",
    icon: <ReportProblem fontSize="small" />,
  },
];

export default function TabNavigation({
  activeTab,
  setActiveTab,
  pendingCount,
}) {
  return (
    <div className="trm-tabs">
      {TABS.map((t) => (
        <button
          key={t.key}
          className={`trm-tab ${activeTab === t.key ? "active" : ""}`}
          onClick={() => setActiveTab(t.key)}
        >
          {t.icon}
          {t.label}
          {t.key === "approval" && pendingCount > 0 && (
            <span className="trm-tab-badge">{pendingCount}</span>
          )}
        </button>
      ))}
    </div>
  );
}
