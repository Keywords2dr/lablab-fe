import React from "react";
// ✅ Xóa import MOCK_SUPPLIES và SUPPLY_STATUS vì không tồn tại trong hook
import "../styles/SuppliesPanel.css";

// ✅ Định nghĩa SUPPLY_STATUS nội bộ trong file này
const SUPPLY_STATUS = {
  OK: { label: "Đủ dùng", cls: "active" },
  LOW: { label: "Sắp hết", cls: "waiting" },
  EMPTY: { label: "Hết hàng", cls: "rejected" },
  EXPIRED: { label: "Hết hạn", cls: "rejected" },
};

// Tính status từ dữ liệu inventory thực tế
function getSupplyStatus(item) {
  if (!item.quantity || item.quantity === 0) return "EMPTY";
  if (item.quantity <= (item.minQuantity || 5)) return "LOW";
  return "OK";
}

export default function SuppliesPanel({ room, supplies = [] }) {
  return (
    <div className="trm-panel">
      <div className="trm-panel-title">
        Vật tư & hóa chất — <span>{room.name}</span>
      </div>

      {supplies.length === 0 ? (
        <div className="trm-empty">Không có dữ liệu vật tư cho phòng này.</div>
      ) : (
        <div className="trm-supply-grid">
          {/* ✅ Dùng prop supplies thay vì MOCK_SUPPLIES */}
          {supplies.map((s) => {
            const status = getSupplyStatus(s);
            const total = s.totalQuantity ?? s.total ?? 0;
            const avail = s.quantity ?? s.available ?? 0;
            const unit = s.unit ?? "";
            const pct = total > 0 ? Math.round((avail / total) * 100) : 0;

            return (
              <div
                key={s.inventoryId ?? s.id}
                className={`trm-supply-card ${status.toLowerCase()}`}
              >
                <div className="trm-supply-top">
                  <span className="trm-supply-name">
                    {s.chemicalName ?? s.name ?? "N/A"}
                  </span>
                  <span
                    className={`trm-supply-badge ${SUPPLY_STATUS[status].cls}`}
                  >
                    {SUPPLY_STATUS[status].label}
                  </span>
                </div>
                <div className="trm-supply-nums">
                  <span className="trm-supply-avail">{avail}</span>
                  <span className="trm-supply-total">
                    {" "}
                    / {total} {unit}
                  </span>
                </div>
                <div className="trm-progress-bar">
                  <div
                    className={`trm-progress-fill ${status.toLowerCase()}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
