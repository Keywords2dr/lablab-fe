import React from "react";
import {
  MeetingRoom,
  Science,
  ScienceOutlined,
  CalendarToday,
  Schedule,
  CancelOutlined,
  AssignmentReturnOutlined,
  InfoOutlined,
  BookmarkBorderOutlined,
} from "@mui/icons-material";
import {
  TICKET_STATUS_MAP,
  TICKET_TYPE_MAP,
  getTimelineProgress,
  TIMELINE_STEPS,
} from "../hooks/useTickets";
import "../styles/ticketCard.css";

const MINI_STEPS = [
  "CREATED",
  "PENDING_OWNER",
  "PENDING_ADMIN",
  "APPROVED",
  "BORROWED",
  "PENDING_RETURN",
  "RETURNED",
];

function getRoomIconClass(type) {
  if (type === "ROOM_ONLY") return "room-type";
  if (type === "CHEMICAL_ONLY") return "chemical-type";
  return "both-type";
}

function getRoomIcon(type) {
  if (type === "ROOM_ONLY") return <MeetingRoom />;
  if (type === "CHEMICAL_ONLY") return <Science />;
  return <ScienceOutlined />;
}

export default function TicketCard({
  ticket,
  onOpenDetail,
  onCancelClick,
  onReturnClick,
}) {
  const statusInfo = TICKET_STATUS_MAP[ticket.status] || {};
  const typeInfo = TICKET_TYPE_MAP[ticket.ticketType] || {};
  const { currentIndex, isFailed } = getTimelineProgress(ticket.status);

  const canCancel = ["PENDING_OWNER", "PENDING_ADMIN"].includes(ticket.status);
  const canReturn = ticket.status === "BORROWED";

  // Cắt ngắn ID thành 6 ký tự đầu + "..."
  const shortId = ticket.ticketId
    ? ticket.ticketId.substring(0, 6).toUpperCase() + "..."
    : "";

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

  return (
    <div
      className={`tc-card status-${statusInfo.cls || "pending"}`}
      onClick={() => onOpenDetail(ticket)}
    >
      <div className="tc-body">
        {/* Top: ID + Type + Status */}
        <div className="tc-top">
          <div className="tc-top-left">
            <span className="tc-id" title={ticket.ticketId}>
              {shortId}
            </span>
            <span className={`tt-type-badge ${typeInfo.cls || ""}`}>
              {ticket.ticketType === "ROOM_ONLY" ? (
                <MeetingRoom sx={{ fontSize: 13 }} />
              ) : (
                <Science sx={{ fontSize: 13 }} />
              )}
              {typeInfo.short || ticket.ticketType}
            </span>
          </div>
          <span className={`tt-status-chip ${statusInfo.cls || ""}`}>
            {statusInfo.label || ticket.status}
          </span>
        </div>

        {/* Room info */}
        <div className="tc-room-row">
          <div
            className={`tc-room-icon ${getRoomIconClass(ticket.ticketType)}`}
          >
            {getRoomIcon(ticket.ticketType)}
          </div>
          <div className="tc-room-info">
            <div className="tc-room-name">{ticket.roomName}</div>
            <div className="tc-room-sub">
              <ScienceOutlined sx={{ fontSize: 14 }} />
              {ticket.subject} {ticket.classCode ? `— ${ticket.classCode}` : ""}
            </div>
            {ticket.purpose && (
              <div className="tc-room-sub" style={{ marginTop: "4px" }}>
                <BookmarkBorderOutlined sx={{ fontSize: 14 }} />
                {ticket.purpose}
              </div>
            )}
          </div>
        </div>

        {/* Dates - GIỮ NGUYÊN CẤU TRÚC CŨ */}
        <div className="tc-dates">
          <div className="tc-date-item">
            <div className="tc-date-label">Ngày mượn</div>
            <div className="tc-date-value">
              <CalendarToday />
              {formatDate(ticket.borrowDate)}
            </div>
          </div>
          <div className="tc-date-item">
            <div className="tc-date-label">Dự kiến trả</div>
            <div className="tc-date-value">
              <Schedule />
              {formatDate(ticket.expectedReturnDate)}
            </div>
          </div>
        </div>

        {/* Mini Timeline - GIỮ NGUYÊN CẤU TRÚC CŨ */}
        <div className="tc-mini-timeline">
          {MINI_STEPS.map((step, i) => {
            let dotClass = "";
            if (isFailed && i <= 1) dotClass = "done";
            else if (isFailed && i === currentIndex) dotClass = "failed";
            else if (i < currentIndex) dotClass = "done";
            else if (i === currentIndex) dotClass = "current";

            return (
              <React.Fragment key={step}>
                {i > 0 && (
                  <div
                    className={`tc-mini-connector ${
                      i <= currentIndex && !isFailed
                        ? i < currentIndex
                          ? "done"
                          : "current"
                        : ""
                    }`}
                  />
                )}
                <div
                  className={`tc-mini-dot ${dotClass}`}
                  title={TIMELINE_STEPS[i]?.label || step}
                />
              </React.Fragment>
            );
          })}
        </div>

        {/* Actions - GIỮ NGUYÊN CẤU TRÚC CŨ */}
        {(canCancel || canReturn) && (
          <div className="tc-actions">
            {canCancel && (
              <button
                className="tc-action-btn cancel"
                onClick={(e) => {
                  e.stopPropagation();
                  onCancelClick(ticket);
                }}
              >
                <CancelOutlined /> Hủy phiếu
              </button>
            )}
            {canReturn && (
              <button
                className="tc-action-btn return"
                onClick={(e) => {
                  e.stopPropagation();
                  onReturnClick(ticket);
                }}
              >
                <AssignmentReturnOutlined /> Yêu cầu trả
              </button>
            )}
            <button
              className="tc-action-btn detail"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail(ticket);
              }}
            >
              <InfoOutlined /> Chi tiết
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
