import React from "react";
import { Delete } from "@mui/icons-material";

export default function DeleteConfirmModal({ target, onClose, onConfirm, loading }) {
  if (!target) return null;
  return (
    <div className="sa-overlay" onClick={onClose}>
      <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sa-modal-icon">
          <Delete />
        </div>
        <h3>Xóa ngưỡng cảnh báo?</h3>
        <p>
          Bạn có chắc muốn xóa ngưỡng cảnh báo cho hóa chất{" "}
          <strong>{target.itemName || target.itemCode}</strong>? Hành động này
          không thể hoàn tác.
        </p>
        <div className="sa-modal-actions">
          <button className="sa-btn-cancel" onClick={onClose} disabled={loading}>
            Hủy
          </button>
          <button className="sa-btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? "Đang xóa..." : "Xóa"}
          </button>
        </div>
      </div>
    </div>
  );
}
