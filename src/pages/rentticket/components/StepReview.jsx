import React from "react";
import {
  FactCheckOutlined,
  MeetingRoomOutlined,
  EventOutlined,
  SchoolOutlined,
  BadgeOutlined,
  CheckCircleOutlined,
} from "@mui/icons-material";

export default function StepReview({ selectedRoom, form }) {
  const fmt = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="rr-card">
      <div className="rr-card-header">
        <div className="rr-card-header-icon">
          <FactCheckOutlined />
        </div>
        <div className="rr-card-header-text">
          <h3>Xác nhận thông tin</h3>
          <p>Kiểm tra lại trước khi gửi yêu cầu mượn phòng.</p>
        </div>
      </div>

      <div className="rr-card-body">
        <div className="rr-summary-grid">
          {/* Room */}
          <div className="rr-summary-item span-2">
            <div className="rr-summary-label">
              <MeetingRoomOutlined style={{ fontSize: 13, verticalAlign: "middle", marginRight: 4 }} />
              Phòng Lab
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
              <div className="rr-summary-value">{selectedRoom?.name}</div>
              <span className="rr-summary-badge">
                <CheckCircleOutlined style={{ fontSize: 14 }} />
                Hoạt động
              </span>
            </div>
            {selectedRoom?.location && (
              <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 4 }}>
                📍 {selectedRoom.location}
              </div>
            )}
          </div>

          {/* Borrow date */}
          <div className="rr-summary-item">
            <div className="rr-summary-label">
              <EventOutlined style={{ fontSize: 13, verticalAlign: "middle", marginRight: 4 }} />
              Ngày mượn
            </div>
            <div className="rr-summary-value">{fmt(form.borrowDate)}</div>
          </div>

          {/* Return date */}
          <div className="rr-summary-item">
            <div className="rr-summary-label">
              <EventOutlined style={{ fontSize: 13, verticalAlign: "middle", marginRight: 4 }} />
              Ngày trả dự kiến
            </div>
            <div className="rr-summary-value">{fmt(form.expectedReturnDate)}</div>
          </div>

          {/* Subject */}
          <div className="rr-summary-item">
            <div className="rr-summary-label">
              <SchoolOutlined style={{ fontSize: 13, verticalAlign: "middle", marginRight: 4 }} />
              Môn học
            </div>
            <div className="rr-summary-value">{form.subject || "—"}</div>
          </div>

          {/* Class code */}
          <div className="rr-summary-item">
            <div className="rr-summary-label">
              <BadgeOutlined style={{ fontSize: 13, verticalAlign: "middle", marginRight: 4 }} />
              Mã lớp
            </div>
            <div className="rr-summary-value">{form.classCode || "—"}</div>
          </div>

          {/* Lesson details */}
          {form.lessonDetails && (
            <div className="rr-summary-item span-2">
              <div className="rr-summary-label">Nội dung bài học</div>
              <div className="rr-summary-value">{form.lessonDetails}</div>
            </div>
          )}

          {/* Purpose */}
          <div className="rr-summary-item span-2">
            <div className="rr-summary-label">Mục đích</div>
            <div className="rr-summary-value" style={{ whiteSpace: "pre-wrap" }}>
              {form.purpose}
            </div>
          </div>

          {/* Note */}
          {form.note && (
            <div className="rr-summary-item span-2">
              <div className="rr-summary-label">Ghi chú</div>
              <div className="rr-summary-value" style={{ whiteSpace: "pre-wrap" }}>
                {form.note}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
