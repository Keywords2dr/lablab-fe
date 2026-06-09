import React from "react";
import { SendOutlined, UndoOutlined, DomainOutlined, StickyNote2Outlined } from "@mui/icons-material";

export default function SupplyConfirmDialog({
  type = "allocate", // "allocate" | "revoke"
  open,
  onClose,
  onConfirm,
  submitting,
  summaryData = [], // [{ roomId, roomName, items: [{ itemId, itemName, count, packaging }] }]
  note,
}) {
  if (!open) return null;

  const isAllocate = type === "allocate";
  const title = isAllocate ? "Xác nhận phân phối" : "Xác nhận thu hồi";
  const subTitle = isAllocate
    ? "Kiểm tra lại thông tin trước khi gửi"
    : "Hành động này sẽ thu hồi vật tư khỏi các phòng đã chọn";
  const HeaderIcon = isAllocate ? SendOutlined : UndoOutlined;
  const SubmitIcon = isAllocate ? SendOutlined : undefined;

  return (
    <div className="stp-dialog-overlay" onClick={onClose}>
      <div className="stp-dialog" onClick={(e) => e.stopPropagation()}>
        <div className={`stp-dialog__header ${!isAllocate ? "stp-dialog__header--revoke" : ""}`}>
          <div className="stp-dialog__icon">
            <HeaderIcon style={{ fontSize: 22 }} />
          </div>
          <div>
            <div className="stp-dialog__title">{title}</div>
            <div className="stp-dialog__sub">{subTitle}</div>
          </div>
        </div>

        <div className="stp-dialog__body">
          {summaryData.map((d) => (
            <div key={d.roomId} style={{ marginBottom: 14 }}>
              <div className="stp-dialog__section-label">
                <DomainOutlined style={{ fontSize: 14 }} />
                {d.roomName}
              </div>
              <div className="stp-dialog__list">
                {!d.items || d.items.length === 0 ? (
                  <div style={{ padding: "4px 0", fontSize: 12, color: "#94a3b8" }}>
                    Không có hóa chất
                  </div>
                ) : (
                  d.items.map((i) => (
                    <div key={i.itemId} className="stp-dialog__row">
                      <span className="stp-dialog__row-name">{i.itemName}</span>
                      <span className="stp-dialog__row-qty">
                        {i.count} {i.packaging || "gói"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}

          {note && (
            <div className="stp-dialog__note">
              <StickyNote2Outlined style={{ fontSize: 13, flexShrink: 0 }} />
              <span>{note}</span>
            </div>
          )}
        </div>

        <div className="stp-dialog__footer">
          <button
            className="stp-dialog__cancel-btn"
            onClick={onClose}
            disabled={submitting}
          >
            {isAllocate ? "Quay lại" : "Hủy"}
          </button>
          <button
            className={`stp-dialog__ok-btn ${!isAllocate ? "stp-dialog__ok-btn--revoke" : ""}`}
            onClick={onConfirm}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="stp-spinner stp-spinner--white" />
                Đang xử lý...
              </>
            ) : (
              <>
                {SubmitIcon && <SubmitIcon style={{ fontSize: 16 }} />}
                {title}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
