import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { HourglassEmpty, Refresh, AccessTime } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useApproveTickets } from "./hooks/useApproveTickets";
import TicketTable from "./components/TicketTable";
import { TICKET_TYPE, fmtDateTime } from "./components/ticketConstants";
import "../../admin/rooms/styles/base.css";
import "./styles/tickets.css";
import "./styles/ticketManager.css";

export default function AdminTicketManager() {
  const navigate = useNavigate();
  const { data, loading, pg, filters, apply, reset, goPage } =
    useApproveTickets();

  const pendingCount = data.filter((d) =>
    ["PENDING_ADMIN", "PENDING_OWNER"].includes(d.status),
  ).length;

  return (
    <div className="rm-root">
      {/* ── Header ── */}
      <div className="rm-header rm-header--purple">
        <div className="rm-header-left">
          <div className="rm-header-icon rm-header-icon--purple">
            <HourglassEmpty sx={{ color: "#fff", fontSize: 26 }} />
          </div>
          <div>
            <div className="rm-header-title">Duyệt Phiếu Mượn</div>
            <div className="rm-header-sub">
              Xem xét và phê duyệt các yêu cầu mượn phòng Lab, hóa chất
            </div>
          </div>
        </div>

        <div className="rm-stats">
          <div className="rm-stat-badge" title="Tổng số phiếu chờ duyệt">
            <div className="num">{pg.total}</div>
            <div className="lbl">Tổng phiếu</div>
          </div>
          {pendingCount > 0 && (
            <div
              className="rm-stat-badge rm-stat-badge--amber"
              title="Đang chờ duyệt"
            >
              <div className="num">{pendingCount}</div>
              <div className="lbl">Chờ duyệt</div>
            </div>
          )}
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="tk-action-bar">
        <div className="tk-filters-row">
          <FormControl size="small" className="tk-filter-select">
            <InputLabel>Loại phiếu</InputLabel>
            <Select
              value={filters.ticketType}
              label="Loại phiếu"
              onChange={(e) => apply("ticketType", e.target.value)}
            >
              <MenuItem value="">Tất cả loại</MenuItem>
              {Object.entries(TICKET_TYPE).map(([k, v]) => (
                <MenuItem key={k} value={k}>
                  {v.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <button className="tk-btn-reset" onClick={reset}>
          <Refresh sx={{ fontSize: 16 }} /> Làm mới
        </button>
      </div>

      {/* ── Bảng phiếu ── */}
      <TicketTable
        data={data}
        loading={loading}
        page={pg.page}
        size={pg.size}
        total={pg.total}
        totalPages={pg.totalPages}
        extraHeaders={<th>Thời gian tạo</th>}
        colsExtra={(t) => (
          <td>
            <div
              className="tk-date"
              style={{ display: "flex", alignItems: "center", gap: 4 }}
            >
              <AccessTime sx={{ fontSize: 12, color: "#94a3b8" }} />
              {fmtDateTime(t.createdAt)}
            </div>
          </td>
        )}
        emptyIcon={
          <HourglassEmpty
            style={{ fontSize: "2.5rem", opacity: 0.25, color: "#94a3b8" }}
          />
        }
        onNavigate={(id) => navigate(`/admin/tickets/${id}`)}
        onPageChange={goPage}
      />
    </div>
  );
}
