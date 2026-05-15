import React, { useState } from "react";
import { CancelOutlined } from "@mui/icons-material";
import "../styles/ticketTimeline.css";

/**
 * Modal xác nhận hủy phiếu
 */
export default function ConfirmCancelModal({ ticket, onConfirm, onClose }) {
  const [cancelNote, setCancelNote] = useState("");

  if (!ticket) return null;

  const handleSubmit = () => {
    onConfirm(ticket.ticketId, cancelNote);
    onClose();
  };

  return (
    <div className="cam-overlay" onClick={onClose}>
      <div
        className="cam-modal"
        style={{ maxWidth: "450px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cam-header">
          <div className="cam-icon cancel">
            <CancelOutlined />
          </div>
          <div>
            <div className="cam-title">Hủy phiếu mượn</div>
            <div className="cam-sub">Phiếu: {ticket.ticketId}</div>
          </div>
        </div>

        <div className="cam-body">
          <div className="cam-textarea-label">Lý do hủy</div>
          <textarea
            className="cam-textarea"
            placeholder="Nhập lý do hủy phiếu..."
            value={cancelNote}
            onChange={(e) => setCancelNote(e.target.value)}
          />
        </div>

        <div className="cam-footer">
          <button className="cam-btn ghost" onClick={onClose}>
            Quay lại
          </button>
          <button className="cam-btn danger" onClick={handleSubmit}>
            Xác nhận hủy
          </button>
        </div>
      </div>
    </div>
  );
}
