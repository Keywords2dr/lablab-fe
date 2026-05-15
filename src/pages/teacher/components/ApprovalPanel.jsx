import React from "react";
import {
  Search,
  MeetingRoom,
  Science,
  Person,
  CalendarToday,
} from "@mui/icons-material";
import { TICKET_STATUS_MAP } from "../hooks/useRoomManagement";
import "../styles/ApprovalPanel.css";

const FILTER_TABS = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING_OWNER", label: "Chờ bạn duyệt" },
  { value: "APPROVED", label: "Sẵn sàng bàn giao" },
  { value: "BORROWED", label: "Đang mượn" },
  { value: "PENDING_RETURN", label: "Chờ xác nhận trả" },
  { value: "RETURNED", label: "Đã hoàn tất" },
];

export default function ApprovalPanel({
  search,
  setSearch,
  filterStatus,
  setFilterStatus,
  filteredReqs,
  handleOpenDetail,
  page,
  setPage,
  totalPages,
  tableLoading,
}) {
  return (
    <div className="trm-panel">
      {/* Search & Filter Bar */}
      <div
        className="trm-filter-bar"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div className="trm-search-box" style={{ width: "100%" }}>
          <Search />
          <input
            type="text"
            placeholder="Tìm theo mã phiếu, tên người mượn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div
          className="trm-filter-chips"
          style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
        >
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              className={`trm-chip ${filterStatus === tab.value ? "active" : ""}`}
              onClick={() => setFilterStatus(tab.value)}
            >
              {tab.label}
            </button>
          ))}
          <button
            className={`trm-chip ${["REJECTED", "CANCELLED"].includes(filterStatus) ? "active" : ""}`}
            onClick={() => setFilterStatus("REJECTED")}
          >
            Bị hủy / Từ chối
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div
        className="trm-table-wrap"
        style={{ position: "relative", minHeight: "350px" }}
      >
        {tableLoading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 10,
              background: "rgba(255, 255, 255, 0.55)",
              backdropFilter: "blur(2px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "12px",
            }}
          >
            <div className="trm-loading-rings">
              <div />
              <div />
              <div />
            </div>
            <div className="trm-loading-text">Đang tải dữ liệu...</div>
          </div>
        )}

        <div
          style={{
            opacity: tableLoading ? 0.3 : 1,
            pointerEvents: tableLoading ? "none" : "auto",
            transition: "opacity 0.25s",
          }}
        >
          {filteredReqs.length === 0 ? (
            <div
              className="trm-empty"
              style={{
                textAlign: "center",
                padding: "80px 20px",
                color: "#64748b",
              }}
            >
              Không có phiếu nào phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            <>
              <table className="trm-table">
                <thead>
                  <tr>
                    <th>Mã phiếu</th>
                    <th>Loại</th>
                    <th>Người mượn</th>
                    <th>Ngày mượn</th>
                    <th>Trạng thái</th>
                    <th style={{ textAlign: "right" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReqs.map((req) => (
                    <tr key={req.ticketId}>
                      <td>
                        <span className="trm-req-id">
                          {req.ticketId.substring(0, 8)}...
                        </span>
                      </td>
                      <td>
                        <span
                          className={`trm-type-badge ${req.ticketType === "ROOM_ONLY" ? "room" : "chemical"}`}
                        >
                          {req.ticketType === "ROOM_ONLY" ? (
                            <MeetingRoom sx={{ fontSize: 13 }} />
                          ) : (
                            <Science sx={{ fontSize: 13 }} />
                          )}
                          {req.ticketType === "ROOM_ONLY"
                            ? "PHÒNG"
                            : "HÓA CHẤT"}
                        </span>
                      </td>
                      <td>
                        <div className="trm-requester">
                          <Person sx={{ fontSize: 15, color: "#94a3b8" }} />
                          <span className="trm-item-name">
                            {req.requesterName || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="trm-date-row">
                          <CalendarToday sx={{ fontSize: 13 }} />
                          {new Date(req.borrowDate).toLocaleString("vi-VN")}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`trm-status-chip ${TICKET_STATUS_MAP[req.status]?.cls}`}
                        >
                          {TICKET_STATUS_MAP[req.status]?.label || req.status}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          className="trm-btn ghost"
                          onClick={() => handleOpenDetail(req)}
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "16px",
                    padding: "16px 0",
                    borderTop: "1px solid #f1f5f9",
                    background: "#fff",
                    marginTop: "10px",
                  }}
                >
                  <button
                    className="trm-btn ghost"
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                  >
                    Trang trước
                  </button>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#64748b",
                      fontWeight: 500,
                    }}
                  >
                    Trang {page + 1} / {totalPages}
                  </span>
                  <button
                    className="trm-btn ghost"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(page + 1)}
                  >
                    Trang sau
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
