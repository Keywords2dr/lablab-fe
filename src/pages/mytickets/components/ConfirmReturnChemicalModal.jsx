import React, { useState, useEffect } from "react";
import {
  AssignmentReturnOutlined,
  WarningAmberOutlined,
  CheckCircleOutlined,
  ErrorOutlined,
  RemoveCircleOutlined,
  BuildOutlined,
  CloseOutlined,
} from "@mui/icons-material";
import { rentTicketApi } from "../../../api/rentTicketApi";
import { CircularProgress } from "@mui/material";

const REQUIRES_NOTE = ["DAMAGED", "LOST", "PARTIAL"];

const STATUS_OPTIONS = [
  {
    value: "RETURNED",
    label: "Nguyên vẹn",
    icon: <CheckCircleOutlined sx={{ fontSize: 15 }} />,
    color: "#10b981",
    bg: "#f0fdf4",
    border: "#6ee7b7",
  },
  {
    value: "PARTIAL",
    label: "Thiếu SL",
    icon: <RemoveCircleOutlined sx={{ fontSize: 15 }} />,
    color: "#f59e0b",
    bg: "#fffbeb",
    border: "#fcd34d",
  },
  {
    value: "DAMAGED",
    label: "Bị hỏng",
    icon: <BuildOutlined sx={{ fontSize: 15 }} />,
    color: "#f97316",
    bg: "#fff7ed",
    border: "#fdba74",
  },
  {
    value: "LOST",
    label: "Làm mất",
    icon: <ErrorOutlined sx={{ fontSize: 15 }} />,
    color: "#ef4444",
    bg: "#fef2f2",
    border: "#fca5a5",
  },
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');

  .crm-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.55);
    backdrop-filter: blur(6px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    animation: crm-fadeIn 0.18s ease;
  }

  @keyframes crm-fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes crm-slideUp {
    from { opacity: 0; transform: translateY(20px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .crm-modal {
    font-family: 'Be Vietnam Pro', sans-serif;
    background: #fff;
    border-radius: 20px;
    width: 100%;
    max-width: 580px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 24px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.1);
    animation: crm-slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1);
    overflow: hidden;
  }

  /* ── HEADER ── */
  .crm-header {
    padding: 22px 24px 18px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    border-bottom: 1px solid #f1f5f9;
    flex-shrink: 0;
  }

  .crm-header-left {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .crm-header-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, #10b981, #059669);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(16,185,129,0.3);
  }

  .crm-header-title {
    font-size: 16px;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.3px;
  }

  .crm-header-sub {
    font-size: 12px;
    color: #94a3b8;
    margin-top: 2px;
    font-family: 'Courier New', monospace;
    letter-spacing: 0.3px;
  }

  .crm-close-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: none;
    background: #f8fafc;
    color: #64748b;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
    flex-shrink: 0;
  }

  .crm-close-btn:hover {
    background: #f1f5f9;
    color: #1e293b;
  }

  /* ── BODY ── */
  .crm-body {
    overflow-y: auto;
    padding: 20px 24px;
    flex: 1;
  }

  .crm-body::-webkit-scrollbar { width: 4px; }
  .crm-body::-webkit-scrollbar-track { background: transparent; }
  .crm-body::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }

  .crm-section-label {
    font-size: 11px;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* ── ITEM CARD ── */
  .crm-item-card {
    border: 1.5px solid #e2e8f0;
    border-radius: 14px;
    padding: 16px;
    margin-bottom: 12px;
    background: #fafafa;
    transition: border-color 0.2s;
  }

  .crm-item-card.has-error {
    border-color: #fca5a5;
    background: #fff5f5;
  }

  .crm-item-name {
    font-size: 14px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 4px;
  }

  .crm-item-borrowed {
    font-size: 12px;
    color: #64748b;
    font-weight: 500;
    margin-bottom: 14px;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: #f1f5f9;
    padding: 3px 10px;
    border-radius: 99px;
  }

  /* ── STATUS PILLS ── */
  .crm-status-group {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
    margin-bottom: 12px;
  }

  .crm-status-pill {
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    padding: 7px 4px;
    cursor: pointer;
    background: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    transition: all 0.15s;
    font-family: 'Be Vietnam Pro', sans-serif;
  }

  .crm-status-pill:hover {
    border-color: #cbd5e1;
    background: #f8fafc;
  }

  .crm-status-pill.active {
    font-weight: 700;
  }

  /* ── QTY ROW ── */
  .crm-qty-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }

  .crm-qty-label {
    font-size: 12px;
    color: #64748b;
    font-weight: 500;
    white-space: nowrap;
  }

  .crm-qty-input {
    flex: 1;
    height: 36px;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    padding: 0 12px;
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
    font-family: 'Be Vietnam Pro', sans-serif;
    outline: none;
    transition: border-color 0.15s;
    background: #fff;
  }

  .crm-qty-input:focus {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16,185,129,0.1);
  }

  .crm-qty-unit {
    font-size: 12px;
    font-weight: 700;
    color: #94a3b8;
    background: #f1f5f9;
    padding: 0 10px;
    height: 36px;
    display: flex;
    align-items: center;
    border-radius: 8px;
    letter-spacing: 0.5px;
  }

  /* ── NOTE INPUT ── */
  .crm-note-input {
    width: 100%;
    height: 34px;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    padding: 0 12px;
    font-size: 13px;
    color: #1e293b;
    font-family: 'Be Vietnam Pro', sans-serif;
    outline: none;
    transition: border-color 0.15s;
    background: #fff;
    box-sizing: border-box;
  }

  .crm-note-input:focus {
    border-color: #94a3b8;
    box-shadow: 0 0 0 3px rgba(148,163,184,0.12);
  }

  .crm-note-input.required {
    border-color: #f97316;
  }

  .crm-note-input.required:focus {
    box-shadow: 0 0 0 3px rgba(249,115,22,0.12);
  }

  /* ── ERROR ── */
  .crm-error-msg {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 7px;
    font-size: 12px;
    color: #ef4444;
    font-weight: 500;
  }

  /* ── DIVIDER ── */
  .crm-divider {
    height: 1px;
    background: #f1f5f9;
    margin: 16px 0;
  }

  /* ── GENERAL NOTE ── */
  .crm-general-note {
    width: 100%;
    min-height: 72px;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 13px;
    color: #1e293b;
    font-family: 'Be Vietnam Pro', sans-serif;
    outline: none;
    resize: none;
    transition: border-color 0.15s;
    background: #fff;
    box-sizing: border-box;
  }

  .crm-general-note:focus {
    border-color: #94a3b8;
    box-shadow: 0 0 0 3px rgba(148,163,184,0.12);
  }

  /* ── FOOTER ── */
  .crm-footer {
    padding: 16px 24px;
    border-top: 1px solid #f1f5f9;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    flex-shrink: 0;
    background: #fff;
  }

  .crm-btn-ghost {
    height: 40px;
    padding: 0 20px;
    border-radius: 10px;
    border: 1.5px solid #e2e8f0;
    background: #fff;
    color: #64748b;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'Be Vietnam Pro', sans-serif;
    transition: all 0.15s;
  }

  .crm-btn-ghost:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    color: #1e293b;
  }

  .crm-btn-submit {
    height: 40px;
    padding: 0 22px;
    border-radius: 10px;
    border: none;
    background: linear-gradient(135deg, #10b981, #059669);
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    font-family: 'Be Vietnam Pro', sans-serif;
    transition: all 0.15s;
    box-shadow: 0 4px 12px rgba(16,185,129,0.3);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .crm-btn-submit:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(16,185,129,0.38);
  }

  .crm-btn-submit:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  /* ── LOADING / ERROR STATES ── */
  .crm-state-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
    gap: 12px;
  }

  .crm-state-text {
    font-size: 13px;
    color: #94a3b8;
    font-weight: 500;
  }

  .crm-fetch-error {
    padding: 14px 16px;
    border-radius: 10px;
    background: #fef2f2;
    border: 1.5px solid #fca5a5;
    color: #dc2626;
    font-size: 13px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

export default function ConfirmReturnChemicalModal({
  ticket,
  onConfirm,
  onClose,
}) {
  const [items, setItems] = useState([]);
  const [generalNote, setGeneralNote] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (!ticket?.ticketId) return;
    const fetchDetail = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const res = await rentTicketApi.getTicketById(ticket.ticketId);
        const rawDetails =
          res.data?.items || res.data?.ticketDetails || res.data?.details || [];
        if (rawDetails.length === 0) {
          setFetchError("Không tìm thấy chi tiết hóa chất từ server.");
          return;
        }
        setItems(
          rawDetails.map((d) => ({
            detailId: d.detailId,
            name: d.itemName || d.item?.name || "—",
            borrowed: d.quantityBorrowed,
            unit: d.itemUnit || d.item?.unit || d.unit || "",
            quantityReturned: d.quantityBorrowed,
            returnStatus: "RETURNED",
            returnNote: "",
          })),
        );
      } catch {
        setFetchError("Lỗi khi tải chi tiết phiếu. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [ticket?.ticketId]);

  if (!ticket) return null;

  const handleItemChange = (detailId, field, value) => {
    setItems((prev) =>
      prev.map((item) =>
        item.detailId === detailId ? { ...item, [field]: value } : item,
      ),
    );
    if (errors[detailId]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[detailId];
        return n;
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    items.forEach((item) => {
      if (
        REQUIRES_NOTE.includes(item.returnStatus) &&
        !item.returnNote.trim()
      ) {
        const label =
          item.returnStatus === "DAMAGED"
            ? "hỏng"
            : item.returnStatus === "LOST"
              ? "mất"
              : "thiếu số lượng";
        newErrors[item.detailId] = `Vui lòng ghi chú cho hóa chất bị ${label}`;
      }
      const qty = parseFloat(item.quantityReturned);
      if (isNaN(qty) || qty < 0) {
        newErrors[item.detailId] =
          newErrors[item.detailId] || "Số lượng không hợp lệ";
      }
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onConfirm(ticket.ticketId, {
      items: items.map(
        ({ detailId, quantityReturned, returnStatus, returnNote }) => ({
          detailId,
          quantityReturned: parseFloat(quantityReturned),
          returnStatus,
          returnNote: returnNote.trim(),
        }),
      ),
      returnNote: generalNote.trim(),
    });
    onClose();
  };

  return (
    <>
      <style>{styles}</style>
      <div className="crm-overlay" onClick={onClose}>
        <div className="crm-modal" onClick={(e) => e.stopPropagation()}>
          {/* ── HEADER ── */}
          <div className="crm-header">
            <div className="crm-header-left">
              <div className="crm-header-icon">
                <AssignmentReturnOutlined sx={{ fontSize: 22 }} />
              </div>
              <div>
                <div className="crm-header-title">Yêu cầu trả hóa chất</div>
                <div className="crm-header-sub">
                  {ticket.ticketId.substring(0, 8).toUpperCase()}…
                </div>
              </div>
            </div>
            <button className="crm-close-btn" onClick={onClose}>
              <CloseOutlined sx={{ fontSize: 16 }} />
            </button>
          </div>

          {/* ── BODY ── */}
          <div className="crm-body">
            {loading ? (
              <div className="crm-state-center">
                <CircularProgress size={28} sx={{ color: "#10b981" }} />
                <div className="crm-state-text">
                  Đang tải danh sách hóa chất...
                </div>
              </div>
            ) : fetchError ? (
              <div className="crm-fetch-error">
                <ErrorOutlined sx={{ fontSize: 18 }} />
                {fetchError}
              </div>
            ) : (
              <>
                <div className="crm-section-label">
                  {items.length} hóa chất cần xác nhận
                </div>

                {items.map((item) => {
                  const hasError = !!errors[item.detailId];
                  const needsNote = REQUIRES_NOTE.includes(item.returnStatus);

                  return (
                    <div
                      key={item.detailId}
                      className={`crm-item-card ${hasError ? "has-error" : ""}`}
                    >
                      {/* Name + borrowed badge */}
                      <div className="crm-item-name">{item.name}</div>
                      <div className="crm-item-borrowed">
                        Đã mượn:{" "}
                        <strong>
                          {item.borrowed} {item.unit}
                        </strong>
                      </div>

                      {/* Status pills */}
                      <div className="crm-status-group">
                        {STATUS_OPTIONS.map((opt) => {
                          const isActive = item.returnStatus === opt.value;
                          return (
                            <button
                              key={opt.value}
                              className={`crm-status-pill ${isActive ? "active" : ""}`}
                              style={
                                isActive
                                  ? {
                                      borderColor: opt.border,
                                      background: opt.bg,
                                      color: opt.color,
                                    }
                                  : {}
                              }
                              onClick={() =>
                                handleItemChange(
                                  item.detailId,
                                  "returnStatus",
                                  opt.value,
                                )
                              }
                            >
                              <span
                                style={{
                                  color: isActive ? opt.color : "#94a3b8",
                                }}
                              >
                                {opt.icon}
                              </span>
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Qty row */}
                      <div className="crm-qty-row">
                        <span className="crm-qty-label">Số lượng trả:</span>
                        <input
                          type="number"
                          min="0"
                          className="crm-qty-input"
                          value={item.quantityReturned}
                          onChange={(e) =>
                            handleItemChange(
                              item.detailId,
                              "quantityReturned",
                              e.target.value,
                            )
                          }
                        />
                        {item.unit && (
                          <span className="crm-qty-unit">{item.unit}</span>
                        )}
                      </div>

                      {/* Note */}
                      <input
                        type="text"
                        className={`crm-note-input ${needsNote ? "required" : ""}`}
                        placeholder={
                          needsNote
                            ? "⚠ Bắt buộc — mô tả tình trạng cụ thể..."
                            : "Ghi chú thêm (tùy chọn)..."
                        }
                        value={item.returnNote}
                        onChange={(e) =>
                          handleItemChange(
                            item.detailId,
                            "returnNote",
                            e.target.value,
                          )
                        }
                      />

                      {hasError && (
                        <div className="crm-error-msg">
                          <WarningAmberOutlined sx={{ fontSize: 14 }} />
                          {errors[item.detailId]}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* General note */}
                <div className="crm-divider" />
                <div className="crm-section-label">
                  Ghi chú chung (tùy chọn)
                </div>
                <textarea
                  className="crm-general-note"
                  placeholder="Lưu ý thêm cho giáo viên khi nhận lại hóa chất..."
                  value={generalNote}
                  onChange={(e) => setGeneralNote(e.target.value)}
                />
              </>
            )}
          </div>

          {/* ── FOOTER ── */}
          <div className="crm-footer">
            <button className="crm-btn-ghost" onClick={onClose}>
              Quay lại
            </button>
            <button
              className="crm-btn-submit"
              onClick={handleSubmit}
              disabled={loading || !!fetchError}
            >
              <AssignmentReturnOutlined sx={{ fontSize: 17 }} />
              Xác nhận trả
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
