import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrackChangesOutlined,
  Search,
  HistoryOutlined,
  InboxOutlined,
} from "@mui/icons-material";

import { useTickets, TICKET_STATUS_MAP } from "./hooks/useTickets";
import { toast } from "react-toastify";
import TicketCard from "./components/TicketCard";
import TicketDetailModal from "./components/TicketDetailModal";
import ConfirmCancelModal from "./components/ConfirmCancelModal";
import ConfirmReturnRoomModal from "./components/ConfirmReturnRoomModal";
import ConfirmReturnChemicalModal from "./components/ConfirmReturnChemicalModal";
import "./styles/ticketTracking.css";

const FILTER_OPTIONS = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING_OWNER", label: "Chờ duyệt phòng" },
  { value: "PENDING_ADMIN", label: "Chờ Admin" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "BORROWED", label: "Đang mượn" },
  { value: "PENDING_RETURN", label: "Chờ trả" },
];

export default function TicketTrackingPage() {
  const navigate = useNavigate();
  const {
    tickets,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    statusCounts,
    handleCancelTicket,
    handleRequestReturn,
    getTicketDetail,
    loading,
  } = useTickets("tracking");
  const [detailTicket, setDetailTicket] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

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
        <button className="tt-nav-link active">
          <TrackChangesOutlined /> Theo dõi phiếu
        </button>
        <button
          className="tt-nav-link"
          onClick={() => navigate("/borrow-history")}
        >
          <HistoryOutlined /> Lịch sử mượn
        </button>
      </div>
      <div className="tt-header">
        <div className="tt-header-left">
          <div className="tt-header-icon">
            <TrackChangesOutlined />
          </div>
          <div>
            <div className="tt-header-title">Phiếu mượn đang xử lý</div>
            <div className="tt-header-sub">
              Theo dõi tiến trình các phiếu mượn đang hoạt động của bạn
            </div>
          </div>
        </div>
        <div className="tt-header-stats">
          <div className="tt-stat-box">
            <div className="tt-stat-number">{statusCounts.ALL || 0}</div>
            <div className="tt-stat-label">Tổng số</div>
          </div>
          <div className="tt-stat-box">
            <div className="tt-stat-number" style={{ color: "#0ea5e9" }}>
              {statusCounts.APPROVED || 0}
            </div>
            <div className="tt-stat-label">Đã duyệt</div>
          </div>
          <div className="tt-stat-box">
            <div className="tt-stat-number" style={{ color: "#10b981" }}>
              {statusCounts.BORROWED || 0}
            </div>
            <div className="tt-stat-label">Đang mượn</div>
          </div>
        </div>
      </div>
      <div className="tt-toolbar">
        <div className="tt-search-wrap">
          <Search />
          <input
            className="tt-search-input"
            type="text"
            placeholder="Tìm theo mã phiếu, phòng, môn học..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="tt-filter-chips">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`tt-chip ${filterStatus === opt.value ? "active" : ""}`}
              onClick={() => setFilterStatus(opt.value)}
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
          <p className="tt-loading-text">Đang tải danh sách phiếu...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="tt-empty">
          <div className="tt-empty-icon">
            <InboxOutlined />
          </div>
          <div className="tt-empty-title">Không có phiếu nào</div>
        </div>
      ) : (
        <div className="tt-grid">
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket.ticketId}
              ticket={ticket}
              onOpenDetail={handleOpenDetail}
              onCancelClick={(t) =>
                setConfirmAction({ type: "cancel", ticket: t })
              }
              onReturnClick={(t) =>
                setConfirmAction({ type: "return", ticket: t })
              }
            />
          ))}
        </div>
      )}
      {detailTicket && (
        <TicketDetailModal
          ticket={detailTicket}
          onClose={() => setDetailTicket(null)}
        />
      )}
      {/* Modal hủy phiếu */}
      {confirmAction?.type === "cancel" && (
        <ConfirmCancelModal
          ticket={confirmAction.ticket}
          onConfirm={(ticketId) => handleCancelTicket(ticketId)}
          onClose={() => setConfirmAction(null)}
        />
      )}

      {/* Modal trả phòng */}
      {confirmAction?.type === "return" &&
        confirmAction.ticket?.ticketType === "ROOM_ONLY" && (
          <ConfirmReturnRoomModal
            ticket={confirmAction.ticket}
            onConfirm={(ticketId, payload) =>
              handleRequestReturn(ticketId, payload)
            }
            onClose={() => setConfirmAction(null)}
          />
        )}

      {/* Modal trả hóa chất */}
      {confirmAction?.type === "return" &&
        confirmAction.ticket?.ticketType === "CHEMICAL_ONLY" && (
          <ConfirmReturnChemicalModal
            ticket={confirmAction.ticket}
            onConfirm={(ticketId, payload) =>
              handleRequestReturn(ticketId, payload)
            }
            onClose={() => setConfirmAction(null)}
          />
        )}
    </div>
  );
}
