import React from "react";
import { Tag } from "antd";
import { UserOutlined, CalendarOutlined } from "@ant-design/icons";
import { ROLE_LABEL, PURPOSE_MAP } from "../constants/ticketConstants";
import { fmtDateTime, dash } from "../utils/ticketHelpers";

function Row({ label, highlight, highlightColor = "purple", children }) {
  const cls = highlight
    ? highlightColor === "blue" ? "atd-row atd-row--highlight-blue"
    : highlightColor === "green" ? "atd-row atd-row--highlight-green"
    : "atd-row atd-row--highlight"
    : "atd-row";
  return (
    <div className={cls}>
      <span className="atd-row-label">{label}</span>
      <span className="atd-row-value">{children}</span>
    </div>
  );
}

export default function TicketInfoCards({ ticket, typeCfg }) {
  return (
    <div className="atd-body">
      {/* Cột trái: Thông tin chung */}
      <div className="atd-card">
        <div className="atd-card-header">
          <div className="atd-card-icon atd-card-icon--purple"><UserOutlined /></div>
          <span className="atd-card-title">Thông tin chung</span>
        </div>
        <div className="atd-rows">
          <Row label="Người mượn" highlight highlightColor="purple">
            <span className="atd-row-value--bold">{dash(ticket.requesterName)}</span>
            {ticket.requesterRole && (
              <Tag style={{ marginLeft: 8, borderRadius: 100, fontSize: "0.7rem", verticalAlign: "middle" }}>
                {ROLE_LABEL[ticket.requesterRole] || ticket.requesterRole}
              </Tag>
            )}
          </Row>
          <Row label="GV Quản lý">
            <span className="atd-row-value--bold">{dash(ticket.ownerApprovedByName)}</span>
          </Row>
          <Row label="Phòng Lab" highlight highlightColor="blue">
            {ticket.roomName
              ? <Tag color="blue" style={{ borderRadius: 100 }}>{ticket.roomName}</Tag>
              : <span style={{ color: "#94a3b8" }}>—</span>}
          </Row>
          <Row label="Loại phiếu">
            <Tag className="atd-tag" color={typeCfg.antColor}>{typeCfg.label}</Tag>
          </Row>
          <Row label="Môn học">{dash(ticket.subjectName)}</Row>
          <Row label="Mã lớp">
            {ticket.classCode
              ? <span className="atd-row-value--mono">{ticket.classCode}</span>
              : "—"}
          </Row>
          <Row label="Chi tiết bài">{dash(ticket.lessonDetail?.trim())}</Row>
          <Row label="Mục đích">{PURPOSE_MAP[ticket.purposeType] || ticket.purposeType || "—"}</Row>
          {ticket.note && (
            <Row label="Ghi chú">
              <span className="atd-row-value--note">{ticket.note}</span>
            </Row>
          )}
        </div>
      </div>

      {/* Cột phải: Thời gian */}
      <div className="atd-card">
        <div className="atd-card-header">
          <div className="atd-card-icon atd-card-icon--blue"><CalendarOutlined /></div>
          <span className="atd-card-title">Thời gian</span>
        </div>
        <div className="atd-rows">
          <Row label="Ngày tạo">{fmtDateTime(ticket.createdAt)}</Row>
          <Row label="Ngày mượn" highlight highlightColor="blue">{fmtDateTime(ticket.borrowDate)}</Row>
          <Row label="Hạn trả" highlight highlightColor="green">{fmtDateTime(ticket.expectedReturnDate)}</Row>
          {ticket.ownerApprovedAt && <Row label="GV Duyệt lúc">{fmtDateTime(ticket.ownerApprovedAt)}</Row>}
        </div>
      </div>
    </div>
  );
}
