import React, { useEffect } from "react";
import "./ChemicalDetailModal.css";

const SUPPLIER_FLAGS = {
  "Japan":       "🇯🇵",
  "China":       "🇨🇳",
  "Germany":     "🇩🇪",
  "India":       "🇮🇳",
  "Idia":        "🇮🇳",
  "Switzerland": "🇨🇭",
  "USA":         "🇺🇸",
  "UK":          "🇬🇧",
  "France":      "🇫🇷",
  "Korea":       "🇰🇷",
  "Netherlands": "🇳🇱",
  "Singapore":   "🇸🇬",
  "Australia":   "🇦🇺",
};

function supplierFlag(name) {
  if (!name) return "🏢";
  const direct = SUPPLIER_FLAGS[name];
  if (direct) return direct;
  const flags = name.split(/[\/,&]/).map(s => SUPPLIER_FLAGS[s.trim()]).filter(Boolean);
  return flags.length ? flags.join("") : "🏢";
}

const InfoRow = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="cdm-info-row">
      <span className="cdm-info-icon">{icon}</span>
      <div className="cdm-info-content">
        <span className="cdm-info-label">{label}</span>
        <span className="cdm-info-value">{value}</span>
      </div>
    </div>
  );
};

export default function ChemicalDetailModal({ open, chemical, onClose }) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Prevent body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!chemical) return null;

  const hasSafety = chemical.safetyInfo;
  const hasDescription = chemical.description;

  return (
    <div
      className={`cdm-backdrop ${open ? "cdm-open" : ""}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className={`cdm-panel ${open ? "cdm-panel-open" : ""}`}>

        {/* ── Header ── */}
        <div className="cdm-header">
          <div className="cdm-header-bg" />
          <div className="cdm-header-content">
            <div className="cdm-molecule-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="28" height="28">
                <circle cx="12" cy="12" r="3" />
                <circle cx="4" cy="6" r="2" />
                <circle cx="20" cy="6" r="2" />
                <circle cx="4" cy="18" r="2" />
                <circle cx="20" cy="18" r="2" />
                <line x1="9" y1="10.5" x2="6" y2="7.5" />
                <line x1="15" y1="10.5" x2="18" y2="7.5" />
                <line x1="9" y1="13.5" x2="6" y2="16.5" />
                <line x1="15" y1="13.5" x2="18" y2="16.5" />
              </svg>
            </div>
            <div className="cdm-header-text">
              <h2 className="cdm-chemical-name">{chemical.name}</h2>
              <div className="cdm-header-badges">
                {chemical.itemCode && (
                  <span className="cdm-badge cdm-badge-code">#{chemical.itemCode}</span>
                )}
                {chemical.formula && (
                  <span className="cdm-badge cdm-badge-formula">{chemical.formula}</span>
                )}
                {chemical.casNumber && (
                  <span className="cdm-badge cdm-badge-cas">CAS {chemical.casNumber}</span>
                )}
                {chemical.category && (
                  <span className="cdm-badge cdm-badge-cat">{chemical.category}</span>
                )}
              </div>
            </div>
          </div>
          <button className="cdm-close-btn" onClick={onClose} aria-label="Đóng">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="cdm-body">

          {/* Info section */}
          <div className="cdm-section">
            <p className="cdm-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Thông tin cơ bản
            </p>
            <div className="cdm-info-grid">
              <InfoRow
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><circle cx="12" cy="12" r="10"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/></svg>}
                label="Công thức"
                value={chemical.formula}
              />
              <InfoRow
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>}
                label="Đơn vị tính"
                value={chemical.unit}
              />
              <InfoRow
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>}
                label="Đóng gói"
                value={chemical.packaging}
              />
              <InfoRow
                icon={<span className="cdm-flag-icon">{supplierFlag(chemical.supplier)}</span>}
                label="Nhà cung cấp"
                value={chemical.supplier}
              />
              <InfoRow
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}
                label="Phân loại"
                value={chemical.category}
              />
            </div>
          </div>

          {/* Description */}
          {hasDescription && (
            <div className="cdm-section">
              <p className="cdm-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                  <line x1="17" y1="10" x2="3" y2="10" />
                  <line x1="21" y1="6" x2="3" y2="6" />
                  <line x1="21" y1="14" x2="3" y2="14" />
                  <line x1="17" y1="18" x2="3" y2="18" />
                </svg>
                Mô tả
              </p>
              <p className="cdm-description">{chemical.description}</p>
            </div>
          )}

          {/* Safety Info */}
          {hasSafety && (
            <div className="cdm-section cdm-safety-section">
              <p className="cdm-section-title cdm-safety-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Thông tin an toàn
              </p>
              <div className="cdm-safety-box">
                <p>{chemical.safetyInfo}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="cdm-footer">
          <button className="cdm-btn-close" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}