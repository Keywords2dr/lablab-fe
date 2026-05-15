import React from "react";
import { Person, AccessTime } from "@mui/icons-material";
import { getTimelineProgress, TIMELINE_STEPS } from "../hooks/useTickets";
import "../styles/ticketTimeline.css";

/**
 * Full vertical timeline showing ticket progress
 */
export default function TicketStatusTimeline({ ticket }) {
  const { currentIndex, isFailed } = getTimelineProgress(ticket.status);

  return (
    <div>
      {/* ─── Progress Timeline ─────────────────────── */}
      <div className="tl-timeline">
        {TIMELINE_STEPS.map((step, i) => {
          let cls = "future";
          if (isFailed) {
            if (i < currentIndex) cls = "done";
            else if (i === currentIndex) cls = "failed";
          } else {
            if (i < currentIndex) cls = "done";
            else if (i === currentIndex) cls = "current";
          }

          // Find matching history entry
          const historyEntry = ticket.history?.find((h) => {
            const actionLower = h.action.toLowerCase();
            if (step.key === "CREATED") return actionLower.includes("tạo");
            if (step.key === "PENDING_OWNER")
              return actionLower.includes("tạo");
            if (step.key === "PENDING_ADMIN")
              return actionLower.includes("quản lý phòng đã duyệt");
            if (step.key === "APPROVED")
              return actionLower.includes("admin đã duyệt");
            if (step.key === "BORROWED")
              return actionLower.includes("bàn giao");
            if (step.key === "PENDING_RETURN")
              return actionLower.includes("yêu cầu trả");
            if (step.key === "RETURNED")
              return actionLower.includes("xác nhận hoàn trả");
            return false;
          });

          return (
            <div key={step.key} className={`tl-step ${cls}`}>
              <div className="tl-dot" />
              <div className="tl-content">
                <div className="tl-label">{step.label}</div>
                {historyEntry && cls !== "future" && (
                  <div className="tl-detail">
                    <Person sx={{ fontSize: 13 }} />
                    {historyEntry.by}
                  </div>
                )}
                {historyEntry && cls !== "future" && (
                  <div className="tl-time">
                    {new Date(historyEntry.time).toLocaleString("vi-VN")}
                  </div>
                )}
                {isFailed &&
                  i === currentIndex &&
                  ticket.status === "REJECTED" && (
                    <div
                      className="tl-detail"
                      style={{ color: "#ef4444", fontWeight: 600 }}
                    >
                      Phiếu bị từ chối
                    </div>
                  )}
                {isFailed &&
                  i === currentIndex &&
                  ticket.status === "CANCELLED" && (
                    <div
                      className="tl-detail"
                      style={{ color: "#ef4444", fontWeight: 600 }}
                    >
                      Phiếu đã bị hủy
                    </div>
                  )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Activity History ──────────────────────── */}
      {ticket.history && ticket.history.length > 0 && (
        <div>
          <div className="tdm-section-title">
            <AccessTime /> Lịch sử hoạt động
          </div>
          <div className="tl-history">
            {[...ticket.history].reverse().map((entry, i) => (
              <div key={i} className="tl-history-item">
                <div className="tl-history-dot" />
                <div className="tl-history-action">{entry.action}</div>
                <div className="tl-history-meta">
                  <span>{entry.by}</span>
                  <span>•</span>
                  <span>{new Date(entry.time).toLocaleString("vi-VN")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
