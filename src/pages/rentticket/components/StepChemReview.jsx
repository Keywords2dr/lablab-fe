import React from "react";
import {
  FactCheckOutlined,
  MeetingRoomOutlined,
  EventOutlined,
  SchoolOutlined,
  BadgeOutlined,
  CheckCircleOutlined,
  ScienceOutlined,
} from "@mui/icons-material";

export default function StepReview({
  selectedRoom,
  selectedChemicals = {},
  form,
}) {
  const fmt = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Tự động nhận diện: Nếu có chọn hóa chất thì chắc chắn là phiếu mượn hóa chất
  const chemicals = Object.values(selectedChemicals || {});
  const isChemTicket =
    chemicals.length > 0 || form.ticketType === "CHEMICAL_ONLY";

  const getTicketTypeLabel = () => {
    return isChemTicket ? "Mượn hóa chất/vật tư" : "Mượn phòng Lab";
  };

  return (
    <div className="rr-card">
      <div className="rr-card-header">
        <div className="rr-card-header-icon">
          <FactCheckOutlined />
        </div>
        <div className="rr-card-header-text">
          <h3>Xác nhận thông tin</h3>
          <p>Kiểm tra lại trước khi gửi yêu cầu ({getTicketTypeLabel()}).</p>
        </div>
      </div>

      <div className="rr-card-body">
        <div className="rr-summary-grid">
          <div className="rr-summary-item span-2">
            <div className="rr-summary-label">
              <MeetingRoomOutlined
                style={{
                  fontSize: 13,
                  verticalAlign: "middle",
                  marginRight: 4,
                }}
              />
              Nơi thực hiện
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginTop: 4,
              }}
            >
              <div className="rr-summary-value">
                {selectedRoom?.name || selectedRoom?.roomName}
              </div>
              <span className="rr-summary-badge">
                <CheckCircleOutlined style={{ fontSize: 14 }} /> Hợp lệ
              </span>
            </div>
            {selectedRoom?.managerName && (
              <div
                style={{ marginTop: 4, fontSize: "0.82rem", color: "#64748b" }}
              >
                Giảng viên phụ trách:{" "}
                <strong style={{ color: "#0f172a" }}>
                  {selectedRoom.managerName}
                </strong>
              </div>
            )}
          </div>

          <div className="rr-summary-item">
            <div className="rr-summary-label">
              <EventOutlined style={{ fontSize: 13, marginRight: 4 }} /> Bắt đầu
            </div>
            <div className="rr-summary-value">{fmt(form.borrowDate)}</div>
          </div>

          <div className="rr-summary-item">
            <div className="rr-summary-label">
              <EventOutlined style={{ fontSize: 13, marginRight: 4 }} /> Kết
              thúc dự kiến
            </div>
            <div className="rr-summary-value">
              {fmt(form.expectedReturnDate)}
            </div>
          </div>

          <div className="rr-summary-item">
            <div className="rr-summary-label">
              <SchoolOutlined style={{ fontSize: 13, marginRight: 4 }} /> Môn
              học
            </div>
            <div className="rr-summary-value">{form.subjectName || "—"}</div>
          </div>

          <div className="rr-summary-item">
            <div className="rr-summary-label">
              <BadgeOutlined style={{ fontSize: 13, marginRight: 4 }} /> Mã lớp
            </div>
            <div className="rr-summary-value">{form.classCode || "—"}</div>
          </div>

          {form.lessonDetail && (
            <div className="rr-summary-item span-2">
              <div className="rr-summary-label">Nội dung bài học</div>
              <div className="rr-summary-value">{form.lessonDetail}</div>
            </div>
          )}

          <div className="rr-summary-item span-2">
            <div className="rr-summary-label">Mục đích</div>
            <div
              className="rr-summary-value"
              style={{ whiteSpace: "pre-wrap" }}
            >
              {form.purposeType === "TEACHING"
                ? "Giảng dạy"
                : form.purposeType === "RESEARCH"
                  ? "Nghiên cứu"
                  : form.purposeType === "EXAM"
                    ? "Thi cử"
                    : form.purposeType || "—"}
            </div>
          </div>

          {form.note && (
            <div className="rr-summary-item span-2">
              <div className="rr-summary-label">Ghi chú</div>
              <div
                className="rr-summary-value"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {form.note}
              </div>
            </div>
          )}
        </div>

        {/* Bảng danh sách hóa chất (Chỉ hiển thị nếu có hóa chất hoặc là phiếu hóa chất) */}
        {isChemTicket && (
          <div
            className="cr-chem-section"
            style={{
              marginTop: 24,
              borderTop: "1px solid #e2e8f0",
              paddingTop: 20,
            }}
          >
            <div
              className="cr-chem-section-title"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontWeight: 600,
                marginBottom: 16,
              }}
            >
              <ScienceOutlined style={{ fontSize: 20, color: "#0f766e" }} />
              Danh sách hóa chất mượn ({chemicals.length} loại)
            </div>

            {chemicals.length === 0 ? (
              <div
                style={{
                  color: "#94a3b8",
                  fontSize: "0.875rem",
                  padding: "12px 0",
                }}
              >
                Chưa có hóa chất nào được chọn.
              </div>
            ) : (
              <div className="cr-chem-table-wrap" style={{ overflowX: "auto" }}>
                <table
                  className="cr-chem-table"
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "0.9rem",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "#f8fafc",
                        textAlign: "left",
                        borderBottom: "2px solid #e2e8f0",
                      }}
                    >
                      <th style={{ padding: "10px 12px" }}>#</th>
                      <th style={{ padding: "10px 12px" }}>Tên hóa chất</th>
                      <th style={{ padding: "10px 12px" }}>Công thức</th>
                      <th style={{ padding: "10px 12px" }}>Mã hóa chất</th>
                      <th style={{ padding: "10px 12px" }}>Số lượng</th>
                      <th style={{ padding: "10px 12px" }}>Đơn vị</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chemicals.map(({ chemical, quantity }, idx) => (
                      <tr
                        key={chemical.id}
                        style={{ borderBottom: "1px solid #e2e8f0" }}
                      >
                        <td style={{ padding: "10px 12px" }}>{idx + 1}</td>
                        <td style={{ padding: "10px 12px" }}>
                          {chemical.name}
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          {chemical.formula || "—"}
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <span
                            style={{
                              backgroundColor: "#f1f5f9",
                              padding: "4px 8px",
                              borderRadius: 4,
                              fontFamily: "monospace",
                              color: "#334155",
                            }}
                          >
                            {chemical.itemCode || "—"}
                          </span>
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <strong>{quantity}</strong>
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          {chemical.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
