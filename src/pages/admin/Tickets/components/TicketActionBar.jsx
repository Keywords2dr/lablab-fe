import React from "react";
import { Button, Modal, Input } from "antd";
import { CloseCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";

export default function TicketActionBar({
  ticket,
  submitting,
  onApprove,
  rejectOpen,
  setRejectOpen,
  rejectReason,
  setRejectReason,
  onConfirmReject,
}) {
  if (ticket.status !== "PENDING_ADMIN") return null;

  return (
    <>
      <div className="atd-action-bar">
        <Button
          className="atd-btn-reject"
          icon={<CloseCircleOutlined />}
          onClick={() => setRejectOpen(true)}
        >
          Từ chối phiếu
        </Button>
        <Button
          className="atd-btn-approve"
          icon={<CheckCircleOutlined />}
          loading={submitting}
          onClick={onApprove}
        >
          Phê duyệt phiếu
        </Button>
      </div>

      <Modal
        className="atd-reject-modal"
        title="Xác nhận từ chối phiếu"
        open={rejectOpen}
        onOk={onConfirmReject}
        onCancel={() => { setRejectOpen(false); setRejectReason(""); }}
        confirmLoading={submitting}
        okText="Xác nhận từ chối"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p className="atd-modal-label">
          Vui lòng nhập lý do từ chối để người mượn hiểu rõ hơn:
        </p>
        <Input.TextArea
          rows={4}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Mô tả lý do cụ thể..."
        />
      </Modal>
    </>
  );
}
