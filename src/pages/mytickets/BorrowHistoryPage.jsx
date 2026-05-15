import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  HistoryOutlined,
  TrackChangesOutlined,
  Search,
  CalendarToday,
  MeetingRoom,
  Science,
  InboxOutlined,
} from "@mui/icons-material";

import {
  useTickets,
  TICKET_STATUS_MAP,
  TICKET_TYPE_MAP,
} from "./hooks/useTickets";
import { toast } from "react-toastify";
import TicketDetailModal from "./components/TicketDetailModal";
import "./styles/ticketTracking.css";

const FILTER_OPTIONS = [
  { value: "ALL", label: "Tất cả" },
  { value: "RETURNED", label: "Đã hoàn tất" },
  { value: "REJECTED", label: "Từ chối" },
  { value: "CANCELLED", label: "Đã hủy" },
];
const PAGE_SIZE = 8;

export default function BorrowHistoryPage() {
  const navigate = useNavigate();
  const {
    tickets,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    statusCounts,
    getTicketDetail,
    loading,
  } = useTickets("history");
  const [detailTicket, setDetailTicket] = useState(null);
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(tickets.length / PAGE_SIZE));
  const pagedTickets = useMemo(
    () => tickets.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [tickets, page],
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleOpenDetail = async (ticket) => {
    try {
      const detail = await getTicketDetail(ticket.ticketId);
      setDetailTicket(detail);
    } catch {
      toast.error("Lỗi khi tải chi tiết phiếu");
    }
  };

  return (
    <div className="tt-root">
      <div className="tt-nav-links">
        <button className="tt-nav-link" onClick={() => navigate("/my-tickets")}>
          <TrackChangesOutlined /> Theo dõi phiếu
        </button>
        <button className="tt-nav-link active">
          <HistoryOutlined /> Lịch sử mượn
        </button>
      </div>
      <div className="tt-header">
        <div className="tt-header-left">
          <div className="tt-header-icon">
            <HistoryOutlined />
          </div>
          <div>
            <div className="tt-header-title">Lịch sử mượn</div>
            <div className="tt-header-sub">
              Xem lại các phiếu đã hoàn tất, bị từ chối hoặc đã hủy
            </div>
          </div>
        </div>
        <div className="tt-header-stats">
          <div className="tt-stat-box">
            <div className="tt-stat-number">{statusCounts.ALL || 0}</div>
            <div className="tt-stat-label">Tổng phiếu</div>
          </div>
          <div className="tt-stat-box">
            <div className="tt-stat-number" style={{ color: "#34d399" }}>
              {statusCounts.RETURNED || 0}
            </div>
            <div className="tt-stat-label">Hoàn tất</div>
          </div>
          <div className="tt-stat-box">
            <div className="tt-stat-number" style={{ color: "#f87171" }}>
              {(statusCounts.REJECTED || 0) + (statusCounts.CANCELLED || 0)}
            </div>
            <div className="tt-stat-label">Hủy / Từ chối</div>
          </div>
        </div>
      </div>
      <div className="tt-toolbar">
        <div className="tt-search-wrap">
          <Search />
          <input
            className="tt-search-input"
            type="text"
            placeholder="Tìm theo mã phiếu, tên phòng, môn học..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </div>
        <div className="tt-filter-chips">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`tt-chip ${filterStatus === opt.value ? "active" : ""}`}
              onClick={() => {
                setFilterStatus(opt.value);
                setPage(0);
              }}
            >
              {opt.label}
              {statusCounts[opt.value] > 0 && (
                <span className="tt-chip-count">{statusCounts[opt.value]}</span>
              )}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="tt-loading">
          <div className="tt-loading-rings">
            <div />
            <div />
            <div />
          </div>
          <p className="tt-loading-text">Đang tải lịch sử mượn...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="tt-empty">
          <div className="tt-empty-icon">
            <InboxOutlined />
          </div>
          <div className="tt-empty-title">Chưa có lịch sử</div>
        </div>
      ) : (
        <div className="tt-table-panel">
          <div className="tt-table-wrap">
            <table className="tt-table">
              <thead>
                <tr>
                  <th>Mã phiếu</th>
                  <th>Loại</th>
                  <th>Phòng</th>
                  <th>Ngày mượn</th>
                  <th>Ngày trả</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: "right" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pagedTickets.map((ticket) => {
                  const statusInfo = TICKET_STATUS_MAP[ticket.status] || {};
                  const typeInfo = TICKET_TYPE_MAP[ticket.ticketType] || {};
                  return (
                    <tr
                      key={ticket.ticketId}
                      onClick={() => handleOpenDetail(ticket)}
                    >
                      <td>
                        <span className="tt-table-id">{ticket.ticketId}</span>
                      </td>
                      <td>
                        <span className={`tt-type-badge ${typeInfo.cls || ""}`}>
                          {ticket.ticketType === "ROOM_ONLY" ? (
                            <MeetingRoom sx={{ fontSize: 13 }} />
                          ) : (
                            <Science sx={{ fontSize: 13 }} />
                          )}
                          {typeInfo.short || ticket.ticketType}
                        </span>
                      </td>
                      <td>
                        <span className="tt-table-room">{ticket.roomName}</span>
                      </td>
                      <td>
                        <div className="tt-table-date">
                          <CalendarToday />
                          {formatDate(ticket.borrowDate)}
                        </div>
                      </td>
                      <td>
                        <div className="tt-table-date">
                          <CalendarToday />
                          {formatDate(ticket.expectedReturnDate)}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`tt-status-chip ${statusInfo.cls || ""}`}
                        >
                          {statusInfo.label || ticket.status}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          className="tt-pagination-btn"
                          style={{ fontSize: "0.8rem" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetail(ticket);
                          }}
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="tt-pagination">
              <button
                className="tt-pagination-btn"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                Trang trước
              </button>
              <span className="tt-pagination-info">
                Trang {page + 1} / {totalPages}
              </span>
              <button
                className="tt-pagination-btn"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
              >
                Trang sau
              </button>
            </div>
          )}
        </div>
      )}
      {detailTicket && (
        <TicketDetailModal
          ticket={detailTicket}
          onClose={() => setDetailTicket(null)}
        />
      )}
    </div>
  );
}
