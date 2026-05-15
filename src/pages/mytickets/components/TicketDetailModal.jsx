import React from "react";
import {
  Close,
  ReceiptLong,
  Science,
  MeetingRoom,
  ReportProblemOutlined,
} from "@mui/icons-material";
import { TICKET_STATUS_MAP, TICKET_TYPE_MAP } from "../hooks/useTickets";
import TicketStatusTimeline from "./TicketStatusTimeline";
import "../styles/ticketDetailModal.css";

export default function TicketDetailModal({ ticket, onClose }) {
  if (!ticket) return null;

  const statusInfo = TICKET_STATUS_MAP[ticket.status] || {};
  const typeInfo = TICKET_TYPE_MAP[ticket.ticketType] || {};

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isChemical = ticket.ticketType === "CHEMICAL_ONLY";
  const isRoom = ticket.ticketType === "ROOM_ONLY";

  return (
    <div className="tdm-overlay" onClick={onClose}>
      <div className="tdm-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="tdm-header">
          <div className="tdm-header-left">
            <div className="tdm-header-icon">
              {isChemical ? <Science /> : <MeetingRoom />}
            </div>
            <div>
              <div className="tdm-header-title">Chi tiết phiếu mượn</div>
              <div className="tdm-header-id">{ticket.ticketId}</div>
            </div>
          </div>
          <button className="tdm-close" onClick={onClose}>
            <Close sx={{ fontSize: 18 }} />
          </button>
        </div>

        {/* Body */}
        <div className="tdm-body">
          {/* Status + Type */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "20px",
              flexWrap: "wrap",
            }}
          >
            <span className={`tt-status-chip ${statusInfo.cls || ""}`}>
              {statusInfo.label}
            </span>
            <span className={`tt-type-badge ${typeInfo.cls || ""}`}>
              {typeInfo.label}
            </span>
          </div>

          {/* Reject reason */}
          {ticket.rejectReason && (
            <div className="tdm-reject-box">
              <ReportProblemOutlined />
              <div>
                <div className="tdm-reject-label">Lý do từ chối</div>
                <div className="tdm-reject-text">{ticket.rejectReason}</div>
              </div>
            </div>
          )}

          {/* Cancel reason */}
          {ticket.cancelReason && (
            <div
              className="tdm-reject-box"
              style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}
            >
              <ReportProblemOutlined style={{ color: "#64748b" }} />
              <div>
                <div className="tdm-reject-label" style={{ color: "#64748b" }}>
                  Lý do hủy
                </div>
                <div className="tdm-reject-text" style={{ color: "#475569" }}>
                  {ticket.cancelReason}
                </div>
              </div>
            </div>
          )}

          {/* ── THÔNG TIN CHUNG ── */}
          <div className="tdm-info-grid">
            {/* Phòng — hiện cho cả 2 loại */}
            <div className="tdm-info-item">
              <div className="tdm-info-label">Phòng</div>
              <div className="tdm-info-value">{ticket.roomName || "—"}</div>
            </div>

            {/* Quản lý phòng — chỉ hiện cho ROOM_ONLY vì hóa chất không cần */}
            {isRoom && (
              <div className="tdm-info-item">
                <div className="tdm-info-label">Quản lý phòng</div>
                <div className="tdm-info-value">
                  {ticket.ownerName || "Chưa xác nhận"}
                </div>
              </div>
            )}

            <div className="tdm-info-item">
              <div className="tdm-info-label">Ngày mượn</div>
              <div className="tdm-info-value">
                {formatDate(ticket.borrowDate)}
              </div>
            </div>
            <div className="tdm-info-item">
              <div className="tdm-info-label">Dự kiến trả</div>
              <div className="tdm-info-value">
                {formatDate(ticket.expectedReturnDate)}
              </div>
            </div>
            <div className="tdm-info-item">
              <div className="tdm-info-label">Môn học</div>
              <div className="tdm-info-value">{ticket.subject || "—"}</div>
            </div>
            <div className="tdm-info-item">
              <div className="tdm-info-label">Mã lớp</div>
              <div className="tdm-info-value">{ticket.classCode || "—"}</div>
            </div>
            <div className="tdm-info-item span-2">
              <div className="tdm-info-label">Mục đích</div>
              <div className="tdm-info-value">{ticket.purpose || "—"}</div>
            </div>
            <div className="tdm-info-item span-2">
              <div className="tdm-info-label">Nội dung bài</div>
              <div className="tdm-info-value">
                {ticket.lessonContent || "—"}
              </div>
            </div>
          </div>

          {/* ── PHÒNG: thông tin bổ sung cho ROOM_ONLY ── */}
          {isRoom && (
            <div>
              <div className="tdm-section-title">
                <MeetingRoom /> Thông tin phòng mượn
              </div>
              <div className="tdm-info-grid">
                {ticket.roomDescription && (
                  <div className="tdm-info-item span-2">
                    <div className="tdm-info-label">Mô tả phòng</div>
                    <div className="tdm-info-value">
                      {ticket.roomDescription}
                    </div>
                  </div>
                )}
                {ticket.capacity && (
                  <div className="tdm-info-item">
                    <div className="tdm-info-label">Sức chứa</div>
                    <div className="tdm-info-value">
                      {ticket.capacity} người
                    </div>
                  </div>
                )}
                {ticket.location && (
                  <div className="tdm-info-item">
                    <div className="tdm-info-label">Vị trí</div>
                    <div className="tdm-info-value">{ticket.location}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── HÓA CHẤT: danh sách cho CHEMICAL_ONLY ── */}
          {isChemical && (
            <div>
              <div className="tdm-section-title">
                <Science /> Danh sách hóa chất mượn
              </div>
              {ticket.chemicals && ticket.chemicals.length > 0 ? (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "14px",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background: "#f0fdf4",
                        borderBottom: "2px solid #bbf7d0",
                      }}
                    >
                      <th
                        style={{
                          padding: "8px 12px",
                          textAlign: "left",
                          color: "#15803d",
                          fontWeight: 600,
                        }}
                      >
                        Tên hóa chất
                      </th>
                      <th
                        style={{
                          padding: "8px 12px",
                          textAlign: "center",
                          color: "#15803d",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        Số lượng mượn
                      </th>
                      <th
                        style={{
                          padding: "8px 12px",
                          textAlign: "center",
                          color: "#15803d",
                          fontWeight: 600,
                        }}
                      >
                        Đơn vị
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ticket.chemicals.map((chem, i) => (
                      <tr
                        key={i}
                        style={{
                          borderBottom: "1px solid #e2e8f0",
                          background: i % 2 === 0 ? "#ffffff" : "#f8fafc",
                        }}
                      >
                        <td
                          style={{
                            padding: "9px 12px",
                            color: "#1e293b",
                            fontWeight: 500,
                          }}
                        >
                          {chem.name}
                        </td>
                        <td
                          style={{
                            padding: "9px 12px",
                            textAlign: "center",
                            color: "#0f766e",
                            fontWeight: 700,
                          }}
                        >
                          {chem.quantity}
                        </td>
                        <td
                          style={{
                            padding: "9px 12px",
                            textAlign: "center",
                            color: "#64748b",
                          }}
                        >
                          {chem.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div
                  style={{
                    color: "#94a3b8",
                    fontSize: "13px",
                    padding: "8px 0",
                  }}
                >
                  Chưa có thông tin hóa chất.
                </div>
              )}
            </div>
          )}

          {/* Timeline */}
          <div className="tdm-section-title">
            <ReceiptLong /> Tiến trình phiếu
          </div>
          <TicketStatusTimeline ticket={ticket} />
        </div>

        {/* Footer */}
        <div className="tdm-footer">
          <button className="tdm-btn ghost" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
