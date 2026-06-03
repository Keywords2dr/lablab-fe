import React from "react";
import { OpenInNew } from "@mui/icons-material";
import {
  TICKET_STATUS,
  TICKET_TYPE,
  ROLE_LABEL,
  AVATAR_COLORS,
} from "./ticketConstants";

/* ── Skeleton ─────────────────────────────────────────────────── */
function SkeletonRows({ cols = 7 }) {
  return Array(5)
    .fill(0)
    .map((_, i) => (
      <tr key={i} className="tk-skeleton-row">
        {Array(cols)
          .fill(0)
          .map((__, j) => (
            <td key={j}>
              <span
                className="tk-skeleton tk-skeleton-line"
                style={{
                  width: j === 0 ? 32 : j === 1 ? 180 : 100,
                  display: "block",
                }}
              />
            </td>
          ))}
      </tr>
    ));
}

export default function TicketTable({
  data,
  loading,
  page,
  size,
  total,
  totalPages,
  colsExtra,
  extraHeaders,
  onNavigate,
  onPageChange,
  emptyIcon,
}) {
  const maxBtn = 5;
  let start = Math.max(0, page - 2);
  let end = Math.min(totalPages - 1, start + maxBtn - 1);
  if (end - start < maxBtn - 1) start = Math.max(0, end - maxBtn + 1);
  const pageButtons = [];
  for (let i = start; i <= end; i++) pageButtons.push(i);

  return (
    <div className="tk-table-card">
      {/* Header */}
      <div className="tk-table-card-header">
        <span className="tk-table-card-title">{emptyIcon} Danh sách phiếu</span>
        <span className="tk-table-card-count">
          Tổng <strong>{total}</strong> phiếu
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table className="tk-table">
          <thead>
            <tr>
              <th style={{ width: 44 }}>#</th>
              <th>Người yêu cầu</th>
              <th>Phòng Lab</th>
              <th>Loại phiếu</th>
              <th>Trạng thái</th>
              {extraHeaders}
              <th style={{ textAlign: "center" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonRows
                cols={
                  5 +
                  (extraHeaders ? React.Children.count(extraHeaders) : 0) +
                  1
                }
              />
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    6 + (extraHeaders ? React.Children.count(extraHeaders) : 0)
                  }
                >
                  <div className="tk-empty">
                    <span className="tk-empty-icon">{emptyIcon}</span>
                    <p className="tk-empty-text">
                      Không tìm thấy phiếu mượn nào.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((t, idx) => {
                const sts = TICKET_STATUS[t.status] || {
                  label: t.status,
                  color: "slate",
                };
                const type = TICKET_TYPE[t.ticketType] || {
                  label: t.ticketType,
                  color: "slate",
                };
                return (
                  <tr key={t.ticketId} onClick={() => onNavigate(t.ticketId)}>
                    <td>
                      <span className="tk-index">{page * size + idx + 1}</span>
                    </td>
                    <td>
                      <div className="tk-requester">
                        <div
                          className="tk-avatar"
                          style={{
                            background:
                              AVATAR_COLORS[idx % AVATAR_COLORS.length],
                          }}
                        >
                          {(t.requesterName || "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="tk-name">
                            {t.requesterName || "—"}
                          </div>
                          <span className="tk-role-badge">
                            {ROLE_LABEL[t.requesterRole] ||
                              t.requesterRole ||
                              ""}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      {t.roomName ? (
                        <span className="tk-room-chip">{t.roomName}</span>
                      ) : (
                        <span style={{ color: "#94a3b8" }}>—</span>
                      )}
                    </td>
                    <td>
                      <span className={`tk-badge tk-badge-${type.color}`}>
                        {type.label}
                      </span>
                    </td>
                    <td>
                      <span className={`tk-badge tk-badge-${sts.color}`}>
                        {sts.label}
                      </span>
                    </td>
                    {typeof colsExtra === "function" ? colsExtra(t) : null}
                    <td
                      style={{ textAlign: "center" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="tk-btn-detail"
                        onClick={() => onNavigate(t.ticketId)}
                      >
                        <OpenInNew sx={{ fontSize: 13 }} /> Chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && total > 0 && (
        <div className="tk-pagination">
          <span className="tk-pagination-info">
            Hiển thị {page * size + 1}–{Math.min((page + 1) * size, total)}{" "}
            trong <strong>{total}</strong> phiếu
          </span>
          <div className="tk-pagination-controls">
            <button
              className="tk-page-btn"
              disabled={page === 0}
              onClick={() => onPageChange(page - 1)}
            >
              ‹
            </button>
            {pageButtons.map((p) => (
              <button
                key={p}
                className={`tk-page-btn ${p === page ? "active" : ""}`}
                onClick={() => onPageChange(p)}
              >
                {p + 1}
              </button>
            ))}
            <button
              className="tk-page-btn"
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange(page + 1)}
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
