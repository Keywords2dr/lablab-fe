import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  Cancel,
  PlayArrow,
  TaskAlt,
  Science,
  AssignmentReturn,
  Block,
  StickyNote2,
} from "@mui/icons-material";
import { rentTicketApi } from "../../../api/rentTicketApi";
import { TICKET_STATUS_MAP } from "../hooks/useRoomManagement";
import { toast } from "react-toastify";
import "../styles/Modals.css";

const PURPOSE_TYPE_MAP = {
  TEACHING: "Giảng dạy",
  RESEARCH: "Nghiên cứu",
  EXAM: "Thi cử",
  OTHER: "Khác",
};

const RETURN_STATUS_MAP = {
  RETURNED: { label: "Đã trả đủ", color: "#059669" },
  PARTIAL: { label: "Trả thiếu", color: "#f59e0b" },
  DAMAGED: { label: "Hư hỏng", color: "#ef4444" },
  LOST: { label: "Mất mát", color: "#dc2626" },
};

export function DetailModal({
  detailItem,
  loadingDetail,
  setDetailItem,
  setRejectTarget,
  refreshData,
  chemicalDict = {},
}) {
  const [loadingAction, setLoadingAction] = useState(null);

  useEffect(() => {
    if (detailItem) {
      console.log("=== DỮ LIỆU CHI TIẾT PHIẾU ===", detailItem);
    }
  }, [detailItem]);

  if (!detailItem) return null;

  const isChemical = detailItem.ticketType === "CHEMICAL_ONLY";
  const isRoom = detailItem.ticketType === "ROOM_ONLY";
  const isRejected = detailItem.status === "REJECTED";

  const showReturnInfo = ["PENDING_RETURN", "RETURNED"].includes(
    detailItem.status,
  );

  const handleApprove = async () => {
    setLoadingAction("APPROVE");
    try {
      await rentTicketApi.teacherApprove(detailItem.ticketId, {
        approved: true,
      });
      toast.success("Đã duyệt phiếu thành công!");
      refreshData();
      setDetailItem(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi duyệt phiếu!");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleActivate = async () => {
    setLoadingAction("ACTIVATE");
    try {
      await rentTicketApi.activateTicket(detailItem.ticketId);
      toast.success("Bàn giao thành công!");
      refreshData();
      setDetailItem(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi bàn giao!");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleConfirmReturn = async () => {
    setLoadingAction("RETURN");
    try {
      await rentTicketApi.confirmReturn(detailItem.ticketId);
      toast.success("Đã xác nhận nhận đồ thành công!");
      refreshData();
      setDetailItem(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi xác nhận trả!");
    } finally {
      setLoadingAction(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="trm-overlay">
      <div className="trm-modal">
        <div className="trm-modal-header">
          <h2>Chi tiết phiếu #{detailItem.ticketId?.substring(0, 8)}</h2>
          <button className="trm-close" onClick={() => setDetailItem(null)}>
            ×
          </button>
        </div>

        <div className="trm-modal-body">
          <div className="trm-detail-grid">
            <div className="trm-detail-item bg-violet">
              <span className="trm-detail-label">Loại phiếu</span>
              <span className="trm-detail-value">
                <span
                  className={`trm-type-badge ${isRoom ? "room" : "chemical"}`}
                >
                  {isRoom ? "MƯỢN PHÒNG" : "MƯỢN HÓA CHẤT"}
                </span>
              </span>
            </div>
            <div className="trm-detail-item bg-violet">
              <span className="trm-detail-label">Trạng thái hiện tại</span>
              <span className="trm-detail-value">
                <span
                  className={`trm-status-chip ${TICKET_STATUS_MAP[detailItem.status]?.cls}`}
                >
                  {TICKET_STATUS_MAP[detailItem.status]?.label ||
                    detailItem.status}
                </span>
              </span>
            </div>
            <div className="trm-detail-item bg-sky">
              <span className="trm-detail-label">Người đăng ký</span>
              <span className="trm-detail-value">
                {detailItem.requesterName || "N/A"}
              </span>
            </div>
            <div className="trm-detail-item bg-sky">
              <span className="trm-detail-label">Vai trò hệ thống</span>
              <span className="trm-detail-value">
                {detailItem.requesterRole || "STUDENT"}
              </span>
            </div>
            <div className="trm-detail-item bg-orange">
              <span className="trm-detail-label">
                {isRoom ? "Sử dụng tại phòng" : "Lấy từ kho phòng"}
              </span>
              <span className="trm-detail-value" style={{ color: "#0284c7" }}>
                {detailItem.roomName || "N/A"}
              </span>
            </div>
            <div className="trm-detail-item bg-orange">
              <span className="trm-detail-label">Môn học / Học phần</span>
              <span className="trm-detail-value">
                {detailItem.subjectName || "Học tập tự do"}
              </span>
            </div>
            <div className="trm-detail-item bg-orange">
              <span className="trm-detail-label">Mã lớp</span>
              <span className="trm-detail-value">
                {detailItem.classCode || "—"}
              </span>
            </div>
            <div className="trm-detail-item bg-slate full-width">
              <span className="trm-detail-label">Chi tiết bài học</span>
              <span className="trm-detail-value">
                {detailItem.lessonDetail?.trim() || "—"}
              </span>
            </div>
            <div className="trm-detail-item bg-emerald">
              <span className="trm-detail-label">Thời điểm bắt đầu</span>
              <span className="trm-detail-value">
                {formatDate(detailItem.borrowDate)}
              </span>
            </div>
            <div className="trm-detail-item bg-emerald">
              <span className="trm-detail-label">Thời điểm trả (Dự kiến)</span>
              <span className="trm-detail-value">
                {formatDate(detailItem.expectedReturnDate)}
              </span>
            </div>
            <div className="trm-detail-item bg-slate">
              <span className="trm-detail-label">Mục đích chi tiết</span>
              <span className="trm-detail-value">
                {PURPOSE_TYPE_MAP[detailItem.purposeType] ||
                  detailItem.purposeType ||
                  "—"}
              </span>
            </div>
            <div className="trm-detail-item bg-slate">
              <span className="trm-detail-label">Thời gian tạo phiếu</span>
              <span className="trm-detail-value">
                {formatDate(detailItem.createdAt)}
              </span>
            </div>
          </div>

          {/* GHI CHÚ CỦA NGƯỜI MượN */}
          {detailItem.note && (
            <div
              className="trm-detail-item full-width bg-slate"
              style={{ marginTop: "16px" }}
            >
              <span className="trm-detail-label">
                <StickyNote2
                  sx={{
                    fontSize: 14,
                    verticalAlign: "middle",
                    marginRight: "4px",
                    color: "#7c3aed",
                  }}
                />
                Ghi chú từ người mượn
              </span>
              <span className="trm-detail-value" style={{ fontWeight: 500 }}>
                {detailItem.note}
              </span>
            </div>
          )}

          {/* THÔNG TIN TỪ CHỐI */}
          {isRejected && (
            <div
              style={{
                marginTop: "16px",
                padding: "16px",
                borderRadius: "12px",
                background: "#fff1f2",
                border: "1px solid #fecdd3",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: 700,
                  fontSize: "14px",
                  color: "#be123c",
                }}
              >
                <Block sx={{ fontSize: 16 }} />
                Phiếu đã bị từ chối
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <div style={{ display: "flex", gap: "8px", fontSize: "13px" }}>
                  <span style={{ color: "#94a3b8", minWidth: "110px" }}>
                    Người từ chối:
                  </span>
                  <span style={{ fontWeight: 600, color: "#1e293b" }}>
                    {detailItem.rejectedByName || "—"}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "8px", fontSize: "13px" }}>
                  <span style={{ color: "#94a3b8", minWidth: "110px" }}>
                    Thời điểm:
                  </span>
                  <span style={{ color: "#1e293b" }}>
                    {formatDate(detailItem.rejectedAt)}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "8px", fontSize: "13px" }}>
                  <span
                    style={{
                      color: "#94a3b8",
                      minWidth: "110px",
                      flexShrink: 0,
                    }}
                  >
                    Lý do:
                  </span>
                  <span
                    style={{
                      fontWeight: 500,
                      color: "#be123c",
                      fontStyle: detailItem.rejectedReason
                        ? "normal"
                        : "italic",
                    }}
                  >
                    {detailItem.rejectedReason || "Không có lý do cụ thể."}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* BẢNG CHI TIẾT VẬT TƯ — thông tin mượn ban đầu */}
          {isChemical && (
            <div className="trm-items-section" style={{ marginTop: "24px" }}>
              <h3
                style={{
                  fontSize: "15px",
                  color: "#1e293b",
                  marginBottom: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Science sx={{ fontSize: 18, color: "#0ea5e9" }} /> Danh sách
                vật tư & hóa chất mượn
              </h3>

              {loadingDetail ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "30px",
                    color: "#64748b",
                    background: "#f8fafc",
                    borderRadius: "12px",
                  }}
                >
                  Đang tải danh sách vật tư...
                </div>
              ) : (
                <div className="trm-table-mini-wrap">
                  <table className="trm-table-mini">
                    <thead>
                      <tr>
                        <th>Tên vật tư</th>
                        <th style={{ textAlign: "center" }}>Công thức</th>
                        <th style={{ textAlign: "right" }}>Số lượng mượn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailItem.items && detailItem.items.length > 0 ? (
                        detailItem.items.map((item, idx) => (
                          <tr key={idx}>
                            <td>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                <strong>{item.itemName}</strong>
                                {item.itemCode && (
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      color: "#94a3b8",
                                    }}
                                  >
                                    Mã: {item.itemCode}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td
                              style={{
                                textAlign: "center",
                                fontStyle: "italic",
                                color: "#64748b",
                              }}
                            >
                              {item.chemicalFormula ||
                                item.formula ||
                                chemicalDict[item.itemId] ||
                                chemicalDict[item.itemCode] ||
                                "—"}
                            </td>
                            <td
                              style={{
                                textAlign: "right",
                                color: "#0284c7",
                                fontWeight: "bold",
                              }}
                            >
                              {item.quantityBorrowed ?? item.quantity ?? "—"}{" "}
                              {item.itemUnit || item.unit || ""}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="3"
                            style={{
                              textAlign: "center",
                              padding: "16px",
                              color: "#94a3b8",
                            }}
                          >
                            Không tìm thấy dữ liệu vật tư cụ thể.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* BẢNG THÔNG TIN HOÀN TRẢ */}
          {showReturnInfo &&
            isChemical &&
            detailItem.items &&
            detailItem.items.length > 0 && (
              <div className="trm-items-section" style={{ marginTop: "20px" }}>
                <h3
                  style={{
                    fontSize: "15px",
                    color: "#1e293b",
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <AssignmentReturn sx={{ fontSize: 18, color: "#f97316" }} />
                  Thông tin hoàn trả từ người mượn
                </h3>
                <div className="trm-table-mini-wrap">
                  <table className="trm-table-mini">
                    <thead>
                      <tr>
                        <th>Tên vật tư</th>
                        <th style={{ textAlign: "right" }}>Đã mượn</th>
                        <th style={{ textAlign: "right" }}>Thực trả</th>
                        <th style={{ textAlign: "center" }}>Trạng thái</th>
                        <th>Ghi chú trả</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailItem.items.map((item, idx) => {
                        const rs = RETURN_STATUS_MAP[item.returnStatus] || null;
                        return (
                          <tr key={idx}>
                            <td>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                <strong>{item.itemName}</strong>
                                {item.itemCode && (
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      color: "#94a3b8",
                                    }}
                                  >
                                    Mã: {item.itemCode}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td
                              style={{ textAlign: "right", color: "#64748b" }}
                            >
                              {item.quantityBorrowed ?? "—"}{" "}
                              {item.itemUnit || ""}
                            </td>
                            <td
                              style={{
                                textAlign: "right",
                                fontWeight: "bold",
                                color:
                                  item.quantityReturned >= item.quantityBorrowed
                                    ? "#059669"
                                    : "#f59e0b",
                              }}
                            >
                              {item.quantityReturned ?? "—"}{" "}
                              {item.itemUnit || ""}
                            </td>
                            <td style={{ textAlign: "center" }}>
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
                            <td style={{ color: "#475569", fontSize: "13px" }}>
                              {item.returnNote || (
                                <span style={{ color: "#cbd5e1" }}>
                                  Không có
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          {showReturnInfo && isRoom && detailItem.returnNote && (
            <div
              className="trm-detail-item full-width bg-slate"
              style={{ marginTop: "16px" }}
            >
              <span className="trm-detail-label" style={{ color: "#f97316" }}>
                <AssignmentReturn
                  sx={{
                    fontSize: 14,
                    verticalAlign: "middle",
                    marginRight: "4px",
                  }}
                />
                Ghi chú trả phòng từ người mượn
              </span>
              <span className="trm-detail-value" style={{ fontWeight: 500 }}>
                {detailItem.returnNote}
              </span>
            </div>
          )}
        </div>

        <div className="trm-modal-footer">
          <button
            className="trm-btn ghost"
            onClick={() => setDetailItem(null)}
            disabled={loadingAction !== null}
          >
            Đóng cửa sổ
          </button>
          <div style={{ display: "flex", gap: "12px" }}>
            {detailItem.status === "PENDING_OWNER" && (
              <>
                <button
                  className="trm-btn danger"
                  onClick={() => {
                    setRejectTarget(detailItem);
                    setDetailItem(null);
                  }}
                  disabled={loadingAction !== null}
                >
                  Từ chối
                </button>
                <button
                  className="trm-btn primary"
                  onClick={handleApprove}
                  disabled={loadingAction !== null}
                >
                  {loadingAction === "APPROVE"
                    ? "Đang xử lý..."
                    : "Duyệt phiếu"}
                </button>
              </>
            )}
            {detailItem.status === "APPROVED" && (
              <button
                className="trm-btn primary"
                onClick={handleActivate}
                disabled={loadingAction !== null}
              >
                {loadingAction === "ACTIVATE" ? "Đang xử lý..." : "Bàn giao đồ"}
              </button>
            )}
            {detailItem.status === "PENDING_RETURN" && (
              <button
                className="trm-btn primary"
                onClick={handleConfirmReturn}
                disabled={loadingAction !== null}
              >
                {loadingAction === "RETURN"
                  ? "Đang xử lý..."
                  : "Xác nhận đã nhận đồ"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function RejectModal({ rejectTarget, setRejectTarget, refreshData }) {
  const [rejectNote, setRejectNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!rejectTarget) return null;

  const handleReject = async () => {
    if (!rejectNote.trim()) {
      toast.warning("Vui lòng nhập lý do từ chối!");
      return;
    }
    setIsSubmitting(true);
    try {
      await rentTicketApi.teacherApprove(rejectTarget.ticketId, {
        approved: false,
        rejectedReason: rejectNote,
      });
      toast.success("Đã từ chối phiếu!");
      refreshData();
      setRejectTarget(null);
      setRejectNote("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi từ chối!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="trm-overlay">
      <div className="trm-modal trm-modal-sm">
        <div className="trm-modal-header">
          <h2>Từ chối phiếu #{rejectTarget.ticketId?.substring(0, 8)}</h2>
          <button className="trm-close" onClick={() => setRejectTarget(null)}>
            ×
          </button>
        </div>
        <div className="trm-modal-body">
          <p
            style={{
              marginBottom: 12,
              color: "#64748b",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Lý do từ chối: <span style={{ color: "#ef4444" }}>*</span>
          </p>
          <textarea
            className="trm-textarea"
            rows={4}
            placeholder="Nhập lý do từ chối (bắt buộc)..."
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
          />
        </div>
        <div className="trm-modal-footer">
          <button
            className="trm-btn ghost"
            onClick={() => setRejectTarget(null)}
            disabled={isSubmitting}
          >
            Hủy bỏ
          </button>
          <button
            className="trm-btn danger"
            onClick={handleReject}
            disabled={isSubmitting || !rejectNote.trim()}
          >
            {isSubmitting ? "Đang xử lý..." : "Xác nhận từ chối"}
          </button>
        </div>
      </div>
    </div>
  );
}
