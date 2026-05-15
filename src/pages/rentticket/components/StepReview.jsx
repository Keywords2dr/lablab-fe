import React from "react";
import {
  FactCheckOutlined, MeetingRoomOutlined, EventOutlined,
  SchoolOutlined, BadgeOutlined, CheckCircleOutlined,
} from "@mui/icons-material";

export default function StepReview({ selectedRoom, form }) {
  const fmt = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleString("vi-VN", {
      hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric",
    });
  };

  const getTicketTypeLabel = () => {
    return form.ticketType === "CHEMICAL_ONLY" ? "Mượn hóa chất/vật tư" : "Mượn phòng Lab";
  };

  return (
    <div className="rr-card">
      <div className="rr-card-header">
        <div className="rr-card-header-icon"><FactCheckOutlined /></div>
        <div className="rr-card-header-text">
          <h3>Xác nhận thông tin</h3>
          <p>Kiểm tra lại trước khi gửi yêu cầu ({getTicketTypeLabel()}).</p>
        </div>
      </div>

      <div className="rr-card-body">
        <div className="rr-summary-grid">
          <div className="rr-summary-item span-2">
            <div className="rr-summary-label">
              <MeetingRoomOutlined style={{ fontSize: 13, verticalAlign: "middle", marginRight: 4 }} />
              Nơi thực hiện
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
              <div className="rr-summary-value">{selectedRoom?.name || selectedRoom?.roomName}</div>
              <span className="rr-summary-badge"><CheckCircleOutlined style={{ fontSize: 14 }} /> Hợp lệ</span>
            </div>
          </div>

          <div className="rr-summary-item">
            <div className="rr-summary-label"><EventOutlined style={{ fontSize: 13, marginRight: 4 }} /> Bắt đầu</div>
            <div className="rr-summary-value">{fmt(form.borrowDate)}</div>
          </div>

          <div className="rr-summary-item">
            <div className="rr-summary-label"><EventOutlined style={{ fontSize: 13, marginRight: 4 }} /> Kết thúc dự kiến</div>
            <div className="rr-summary-value">{fmt(form.expectedReturnDate)}</div>
          </div>

          <div className="rr-summary-item">
            <div className="rr-summary-label"><SchoolOutlined style={{ fontSize: 13, marginRight: 4 }} /> Môn học</div>
            <div className="rr-summary-value">{form.subjectName || "—"}</div>
          </div>

          <div className="rr-summary-item">
            <div className="rr-summary-label"><BadgeOutlined style={{ fontSize: 13, marginRight: 4 }} /> Mã lớp</div>
            <div className="rr-summary-value">{form.classCode || "—"}</div>
          </div>

          {form.lessonDetail && (
            <div className="rr-summary-item span-2">
              <div className="rr-summary-label">Nội dung bài học</div>
              <div className="rr-summary-value">{form.lessonDetail}</div>
            </div>
          )}

          <div className="rr-summary-item span-2">
            <div className="rr-summary-label">Mục đích ({form.ticketType})</div>
            <div className="rr-summary-value" style={{ whiteSpace: "pre-wrap" }}>{form.purposeType}</div>
          </div>

          {form.note && (
            <div className="rr-summary-item span-2">
              <div className="rr-summary-label">Ghi chú</div>
              <div className="rr-summary-value" style={{ whiteSpace: "pre-wrap" }}>{form.note}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}