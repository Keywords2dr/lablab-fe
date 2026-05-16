import React from "react";
import {
  Close,
  ReceiptLong,
  Science,
  MeetingRoom,
  ReportProblemOutlined,
  AssignmentReturn,
} from "@mui/icons-material";
import { TICKET_STATUS_MAP, TICKET_TYPE_MAP } from "../hooks/useTickets";
import TicketStatusTimeline from "./TicketStatusTimeline";
import "../styles/ticketDetailModal.css";

// Map trạng thái trả từng item hóa chất
const RETURN_STATUS_MAP = {
  RETURNED: { label: "Đã trả đủ", color: "#059669" },
  PARTIAL: { label: "Trả thiếu", color: "#f59e0b" },
  DAMAGED: { label: "Hư hỏng", color: "#ef4444" },
  LOST: { label: "Mất mát", color: "#dc2626" },
};

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

  // Hiển thị thông tin trả khi status là PENDING_RETURN hoặc RETURNED
  const showReturnInfo = ["PENDING_RETURN", "RETURNED"].includes(ticket.status);

  // items từ buildFullDetail (useTickets) — dùng cho bảng hoàn trả
  // buildFullDetail map items thành chemicals, nhưng items gốc (có returnStatus) nằm ở ticket.items
  const returnItems = ticket.items || [];

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
            {/*
              FIX 1: Label "Phòng" giữ nguyên nhưng thêm context:
              - ROOM_ONLY → "Phòng sử dụng"
              - CHEMICAL_ONLY → "Lấy từ kho phòng" (mượn hóa chất từ kho phòng này,
                dùng ở nơi khác là chuyện bình thường)
            */}
            <div className="tdm-info-item">
              <div className="tdm-info-label">
                {isRoom ? "Phòng sử dụng" : "Lấy từ kho phòng"}
              </div>
              <div className="tdm-info-value">{ticket.roomName || "—"}</div>
            </div>

            {/* Quản lý phòng — chỉ hiện cho ROOM_ONLY */}
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

          {/* ── HÓA CHẤT: danh sách mượn ban đầu ── */}
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

          {/*
            FIX 2: Bảng thông tin hoàn trả — hiện khi PENDING_RETURN hoặc RETURNED.
            Lấy từ ticket.items (raw từ API) để có returnStatus, quantityReturned, returnNote.
            Áp dụng cho cả CHEMICAL_ONLY (từng item) lẫn ROOM_ONLY (returnNote chung).
          */}
          {showReturnInfo && isChemical && returnItems.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <div className="tdm-section-title">
                <AssignmentReturn /> Thông tin hoàn trả từ người mượn
              </div>
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
                      background: "#fff7ed",
                      borderBottom: "2px solid #fed7aa",
                    }}
                  >
                    <th
                      style={{
                        padding: "8px 12px",
                        textAlign: "left",
                        color: "#c2410c",
                        fontWeight: 600,
                      }}
                    >
                      Tên vật tư
                    </th>
                    <th
                      style={{
                        padding: "8px 12px",
                        textAlign: "right",
                        color: "#c2410c",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Đã mượn
                    </th>
                    <th
                      style={{
                        padding: "8px 12px",
                        textAlign: "right",
                        color: "#c2410c",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Thực trả
                    </th>
                    <th
                      style={{
                        padding: "8px 12px",
                        textAlign: "center",
                        color: "#c2410c",
                        fontWeight: 600,
                      }}
                    >
                      Trạng thái
                    </th>
                    <th
                      style={{
                        padding: "8px 12px",
                        textAlign: "left",
                        color: "#c2410c",
                        fontWeight: 600,
                      }}
                    >
                      Ghi chú trả
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {returnItems.map((item, i) => {
                    const rs = RETURN_STATUS_MAP[item.returnStatus] || null;
                    return (
                      <tr
                        key={i}
                        style={{
                          borderBottom: "1px solid #e2e8f0",
                          background: i % 2 === 0 ? "#ffffff" : "#fff7ed",
                        }}
                      >
                        <td
                          style={{
                            padding: "9px 12px",
                            color: "#1e293b",
                            fontWeight: 500,
                          }}
                        >
                          {item.itemName}
                          {item.itemCode && (
                            <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                              Mã: {item.itemCode}
                            </div>
                          )}
                        </td>
                        <td
                          style={{
                            padding: "9px 12px",
                            textAlign: "right",
                            color: "#64748b",
                          }}
                        >
                          {item.quantityBorrowed ?? "—"} {item.itemUnit || ""}
                        </td>
                        <td
                          style={{
                            padding: "9px 12px",
                            textAlign: "right",
                            fontWeight: 700,
                            color:
                              item.quantityReturned != null &&
                              item.quantityReturned >= item.quantityBorrowed
                                ? "#059669"
                                : "#f59e0b",
                          }}
                        >
                          {item.quantityReturned ?? "—"} {item.itemUnit || ""}
                        </td>
                        <td
                          style={{ padding: "9px 12px", textAlign: "center" }}
                        >
                          {rs ? (
                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: 600,
                                color: rs.color,
                                background: rs.color + "18",
                                padding: "2px 8px",
                                borderRadius: "999px",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {rs.label}
                            </span>
                          ) : (
                            <span
                              style={{ color: "#94a3b8", fontSize: "12px" }}
                            >
                              —
                            </span>
                          )}
                        </td>
                        <td
                          style={{
                            padding: "9px 12px",
                            color: "#475569",
                            fontSize: "13px",
                          }}
                        >
                          {item.returnNote || (
                            <span style={{ color: "#cbd5e1" }}>Không có</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Ghi chú trả phòng (ROOM_ONLY) */}
          {showReturnInfo && isRoom && ticket.returnNote && (
            <div style={{ marginTop: "16px" }}>
              <div className="tdm-section-title">
                <AssignmentReturn /> Thông tin hoàn trả từ người mượn
              </div>
              <div
                className="tdm-info-item span-2"
                style={{
                  background: "#fff7ed",
                  border: "1px solid #fed7aa",
                  borderRadius: "10px",
                  padding: "12px 16px",
                }}
              >
                <div className="tdm-info-label" style={{ color: "#c2410c" }}>
                  Ghi chú khi trả phòng
                </div>
                <div className="tdm-info-value">{ticket.returnNote}</div>
              </div>
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
