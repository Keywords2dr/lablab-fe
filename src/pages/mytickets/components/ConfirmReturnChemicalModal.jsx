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

import "./ConfirmReturnChemicalModal.css";

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
