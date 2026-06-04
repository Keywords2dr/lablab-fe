import React from "react";
import { Tag } from "antd";
import { AuditOutlined } from "@ant-design/icons";
import { TICKET_TYPE } from "../constants/ticketConstants";

export default function TicketDetailHeader({ ticket, statusCfg, typeCfg }) {
  return (
    <div className="atd-header-card">
      <div className="atd-header-left">
        <div className="atd-header-icon"><AuditOutlined /></div>
        <div>
          <div className="atd-header-title">Chi tiết phiếu mượn</div>
          <div className="atd-header-sub">
            Mã&nbsp;<strong style={{ color: "#c7d2fe" }}>#{ticket.ticketId}</strong>
            &nbsp;·&nbsp;{typeCfg.label}
          </div>
        </div>
      </div>
      <div className="atd-header-right">
        <span className="atd-status-badge">
          <span className="atd-status-dot" style={{ background: statusCfg.dot }} />
          {statusCfg.label}
        </span>
      </div>
    </div>
  );
}
