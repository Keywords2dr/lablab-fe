import React, { useState } from "react";
import { toast } from "react-toastify";
import { Close, Delete } from "@mui/icons-material";
import { chemicalApi } from "../../../../api/chemicalApi";
import "./DeleteConfirmModal.css";

export default function DeleteConfirmModal({ target, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);

  if (!target) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await chemicalApi.deleteChemical(target.itemId);
      toast.success(`🗑️ "${target.name}" đã được chuyển vào thùng rác.`);
      onConfirm();
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.message;
      if (status === 403 || status === 401) {
        toast.error("🔒 Không có quyền thực hiện thao tác này.");
      } else if (status === 409) {
        toast.error("❌ Không thể xóa: hóa chất đang được sử dụng trong kho.");
      } else {
        toast.error("❌ Lỗi xóa: " + msg);
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mm-overlay">
      <div className="mm-modal" style={{ maxWidth: 420 }}>
        <div className="mm-modal-header">
          <div />
          <button className="mm-modal-close" onClick={onClose} disabled={deleting}>
            <Close />
          </button>
        </div>
        <div className="mm-modal-body">
          <div className="mm-confirm-icon"><Delete /></div>
          <div className="mm-confirm-text">
            <h3>Chuyển vào thùng rác?</h3>
            <p>
              Hóa chất <strong>"{target.name}"</strong> ({target.itemCode})<br />
              sẽ được chuyển vào <strong>Thùng rác</strong>.<br />
              Bạn có thể khôi phục lại từ mục Thùng rác.
            </p>
          </div>
        </div>
        <div className="mm-modal-footer" style={{ justifyContent: "center", gap: 12 }}>
          <button className="mm-btn-cancel" onClick={onClose} disabled={deleting}>Hủy</button>
          <button className="mm-btn-del" onClick={handleConfirm} disabled={deleting}>
            <Delete style={{ fontSize: 16, marginRight: 6, verticalAlign: "middle" }} />
            {deleting ? "Đang xóa..." : "Xóa hóa chất"}
          </button>
        </div>
      </div>
    </div>
  );
}
