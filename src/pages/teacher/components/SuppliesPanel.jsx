import React from "react";
import { Science, InfoOutlined } from "@mui/icons-material";
import "../styles/SuppliesPanel.css";

const CATEGORY_MAP = {
  CHEMICAL: { label: "Hóa chất", cls: "chemical" },
  EQUIPMENT: { label: "Dụng cụ", cls: "equipment" },
};

export default function SuppliesPanel({
  room,
  supplies = [],
  suppliesPage,
  setSuppliesPage,
  suppliesTotalPages,
}) {
  return (
    <div className="trm-panel">
      <div
        className="trm-panel-header-row"
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <div className="trm-panel-title">
          Vật tư & hóa chất — <span>{room.name}</span>
        </div>
      </div>

      <div className="trm-table-wrap">
        {supplies.length === 0 ? (
          <div className="trm-empty">
            Không có dữ liệu vật tư trong kho phòng này.
          </div>
        ) : (
          <>
            <table className="trm-table">
              <thead>
                <tr>
                  <th>Mã HC</th>
                  <th>Tên hóa chất / Vật tư</th>
                  <th>Công thức</th>
                  <th>Loại</th>
                  <th style={{ textAlign: "center" }}>Đơn vị</th>
                  <th style={{ textAlign: "right" }}>Khả dụng</th>
                  <th style={{ textAlign: "right" }}>Cho mượn</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {supplies.map((s) => (
                  <tr key={s.inventoryId || s.itemId}>
                    <td className="trm-col-code">
                      <code
                        style={{
                          background: "#f1f5f9",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          color: "#0ea5e9",
                          fontWeight: 700,
                        }}
                      >
                        {s.itemCode}
                      </code>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <Science sx={{ fontSize: 16, color: "#64748b" }} />
                        <strong>{s.itemName}</strong>
                      </div>
                    </td>
                    <td style={{ fontStyle: "italic", color: "#334155" }}>
                      {s.chemicalFormula || "—"}
                    </td>
                    <td>
                      <span
                        className={`trm-type-badge ${s.categoryType === "CHEMICAL" ? "chemical" : "room"}`}
                        style={{ fontSize: "11px" }}
                      >
                        {CATEGORY_MAP[s.categoryType]?.label || s.categoryType}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>{s.unit}</td>
                    <td style={{ textAlign: "right" }}>
                      <span
                        style={{
                          fontWeight: 800,
                          color:
                            s.availableQuantity <= 0 ? "#ef4444" : "#059669",
                          fontSize: "16px",
                        }}
                      >
                        {s.availableQuantity?.toLocaleString()}
                      </span>
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        color: "#f59e0b",
                        fontWeight: 600,
                      }}
                    >
                      {s.lockedQuantity > 0
                        ? s.lockedQuantity.toLocaleString()
                        : "0"}
                    </td>
                    <td>
                      <div
                        className="trm-note-cell"
                        title={s.note}
                        style={{ fontSize: "13px", color: "#64748b" }}
                      >
                        {s.note ? (
                          <>
                            <InfoOutlined sx={{ fontSize: 14 }} /> {s.note}
                          </>
                        ) : (
                          <span style={{ opacity: 0.3 }}>—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {suppliesTotalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "16px",
                  padding: "16px 0",
                  borderTop: "1px solid #f1f5f9",
                  background: "#fff",
                }}
              >
                <button
                  className="trm-btn ghost"
                  disabled={suppliesPage === 0}
                  onClick={() => setSuppliesPage(suppliesPage - 1)}
                >
                  Trang trước
                </button>
                <span
                  style={{
                    fontSize: "14px",
                    color: "#64748b",
                    fontWeight: 500,
                  }}
                >
                  Trang {suppliesPage + 1} / {suppliesTotalPages}
                </span>
                <button
                  className="trm-btn ghost"
                  disabled={suppliesPage >= suppliesTotalPages - 1}
                  onClick={() => setSuppliesPage(suppliesPage + 1)}
                >
                  Trang sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
