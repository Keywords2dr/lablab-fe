import React from "react";
import { Inventory as InventoryIcon } from "@mui/icons-material";

export default function MaterialHeader({
  totalElements,
  hasOutOfStock,
  outOfStockCount,
  filters,
  applyFilters,
}) {
  return (
    <div className="mm-header">
      <div className="mm-header-left">
        <div className="mm-header-icon">
          <InventoryIcon />
        </div>
        <div>
          <div className="mm-header-title">Quản lý Hóa chất</div>
          <div className="mm-header-sub">
            Theo dõi và quản lý toàn bộ hóa chất trong phòng thí nghiệm
          </div>
        </div>
      </div>

      <div className="mm-stats">
        {/* Tổng số */}
        <div className="mm-stat-badge" title="Tổng số hóa chất">
          <div className="num">{totalElements}</div>
          <div className="lbl">Tổng số</div>
        </div>

        {/* Hết hàng */}
        <div
          className="mm-stat-badge"
          title={
            hasOutOfStock
              ? "Xem hóa chất hết hàng"
              : "Không có hóa chất nào hết hàng"
          }
          style={
            hasOutOfStock
              ? {
                  cursor: "pointer",
                  background: "rgba(60, 20, 30, 0.55)",
                  border: "1.5px solid rgba(239, 68, 68, 0.55)",
                  color: "#f87171",
                }
              : {
                  cursor: "default",
                  background: "rgba(20, 60, 30, 0.45)",
                  border: "1.5px solid rgba(34, 197, 94, 0.45)",
                  color: "#4ade80",
                }
          }
          onClick={() => {
            if (hasOutOfStock)
              applyFilters({ outOfStock: !filters.outOfStock });
          }}
        >
          <div className="num" style={{ color: "inherit" }}>
            {outOfStockCount}
          </div>
          <div className="lbl" style={{ color: "inherit", opacity: 0.8 }}>
            Hết hàng
          </div>
        </div>
      </div>
    </div>
  );
}
