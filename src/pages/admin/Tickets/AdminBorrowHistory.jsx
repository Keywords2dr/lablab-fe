import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { LibraryBooks, Refresh, AccessTime } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useHistoryTickets } from "./hooks/useHistoryTickets";
import TicketTable from "./components/TicketTable";
import {
  TICKET_TYPE,
  TICKET_STATUS,
  fmtDate,
  fmtDateTime,
} from "./components/ticketConstants";
import "./styles/index.css";

export default function AdminBorrowHistory() {
  const navigate = useNavigate();
  const { data, loading, pg, filters, apply, reset, goPage } =
    useHistoryTickets();

  return (
    <div className="rm-root">
      <div className="rm-header bh-header">
        <div className="rm-header-left">
          <div className="rm-header-icon bh-header-icon">
            <LibraryBooks sx={{ color: "#fff", fontSize: 26 }} />
          </div>
          <div>
            <div className="rm-header-title">Lịch Sử Phiếu Mượn</div>
            <div className="rm-header-sub">
              Tra cứu toàn bộ lịch sử phiếu mượn — lọc theo loại, trạng thái và
              người yêu cầu
            </div>
          </div>
        </div>
      </div>

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
          <FormControl size="small" className="tk-filter-select">
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={filters.status}
              label="Trạng thái"
              onChange={(e) => apply("status", e.target.value)}
            >
              <MenuItem value="">Tất cả</MenuItem>
              {Object.entries(TICKET_STATUS).map(([k, v]) => (
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

      <TicketTable
        data={data}
        loading={loading}
        page={pg.page}
        size={pg.size}
        total={pg.total}
        totalPages={pg.totalPages}
        extraHeaders={
          <>
            <th>Ngày mượn</th>
            <th>Thời gian tạo</th>
          </>
        }
        colsExtra={(t) => (
          <>
            <td>
              <span className="tk-date">{fmtDate(t.borrowDate)}</span>
            </td>
            <td>
              <div
                className="tk-date"
                style={{ display: "flex", alignItems: "center", gap: 4 }}
              >
                <AccessTime sx={{ fontSize: 12, color: "#94a3b8" }} />
                {fmtDateTime(t.createdAt)}
              </div>
            </td>
          </>
        )}
        emptyIcon={
          <LibraryBooks
            style={{ fontSize: "2.5rem", opacity: 0.25, color: "#94a3b8" }}
          />
        }
        onNavigate={(id) => navigate(`/admin/tickets/${id}`)}
        onPageChange={goPage}
      />
    </div>
  );
}
