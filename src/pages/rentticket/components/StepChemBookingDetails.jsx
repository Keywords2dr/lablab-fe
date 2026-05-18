import React from "react";
import {
  AssignmentOutlined,
  MeetingRoomOutlined,
  ScienceOutlined,
  ErrorOutlined,
} from "@mui/icons-material";

const PURPOSE_TYPE_OPTIONS = [
  { value: "TEACHING", label: "Giảng dạy" },
  { value: "RESEARCH", label: "Nghiên cứu" },
  { value: "EXAM", label: "Thi cử" },
  { value: "OTHER", label: "Khác" },
];

export default function StepChemBookingDetails({
  selectedRoom,
  selectedChemicals,
  form,
  setField,
  errors,
}) {
  const todayLocal = new Date().toISOString().slice(0, 16);
  const displayName =
    selectedRoom?.name || selectedRoom?.roomName || selectedRoom?.id || null;
  const chemCount = Object.keys(selectedChemicals || {}).length;

  return (
    <div className="rr-card">
      <div className="rr-card-header">
        <div className="rr-card-header-icon">
          <AssignmentOutlined />
        </div>
        <div className="rr-card-header-text">
          <h3>Thông tin đăng ký</h3>
          <p>Điền đầy đủ thông tin để hoàn tất yêu cầu mượn hóa chất.</p>
        </div>
      </div>

      <div className="rr-card-body">
        <div
          className="rr-selected-room-chip"
          style={{ gap: 16, flexWrap: "wrap" }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <MeetingRoomOutlined />
            Phòng:&nbsp;<strong>{displayName || "Chưa chọn"}</strong>
            {selectedRoom?.location && ` — ${selectedRoom.location}`}
          </span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: chemCount > 0 ? "#0f766e" : "#ef4444",
              borderLeft: "1px solid #e2e8f0",
              paddingLeft: 16,
            }}
          >
            <ScienceOutlined style={{ fontSize: 18 }} />
            {chemCount > 0 ? (
              <>
                <strong>{chemCount}</strong> loại hóa chất đã chọn
              </>
            ) : (
              "Chưa chọn hóa chất"
            )}
          </span>
        </div>

        <div className="rr-form-grid">
          {/* Mục đích */}
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

          {/* Môn học */}
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

          {/* Mã lớp */}
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

          {/* Nội dung thí nghiệm — thay cho "Nội dung bài học" */}
          <div className="rr-form-group span-2">
            <label className="rr-form-label">Nội dung thí nghiệm</label>
            <input
              className="rr-form-input"
              placeholder="Tên bài thí nghiệm hoặc nội dung sử dụng (nếu có)…"
              value={form.lessonDetail}
              onChange={(e) => setField("lessonDetail", e.target.value)}
            />
          </div>

          {/* Ngày giờ mượn */}
          <div className="rr-form-group">
            <label className="rr-form-label">
              Ngày &amp; giờ mượn <span className="required">*</span>
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

          {/* Ngày giờ trả */}
          <div className="rr-form-group">
            <label className="rr-form-label">
              Ngày &amp; giờ trả dự kiến <span className="required">*</span>
            </label>
            <input
              type="datetime-local"
              className={`rr-form-input${
                errors.expectedReturnDate ? " error" : ""
              }`}
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

          {/* Ghi chú */}
          <div className="rr-form-group span-2">
            <label className="rr-form-label">Ghi chú thêm</label>
            <textarea
              className="rr-form-textarea"
              placeholder="Yêu cầu đặc biệt về bảo quản, dụng cụ đi kèm hoặc ghi chú khác…"
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
