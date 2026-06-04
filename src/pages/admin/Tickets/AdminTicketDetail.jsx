import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Skeleton, Result } from "antd";
import { ArrowLeftOutlined, CloseCircleOutlined } from "@ant-design/icons";

import { useTicketDetail } from "./hooks/useTicketDetail";
import { TICKET_STATUS_DETAIL, TICKET_TYPE } from "./constants/ticketConstants";
import TicketDetailHeader from "./components/TicketDetailHeader";
import TicketInfoCards from "./components/TicketInfoCards";
import TicketItemsSection from "./components/TicketItemsSection";
import TicketActionBar from "./components/TicketActionBar";

import "./styles/index.css";

export default function AdminTicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { ticket, loading, submitting, handleApproveAction } = useTicketDetail(id);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const onConfirmReject = async () => {
    const ok = await handleApproveAction(false, rejectReason);
    if (ok) { setRejectOpen(false); setRejectReason(""); }
  };

  if (loading) return (
    <div className="atd-page">
      <div className="atd-skeleton-wrap"><Skeleton active paragraph={{ rows: 10 }} /></div>
    </div>
  );

  if (!ticket || !ticket.status) return (
    <Result status="404" title="Không tìm thấy phiếu"
      extra={<Button className="atd-btn-approve" onClick={() => navigate("/admin/tickets")}>Quay lại</Button>} />
  );

  const statusCfg  = TICKET_STATUS_DETAIL[ticket.status]   || { label: ticket.status,     dot: "#94a3b8" };
  const typeCfg    = TICKET_TYPE[ticket.ticketType]         || { label: ticket.ticketType, antColor: "default" };
  const isChemical     = ticket.ticketType === "CHEMICAL_ONLY";
  const showReturnInfo = ["PENDING_RETURN", "RETURNED"].includes(ticket.status);

  return (
    <div className="atd-page">
      <Button className="atd-back-btn" icon={<ArrowLeftOutlined />} onClick={() => navigate("/admin/tickets")}>
        Quay lại danh sách
      </Button>

      <TicketDetailHeader ticket={ticket} statusCfg={statusCfg} typeCfg={typeCfg} />

      <TicketInfoCards ticket={ticket} typeCfg={typeCfg} />

      {/* Lý do từ chối */}
      {ticket.rejectedReason && (
        <div className="atd-reject-card">
          <div className="atd-card-header">
            <div className="atd-card-icon atd-card-icon--red"><CloseCircleOutlined /></div>
            <span className="atd-card-title">Lý do từ chối</span>
          </div>
          <div className="atd-reject-reason">{ticket.rejectedReason}</div>
        </div>
      )}

      <TicketItemsSection
        ticket={ticket}
        isChemical={isChemical}
        showReturnInfo={showReturnInfo}
      />

      <TicketActionBar
        ticket={ticket}
        submitting={submitting}
        onApprove={() => handleApproveAction(true, "")}
        rejectOpen={rejectOpen}
        setRejectOpen={setRejectOpen}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        onConfirmReject={onConfirmReject}
      />
    </div>
  );
}
