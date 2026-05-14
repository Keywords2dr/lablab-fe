import React from "react";
import {
  AssignmentOutlined,
  MeetingRoomOutlined,
  ErrorOutlined,
} from "@mui/icons-material";

export default function StepBookingDetails({ selectedRoom, form, setField, errors }) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="rr-card">
      <div className="rr-card-header">
        <div className="rr-card-header-icon">
          <AssignmentOutlined />
        </div>
        <div className="rr-card-header-text">
          <h3>Thông tin đặt phòng</h3>
          <p>Điền đầy đủ thông tin bên dưới để hoàn tất yêu cầu mượn phòng.</p>
        </div>
      </div>

      <div className="rr-card-body">
        {selectedRoom && (
          <div className="rr-selected-room-chip">
            <MeetingRoomOutlined />
            Phòng đã chọn: <strong>{selectedRoom.name}</strong>
            {selectedRoom.location && ` — ${selectedRoom.location}`}
          </div>
        )}

        <div className="rr-form-grid">
          <div className="rr-form-group span-2">
            <label className="rr-form-label">
              Mục đích mượn phòng <span className="required">*</span>
            </label>
            <textarea
              className={`rr-form-textarea${errors.purpose ? " error" : ""}`}
              placeholder="Mô tả mục đích sử dụng phòng thí nghiệm…"
              value={form.purpose}
              onChange={(e) => setField("purpose", e.target.value)}
              rows={3}
            />
            {errors.purpose && (
              <span className="rr-field-error">
                <ErrorOutlined style={{ fontSize: 14 }} />
                {errors.purpose}
              </span>
            )}
          </div>

          <div className="rr-form-group">
            <label className="rr-form-label">
              Môn học <span className="required">*</span>
            </label>
            <input
              className={`rr-form-input${errors.subject ? " error" : ""}`}
              placeholder="Tên môn học…"
              value={form.subject}
              onChange={(e) => setField("subject", e.target.value)}
            />
            {errors.subject && (
              <span className="rr-field-error">
                <ErrorOutlined style={{ fontSize: 14 }} />
                {errors.subject}
              </span>
            )}
          </div>

          <div className="rr-form-group">
            <label className="rr-form-label">
              Mã lớp <span className="required">*</span>
            </label>
            <input
              className={`rr-form-input${errors.classCode ? " error" : ""}`}
              placeholder="Ví dụ: CHEM101-01"
              value={form.classCode}
              onChange={(e) => setField("classCode", e.target.value)}
            />
            {errors.classCode && (
              <span className="rr-field-error">
                <ErrorOutlined style={{ fontSize: 14 }} />
                {errors.classCode}
              </span>
            )}
          </div>

          <div className="rr-form-group span-2">
            <label className="rr-form-label">Nội dung bài học</label>
            <input
              className="rr-form-input"
              placeholder="Tên bài / tiết học (nếu có)…"
              value={form.lessonDetails}
              onChange={(e) => setField("lessonDetails", e.target.value)}
            />
          </div>

          <div className="rr-form-group">
            <label className="rr-form-label">
              Ngày mượn <span className="required">*</span>
            </label>
            <input
              type="date"
              className={`rr-form-input${errors.borrowDate ? " error" : ""}`}
              min={today}
              value={form.borrowDate}
              onChange={(e) => setField("borrowDate", e.target.value)}
            />
            {errors.borrowDate && (
              <span className="rr-field-error">
                <ErrorOutlined style={{ fontSize: 14 }} />
                {errors.borrowDate}
              </span>
            )}
          </div>

          <div className="rr-form-group">
            <label className="rr-form-label">
              Ngày trả dự kiến <span className="required">*</span>
            </label>
            <input
              type="date"
              className={`rr-form-input${errors.expectedReturnDate ? " error" : ""}`}
              min={form.borrowDate || today}
              value={form.expectedReturnDate}
              onChange={(e) => setField("expectedReturnDate", e.target.value)}
            />
            {errors.expectedReturnDate && (
              <span className="rr-field-error">
                <ErrorOutlined style={{ fontSize: 14 }} />
                {errors.expectedReturnDate}
              </span>
            )}
          </div>

          <div className="rr-form-group span-2">
            <label className="rr-form-label">Ghi chú thêm</label>
            <textarea
              className="rr-form-textarea"
              placeholder="Yêu cầu đặc biệt hoặc ghi chú khác…"
              value={form.note}
              onChange={(e) => setField("note", e.target.value)}
              rows={2}
            />
          </div>
        </div>
      </div>
    </div>
  );
}