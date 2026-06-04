import React from "react";
import { WarningAmber, CheckCircle, Refresh } from "@mui/icons-material";

export default function AlertList({ alerts, loadingAlerts, onRefresh }) {
  return (
    <div className="sa-card">
      <div className="sa-card-header">
        <div className="sa-card-title">
          <WarningAmber style={{ color: "#f97316" }} />
          Hóa chất đang cảnh báo
        </div>
        <button
          className="sa-btn-del"
          style={{
            width: 32,
            height: 32,
            background: "#f8fafc",
            border: "1.5px solid #e2e8f0",
            color: "#64748b",
          }}
          onClick={onRefresh}
          title="Làm mới"
        >
          <Refresh fontSize="small" />
        </button>
      </div>
      <div className="sa-card-body">
        {loadingAlerts ? (
          <div className="sa-spinner">
            <div className="sa-spinner-ring" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="sa-empty">
            <CheckCircle style={{ color: "#22c55e" }} />
            <p>Không có hóa chất nào đang cảnh báo 🎉</p>
          </div>
        ) : (
          <div className="sa-alert-list">
            {alerts.map((alert) => {
              const isCritical = alert.alertLevel === "OUT_OF_STOCK";
              return (
                <div
                  key={alert.itemId}
                  className={`sa-alert-item ${isCritical ? "critical" : "warning"}`}
                >
                  <span className="sa-alert-icon">
                    {isCritical ? "🚨" : "⚠️"}
                  </span>
                  <div className="sa-alert-content">
                    <div className="sa-alert-name">
                      {alert.itemName || alert.itemCode}
                    </div>
                    <div className="sa-alert-detail">
                      Tồn kho:{" "}
                      <strong>
                        {alert.totalQuantity ?? 0} {alert.unit}
                      </strong>{" "}
                      / Ngưỡng:{" "}
                      <strong>
                        {alert.minQuantity} {alert.unit}
                      </strong>
                    </div>
                  </div>
                  <span
                    className={`sa-alert-badge ${isCritical ? "critical" : "warning"}`}
                  >
                    {isCritical ? "Hết hàng" : "Sắp hết"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
