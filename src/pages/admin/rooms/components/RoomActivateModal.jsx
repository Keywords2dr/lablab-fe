import React, { useState } from "react";
import { PowerSettingsNew, Close } from "@mui/icons-material";
import { toast } from "react-toastify";

export default function RoomActivateModal({ target, onClose, onConfirm, onActivateRoom }) {
  const [loading, setLoading] = useState(false);

  if (!target) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onActivateRoom(target.roomId);
      toast.success(` Đã kích hoạt lại phòng "${target.roomName}"`);
      onConfirm();
    } catch (err) {
      toast.error(` ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="rm-modal rm-modal-sm">
        <div className="rm-delete-icon" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>
          <PowerSettingsNew style={{ fontSize: 32 }} />
        </div>

        <h3 className="rm-delete-title">Kích hoạt lại phòng này?</h3>

        <p className="rm-delete-sub">
          Phòng <strong>{target.roomName}</strong> sẽ được chuyển về trạng thái
          <strong> Hoạt động</strong> và có thể sử dụng trở lại.
        </p>

        <div className="rm-modal-footer" style={{ justifyContent: "center" }}>
          <button className="rm-btn-cancel" onClick={onClose} disabled={loading}>
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            style={{
              padding: "0 20px", height: 40, borderRadius: 10, border: "none",
              background: "linear-gradient(135deg,#10b981,#059669)",
              color: "#fff", fontSize: "0.875rem", fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              display: "flex", alignItems: "center", gap: 6,
              boxShadow: "0 2px 8px rgba(16,185,129,0.35)",
              transition: "all 0.2s",
            }}
          >
            <PowerSettingsNew style={{ fontSize: 17 }} />
            {loading ? "Đang xử lý..." : "Xác nhận kích hoạt"}
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