import { useState } from "react";
import "./WikiFilters.css";

// ── Sub-component: một section có thể thu gọn ─────────────────────────────
function FilterSection({ icon, title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="wf-section">
      <button className="wf-section-toggle" onClick={() => setOpen(!open)}>
        <span className="wf-section-icon">{icon}</span>
        <span className="wf-section-title">{title}</span>
        <svg
          className={`wf-chevron ${open ? "wf-chevron-open" : ""}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" width="14" height="14"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <div className="wf-section-body">{children}</div>}
    </div>
  );
}

// ── Sub-component: một nhóm radio options ─────────────────────────────────
function RadioGroup({ name, options, selected, onChange }) {
  return (
    <div className="wf-options">
      <label className={`wf-option ${!selected ? "wf-option-active" : ""}`}>
        <input
          type="radio" name={name} value=""
          checked={!selected}
          onChange={() => onChange({ [name]: "" })}
        />
        <span>Tất cả</span>
      </label>
      {options.map((item, i) => (
        <label
          key={i}
          className={`wf-option ${selected === item ? "wf-option-active" : ""}`}
        >
          <input
            type="radio" name={name} value={item}
            checked={selected === item}
            onChange={() => onChange({ [name]: item })}
          />
          <span>{item}</span>
        </label>
      ))}
    </div>
  );
}

// ── Component chính ────────────────────────────────────────────────────────
export default function WikiFilters({ filters, formOptions = {}, onFilterChange, onReset }) {
  const { suppliers = [], units = [], packagings = [] } = formOptions;

  const activeCount = [filters.supplier, filters.unit, filters.packaging]
    .filter(Boolean).length;

  return (
    <div className="wf-card">
      {/* Header */}
      <div className="wf-header">
        <div className="wf-header-left">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <span>Bộ lọc</span>
          {activeCount > 0 && <span className="wf-active-badge">{activeCount}</span>}
        </div>
        <button className="wf-reset-btn" onClick={onReset} disabled={activeCount === 0}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12">
            <path d="M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 01-9 9 9.75 9.75 0 01-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
          </svg>
          Đặt lại
        </button>
      </div>

      {/* Active filter tags */}
      {activeCount > 0 && (
        <div className="wf-active-tags">
          {filters.supplier && (
            <span className="wf-tag">
              {filters.supplier}
              <button onClick={() => onFilterChange({ supplier: "" })}>×</button>
            </span>
          )}
          {filters.unit && (
            <span className="wf-tag">
              {filters.unit}
              <button onClick={() => onFilterChange({ unit: "" })}>×</button>
            </span>
          )}
          {filters.packaging && (
            <span className="wf-tag">
              {filters.packaging}
              <button onClick={() => onFilterChange({ packaging: "" })}>×</button>
            </span>
          )}
        </div>
      )}

      {/* Filter sections */}
      <div className="wf-body">
        <FilterSection
          title="Nhà cung cấp"
          defaultOpen={true}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          }
        >
          <RadioGroup name="supplier" options={suppliers} selected={filters.supplier} onChange={onFilterChange} />
        </FilterSection>

        <FilterSection
          title="Đơn vị tính"
          defaultOpen={false}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          }
        >
          <RadioGroup name="unit" options={units} selected={filters.unit} onChange={onFilterChange} />
        </FilterSection>

        <FilterSection
          title="Đóng gói"
          defaultOpen={false}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
          }
        >
          <RadioGroup name="packaging" options={packagings} selected={filters.packaging} onChange={onFilterChange} />
        </FilterSection>
      </div>
    </div>
  );
}
