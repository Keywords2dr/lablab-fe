import React from "react";
import "./ChemicalCard.css";

const CATEGORY_COLORS = {
  "Axit": { bg: "#fee2e2", color: "#b91c1c" },
  "Bazơ": { bg: "#dbeafe", color: "#1d4ed8" },
  "Muối": { bg: "#d1fae5", color: "#065f46" },
  "Hữu cơ": { bg: "#fef3c7", color: "#92400e" },
  "Dung môi": { bg: "#ede9fe", color: "#6d28d9" },
  "Kim loại": { bg: "#e0f2fe", color: "#0369a1" },
};

const getCategoryStyle = (cat = "") => {
  const key = Object.keys(CATEGORY_COLORS).find(k => cat.includes(k));
  return CATEGORY_COLORS[key] || { bg: "#f1f5f9", color: "#475569" };
};

export default function ChemicalCard({ chemical, onViewDetail }) {
  if (!chemical) return null;
  const catStyle = getCategoryStyle(chemical.category || "");

  return (
    <div className="cc-card" onClick={() => onViewDetail(chemical)}>
      {/* ── Header ── */}
      <div className="cc-header">
        <div className="cc-header-bg" />
        <div className="cc-header-top">
          <span className="cc-item-code">#{chemical.itemCode || "N/A"}</span>
          <div className="cc-molecule">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
              <circle cx="12" cy="12" r="3" />
              <circle cx="4" cy="6" r="1.5" />
              <circle cx="20" cy="6" r="1.5" />
              <circle cx="4" cy="18" r="1.5" />
              <circle cx="20" cy="18" r="1.5" />
              <line x1="9.5" y1="10.7" x2="5.5" y2="7.3" />
              <line x1="14.5" y1="10.7" x2="18.5" y2="7.3" />
              <line x1="9.5" y1="13.3" x2="5.5" y2="16.7" />
              <line x1="14.5" y1="13.3" x2="18.5" y2="16.7" />
            </svg>
          </div>
        </div>
        <h3 className="cc-name">{chemical.name}</h3>
        {chemical.casNumber && (
          <span className="cc-cas">CAS {chemical.casNumber}</span>
        )}
      </div>

      {/* ── Body ── */}
      <div className="cc-body">
        {chemical.category && (
          <span
            className="cc-category-badge"
            style={{ background: catStyle.bg, color: catStyle.color }}
          >
            {chemical.category}
          </span>
        )}

        <div className="cc-info-list">
          {chemical.supplier && (
            <div className="cc-info-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span className="cc-info-label">Nhà cung cấp</span>
              <span className="cc-info-val">{chemical.supplier}</span>
            </div>
          )}
          {chemical.unit && (
            <div className="cc-info-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              <span className="cc-info-label">Đơn vị</span>
              <span className="cc-info-val">{chemical.unit}</span>
            </div>
          )}
          {chemical.packaging && (
            <div className="cc-info-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
              <span className="cc-info-label">Đóng gói</span>
              <span className="cc-info-val">{chemical.packaging}</span>
            </div>
          )}
        </div>

        {chemical.description && (
          <p className="cc-desc">
            {chemical.description.length > 100
              ? chemical.description.slice(0, 97) + "..."
              : chemical.description}
          </p>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="cc-footer">
        <button
          className="cc-btn-detail"
          onClick={(e) => { e.stopPropagation(); onViewDetail(chemical); }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Xem chi tiết
        </button>
      </div>
    </div>
  );
}