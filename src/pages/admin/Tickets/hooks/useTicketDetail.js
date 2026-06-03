import { useState, useEffect, useCallback } from "react";
import { message } from "antd";
import ticketApi from "../../../../api/ticketApi";

export function useTicketDetail(id) {
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ticketApi.getDetail(id);
      setTicket(res?.data || res);
    } catch {
      message.error("Không thể tải chi tiết phiếu mượn!");
    } finally {
      setLoading(false);
    }
  }, [id]);
  
  useEffect(() => {
    if (id) loadDetail();
  }, [id, loadDetail]);

  const handleApproveAction = async (approved, rejectReason = "") => {
    if (!approved && !rejectReason.trim()) {
      message.warning("Vui lòng nhập lý do từ chối!");
      return false;
    }
    setSubmitting(true);
    try {
      await ticketApi.adminApprove(id, {
        approved,
        rejectedReason: approved ? null : rejectReason,
      });
      message.success(approved ? "Đã duyệt thành công" : "Đã từ chối phiếu");
      loadDetail();
      return true;
    } catch {
      message.error("Thao tác thất bại!");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return { ticket, loading, submitting, loadDetail, handleApproveAction };
}
