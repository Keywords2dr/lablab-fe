import React, { useState } from "react";
import { AssignmentReturnOutlined } from "@mui/icons-material";
import "../styles/ticketTimeline.css";

/**
 * Modal xác nhận trả PHÒNG — chỉ cần ghi chú chung, không có items
 */
export default function ConfirmReturnRoomModal({ ticket, onConfirm, onClose }) {
  const [returnNote, setReturnNote] = useState("");

  if (!ticket) return null;

  const handleSubmit = () => {
    onConfirm(ticket.ticketId, { items: [], returnNote: returnNote.trim() });
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
          <div className="cam-icon return">
            <AssignmentReturnOutlined />
          </div>
          <div>
            <div className="cam-title">Yêu cầu trả phòng</div>
            <div className="cam-sub">Phiếu: {ticket.ticketId}</div>
          </div>
        </div>

        <div className="cam-body">
          <div className="cam-textarea-label">Ghi chú khi trả phòng</div>
          <textarea
            className="cam-textarea"
            placeholder="Tình trạng phòng, ghi chú khi bàn giao lại..."
            value={returnNote}
            onChange={(e) => setReturnNote(e.target.value)}
          />
        </div>

        <div className="cam-footer">
          <button className="cam-btn ghost" onClick={onClose}>
            Quay lại
          </button>
          <button className="cam-btn success" onClick={handleSubmit}>
            Xác nhận gửi yêu cầu trả
          </button>
        </div>
      </div>
    </div>
  );
}
