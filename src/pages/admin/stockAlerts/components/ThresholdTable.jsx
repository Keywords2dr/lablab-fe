import React from "react";
import { Science, Delete, Refresh } from "@mui/icons-material";

export default function ThresholdTable({
  thresholds,
  loadingThresholds,
  onDelete,
  onRefresh,
}) {
  return (
    <div className="sa-card" style={{ gridColumn: "1 / -1" }}>
      <div className="sa-card-header">
        <div className="sa-card-title">
          <Science />
          Danh sách Ngưỡng đã cài đặt ({thresholds.length})
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
      <div className="sa-card-body" style={{ paddingTop: 8 }}>
        {loadingThresholds ? (
          <div className="sa-spinner">
            <div className="sa-spinner-ring" />
          </div>
        ) : thresholds.length === 0 ? (
          <div className="sa-empty">
            <Science />
            <p>Chưa có ngưỡng cảnh báo nào được cài đặt</p>
          </div>
        ) : (
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Mã hóa chất</th>
                  <th>Tên hóa chất</th>
                  <th className="right">Mức cảnh báo</th>
                  <th className="center">Đơn vị</th>
                  <th className="center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {thresholds.map((t, idx) => (
                  <tr key={t.itemId}>
                    <td style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                      {idx + 1}
                    </td>
                    <td>
                      <span className="sa-chemical-code">
                        {t.itemCode || "—"}
                      </span>
                    </td>
                    <td>
                      <span className="sa-chemical-name">
                        {t.itemName || "—"}
                      </span>
                    </td>
                    <td className="right">
                      <span className="sa-threshold-value">
                        {t.minQuantity}
                      </span>
                    </td>
                    <td className="center">
                      <span className="sa-unit-badge">{t.unit || "—"}</span>
                    </td>
                    <td className="center">
                      <button
                        className="sa-btn-del"
                        title="Xóa ngưỡng"
                        onClick={() => onDelete(t)}
                      >
                        <Delete />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
