import React, { useState } from "react";
import { DoNotDisturb, Close } from "@mui/icons-material";
import { toast } from "react-toastify";

export default function RoomDeactivateModal({ target, onClose, onConfirm, onDeactivateRoom }) {
  const [loading, setLoading] = useState(false);

  if (!target) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onDeactivateRoom(target.roomId);
      toast.success(`🚫 Đã ngừng hoạt động phòng "${target.roomName}"`);
      onConfirm();
    } catch (err) {
      toast.error(`❌ ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="rm-modal rm-modal-sm">
        <div className="rm-delete-icon" style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444" }}>
          <DoNotDisturb style={{ fontSize: 32 }} />
        </div>

        <h3 className="rm-delete-title">Ngừng hoạt động phòng này?</h3>

        <p className="rm-delete-sub">
          Phòng <strong>{target.roomName}</strong> sẽ được chuyển sang trạng thái
          <strong> Ngừng hoạt động</strong>.<br />
          Bạn có thể kích hoạt lại bất kỳ lúc nào từ danh sách phòng.
        </p>

        <div className="rm-modal-footer">
          <button className="rm-btn-cancel" onClick={onClose} disabled={loading}>
            Hủy
          </button>
          <button className="rm-btn-delete" onClick={handleConfirm} disabled={loading}>
            {loading ? "Đang xử lý..." : "Xác nhận ngừng HĐ"}
          </button>
        </div>

        <button
          className="rm-modal-close"
          style={{ position: "absolute", top: 16, right: 16 }}
          onClick={onClose}
          disabled={loading}
        >
          <Close />
        </button>
      </div>
    </div>
  );
}