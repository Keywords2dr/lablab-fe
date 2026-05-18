import React from "react";
import {
  AssignmentOutlined,
  MeetingRoomOutlined,
  ErrorOutlined,
} from "@mui/icons-material";

const PURPOSE_TYPE_OPTIONS = [
  { value: "TEACHING", label: "Giảng dạy" },
  { value: "RESEARCH", label: "Nghiên cứu" },
  { value: "EXAM", label: "Thi cử" },
  { value: "OTHER", label: "Khác" },
];

export default function StepBookingDetails({
  selectedRoom,
  form,
  setField,
  errors,
}) {
  const todayLocal = new Date().toISOString().slice(0, 16);
  const displayName =
    selectedRoom?.name || selectedRoom?.roomName || selectedRoom?.id || null;

  return (
    <div className="rr-card">
      <div className="rr-card-header">
        <div className="rr-card-header-icon">
          <AssignmentOutlined />
        </div>
        <div className="rr-card-header-text">
          <h3>Thông tin đăng ký</h3>
          <p>Điền đầy đủ thông tin bên dưới để hoàn tất yêu cầu.</p>
        </div>
      </div>

      <div className="rr-card-body">
        {displayName ? (
          <div className="rr-selected-room-chip">
            <MeetingRoomOutlined />
            Nơi đăng ký:&nbsp;<strong>{displayName}</strong>
            {selectedRoom?.location && ` — ${selectedRoom.location}`}
          </div>
        ) : (
          <div
            className="rr-selected-room-chip"
            style={{ color: "#ef4444", borderColor: "#fca5a5" }}
          >
            <MeetingRoomOutlined /> Chưa chọn phòng
          </div>
        )}

        <div className="rr-form-grid">
          <div className="rr-form-group">
            <label className="rr-form-label">
              Mục đích sử dụng <span className="required">*</span>
            </label>
            <select
              className={`rr-form-input${errors.purposeType ? " error" : ""}`}
              value={form.purposeType}
              onChange={(e) => setField("purposeType", e.target.value)}
            >
              <option value="">-- Chọn mục đích --</option>
              {PURPOSE_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {errors.purposeType && (
              <span className="rr-field-error">
                <ErrorOutlined style={{ fontSize: 14 }} />
                {errors.purposeType}
              </span>
            )}
          </div>

          <div className="rr-form-group">
            <label className="rr-form-label">
              Môn học <span className="required">*</span>
            </label>
            <input
              className={`rr-form-input${errors.subjectName ? " error" : ""}`}
              placeholder="Tên môn học…"
              value={form.subjectName}
              onChange={(e) => setField("subjectName", e.target.value)}
            />
            {errors.subjectName && (
              <span className="rr-field-error">
                <ErrorOutlined style={{ fontSize: 14 }} />
                {errors.subjectName}
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
              value={form.lessonDetail}
              onChange={(e) => setField("lessonDetail", e.target.value)}
            />
          </div>

          <div className="rr-form-group">
            <label className="rr-form-label">
              Ngày &amp; giờ bắt đầu <span className="required">*</span>
            </label>
            <input
              type="datetime-local"
              className={`rr-form-input${errors.borrowDate ? " error" : ""}`}
              min={todayLocal}
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
              Ngày &amp; giờ trả dự kiến <span className="required">*</span>
            </label>
            <input
              type="datetime-local"
              className={`rr-form-input${errors.expectedReturnDate ? " error" : ""}`}
              min={form.borrowDate || todayLocal}
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
