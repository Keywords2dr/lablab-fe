// src/components/wiki/components/WikiFilters.jsx
import React from "react";
import "./WikiFilters.css";

export default function WikiFilters({ 
    filters, 
    formOptions = {}, 
    onFilterChange, 
    onReset 
}) {

  const { suppliers = [], units = [], packagings = [] } = formOptions;

  return (
    <div className="wiki-filters-card">
      <div className="wiki-filters-head">
        <span>Bộ lọc tìm kiếm</span>
        <button className="wiki-filters-reset" onClick={onReset}>
          Xóa tất cả
        </button>
      </div>

      <div className="wiki-filters-body">
        
        <div className="filter-group">
          <label>Nhà cung cấp</label>
          <select
            className="filter-select"
            value={filters.supplier || ""}
            onChange={(e) => onFilterChange({ supplier: e.target.value })}
          >
            <option value="">Tất cả nhà cung cấp</option>
            {suppliers.map((item, index) => (
              <option key={index} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Đơn vị tính</label>
          <select
            className="filter-select"
            value={filters.unit || ""}
            onChange={(e) => onFilterChange({ unit: e.target.value })}
          >
            <option value="">Tất cả đơn vị</option>
            {units.map((item, index) => (
              <option key={index} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Đóng gói</label>
          <select
            className="filter-select"
            value={filters.packaging || ""}
            onChange={(e) => onFilterChange({ packaging: e.target.value })}
          >
            <option value="">Tất cả loại đóng gói</option>
            {packagings.map((item, index) => (
              <option key={index} value={item}>{item}</option>
            ))}
          </select>
        </div>

        {/* Phần gợi ý / note */}
        <div className="filter-note">
          <small>Bạn có thể kết hợp nhiều bộ lọc cùng lúc</small>
        </div>

      </div>
    </div>
  );
}