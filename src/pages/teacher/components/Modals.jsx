import React from "react";
import { CheckCircle, Cancel } from "@mui/icons-material";
import { TICKET_STATUS_MAP } from "../hooks/useRoomManagement"; // ✅ Sửa tên import
import "../styles/Modals.css";

export function DetailModal({
  detailItem,
  setDetailItem,
  handleApprove,
  setRejectTarget,
}) {
  if (!detailItem) return null;

  return (
    <div className="trm-overlay" onClick={() => setDetailItem(null)}>
      <div className="trm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="trm-modal-header">
          {/* ✅ Sửa field name: detailItem.id -> detailItem.ticketId */}
          <h2>Chi tiết phiếu #{detailItem.ticketId?.substring(0, 8)}...</h2>
          <button className="trm-close" onClick={() => setDetailItem(null)}>
            ×
          </button>
        </div>
        <div className="trm-modal-body">
          {[
            [
              "Loại phiếu",
              <span
                className={`trm-type-badge ${detailItem.ticketType === "ROOM_ONLY" ? "room" : "chemical"}`}
              >
                {detailItem.ticketType === "ROOM_ONLY" ? "PHÒNG" : "HÓA CHẤT"}
              </span>,
            ],
            [
              "Môn học / Mục đích",
              detailItem.subjectName || detailItem.purposeType || "N/A",
            ],
            ["Người mượn", detailItem.requesterName || "N/A"],
            [
              "Ngày mượn",
              detailItem.borrowDate
                ? new Date(detailItem.borrowDate).toLocaleString("vi-VN")
                : "N/A",
            ],
            [
              "Ngày trả dự kiến",
              detailItem.expectedReturnDate
                ? new Date(detailItem.expectedReturnDate).toLocaleString(
                    "vi-VN",
                  )
                : "N/A",
            ],
            [
              "Trạng thái",
              <span
                className={`trm-status-chip ${TICKET_STATUS_MAP[detailItem.status]?.cls}`}
              >
                {TICKET_STATUS_MAP[detailItem.status]?.label ||
                  detailItem.status}
              </span>,
            ],
          ].map(([label, val]) => (
            <div className="trm-detail-row" key={label}>
              <span className="trm-detail-label">{label}</span>
              <span>{val}</span>
            </div>
          ))}
          {detailItem.note && (
            <div className="trm-detail-note">
              <span className="trm-detail-label">Ghi chú</span>
              <p>{detailItem.note}</p>
            </div>
          )}
        </div>
        {/* ✅ Sửa điều kiện: "PENDING" -> "PENDING_OWNER" và dùng ticketId */}
        {detailItem.status === "PENDING_OWNER" && (
          <div className="trm-modal-footer">
            <button
              className="trm-btn primary"
              onClick={() => handleApprove(detailItem.ticketId)}
            >
              <CheckCircle sx={{ fontSize: 14 }} /> Phê duyệt
            </button>
            <button
              className="trm-btn danger"
              onClick={() => {
                setRejectTarget(detailItem);
                setDetailItem(null);
              }}
            >
              <Cancel sx={{ fontSize: 14 }} /> Từ chối
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function RejectModal({
  rejectTarget,
  setRejectTarget,
  rejectNote,
  setRejectNote,
  handleReject,
}) {
  if (!rejectTarget) return null;

  return (
    <div className="trm-overlay" onClick={() => setRejectTarget(null)}>
      <div
        className="trm-modal trm-modal-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="trm-modal-header">
          {/* ✅ Sửa field name: rejectTarget.id -> rejectTarget.ticketId */}
          <h2>Từ chối phiếu #{rejectTarget.ticketId?.substring(0, 8)}...</h2>
          <button className="trm-close" onClick={() => setRejectTarget(null)}>
            ×
          </button>
        </div>
        <div className="trm-modal-body">
          <p style={{ marginBottom: 10, opacity: 0.7, fontSize: 14 }}>
            Lý do từ chối (không bắt buộc):
          </p>
          <textarea
            className="trm-textarea"
            rows={3}
            placeholder="Nhập lý do..."
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
          />
        </div>
        <div className="trm-modal-footer">
          <button
            className="trm-btn ghost"
            onClick={() => setRejectTarget(null)}
          >
            Hủy
          </button>
          <button
            className="trm-btn danger"
            onClick={() => handleReject(rejectTarget.ticketId)} // ✅ Sửa .id -> .ticketId
          >
            <Cancel sx={{ fontSize: 14 }} /> Xác nhận từ chối
          </button>
        </div>
      </div>
    </div>
  );
}
