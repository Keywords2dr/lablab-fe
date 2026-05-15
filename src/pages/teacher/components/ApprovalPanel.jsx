import React from "react";
import {
  Search,
  MeetingRoom,
  Science,
  Person,
  CalendarToday,
  CheckCircle,
  Cancel,
  PlayArrow,
  TaskAlt,
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
  setDetailItem,
  handleApprove,
  setRejectTarget,
  handleActivate,
  handleConfirmReturn,
  page,
  setPage,
  totalPages,
  tableLoading,
}) {
  return (
    <div className="trm-panel">
      {/* ── BỘ LỌC & TÌM KIẾM ── */}
      <div
        className="trm-filter-bar"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div className="trm-search-box" style={{ maxWidth: "400px" }}>
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

      {/* ── BẢNG DANH SÁCH PHIẾU CÓ HIỆU ỨNG MỜ KHI ĐANG LOAD ── */}
      <div
        className="trm-table-wrap"
        style={{
          // Khi tableLoading = true, làm mờ bảng đi 50% và chặn click chuột
          opacity: tableLoading ? 0.5 : 1,
          pointerEvents: tableLoading ? "none" : "auto",
          transition: "opacity 0.2s ease-in-out",
        }}
      >
        {filteredReqs.length === 0 ? (
          <div
            className="trm-empty"
            style={{ textAlign: "center", padding: "40px", color: "#64748b" }}
          >
            {tableLoading
              ? "Đang tải dữ liệu..."
              : "Không có phiếu nào phù hợp với bộ lọc hiện tại."}
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
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredReqs.map((req) => (
                  <tr key={req.ticketId}>
                    <td>
                      <span className="trm-req-id" title={req.ticketId}>
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
                        {req.ticketType === "ROOM_ONLY" ? "PHÒNG" : "HÓA CHẤT"}
                      </span>
                    </td>
                    <td>
                      <div className="trm-requester">
                        <Person sx={{ fontSize: 15, color: "#94a3b8" }} />
                        <div>
                          <span className="trm-item-name">
                            {req.requesterName || "N/A"}
                          </span>
                        </div>
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
                    <td>
                      <div className="trm-action-btns">
                        <button
                          className="trm-btn ghost"
                          onClick={() => setDetailItem(req)}
                        >
                          Chi tiết
                        </button>
                        {req.status === "PENDING_OWNER" && (
                          <>
                            <button
                              className="trm-btn primary"
                              onClick={() => handleApprove(req.ticketId)}
                            >
                              <CheckCircle sx={{ fontSize: 14 }} /> Duyệt
                            </button>
                            <button
                              className="trm-btn danger"
                              onClick={() => setRejectTarget(req)}
                            >
                              <Cancel sx={{ fontSize: 14 }} /> Từ chối
                            </button>
                          </>
                        )}
                        {req.status === "APPROVED" && (
                          <button
                            className="trm-btn primary"
                            onClick={() => handleActivate(req.ticketId)}
                          >
                            <PlayArrow sx={{ fontSize: 14 }} /> Bàn giao đồ
                          </button>
                        )}
                        {req.status === "PENDING_RETURN" && (
                          <button
                            className="trm-btn primary"
                            onClick={() => handleConfirmReturn(req.ticketId)}
                          >
                            <TaskAlt sx={{ fontSize: 14 }} /> Xác nhận trả
                          </button>
                        )}
                      </div>
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
                }}
              >
                <button
                  className="trm-btn ghost"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  style={{
                    opacity: page === 0 ? 0.5 : 1,
                    cursor: page === 0 ? "not-allowed" : "pointer",
                  }}
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
                  style={{
                    opacity: page >= totalPages - 1 ? 0.5 : 1,
                    cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
                  }}
                >
                  Trang sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
