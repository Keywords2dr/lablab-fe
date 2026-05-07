import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { Close, RestoreFromTrash, Delete } from "@mui/icons-material";
import { chemicalApi } from "../../../../api/chemicalApi";
import "./TrashModal.css";

export default function TrashModal({ open, onClose, onRestored }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(null);

  const fetchTrash = useCallback(async () => {
    setLoading(true);
    try {
      const res = await chemicalApi.getTrash();
      setItems(res.data || []);
    } catch (err) {
      toast.error("❌ Không tải được thùng rác: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) fetchTrash();
    else setItems([]);
  }, [open, fetchTrash]);

  const handleRestore = async (item) => {
    setRestoring(item.itemId);
    try {
      await chemicalApi.restoreChemical(item.itemId);
      toast.success(`✅ Đã khôi phục "${item.name}" thành công!`);
      setItems((prev) => prev.filter((i) => i.itemId !== item.itemId));
      onRestored(); // báo parent refresh bảng chính
    } catch (err) {
      toast.error("❌ Khôi phục thất bại: " + (err.response?.data?.message || err.message));
    } finally {
      setRestoring(null);
    }
  };

  if (!open) return null;

  return (
    <div className="mm-overlay">
      <div className="mm-modal mm-trash-modal">
        {/* Header */}
        <div className="mm-modal-header">
          <div className="mm-modal-title">
            🗑️ Thùng rác
            <span>Hóa chất đã xóa — có thể khôi phục</span>
          </div>
          <button className="mm-modal-close" onClick={onClose}><Close /></button>
        </div>

        {/* Body */}
        <div className="mm-modal-body mm-trash-body">
          {loading ? (
            <div className="mm-trash-empty">
              <Delete />
              <p>Đang tải...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="mm-trash-empty">
              <Delete />
              <p>Thùng rác trống</p>
            </div>
          ) : (
            <table className="mm-table">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Tên hóa chất</th>
                  <th>Công thức</th>
                  <th className="center">Đơn vị</th>
                  <th className="center">Nhà CC</th>
                  <th className="center">Khôi phục</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.itemId} className="mm-trash-row">
                    <td><span className="mm-code">{item.itemCode}</span></td>
                    <td><span className="mm-name" style={{ color: "#94a3b8" }}>{item.name}</span></td>
                    <td style={{ fontFamily: "monospace", fontSize: "0.82rem", color: "#c4b5fd" }}>
                      {item.formula || "—"}
                    </td>
                    <td className="center">{item.unit || "—"}</td>
                    <td className="center" style={{ fontSize: "0.82rem", color: "#64748b" }}>
                      {item.supplier || "—"}
                    </td>
                    <td className="center">
                      <button
                        className="mm-btn-restore"
                        disabled={restoring === item.itemId}
                        onClick={() => handleRestore(item)}
                        title="Khôi phục hóa chất này"
                      >
                        <RestoreFromTrash style={{ fontSize: 16, marginRight: 5, verticalAlign: "middle" }} />
                        {restoring === item.itemId ? "Đang khôi phục..." : "Khôi phục"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="mm-divider" />
        <div className="mm-modal-footer" style={{ justifyContent: "space-between" }}>
          <span style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
            {items.length > 0 ? `${items.length} hóa chất trong thùng rác` : ""}
          </span>
          <button className="mm-btn-cancel" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}
