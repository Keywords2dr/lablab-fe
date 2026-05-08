// src/pages/wiki/ChemicalWiki.jsx
import React, { useState } from "react";
import { Search, Science, FilterList } from "@mui/icons-material";

import { useChemicalsWiki } from "../../components/wiki/hooks/useChemicalsWiki";
import ChemicalCard from "../../components/wiki/components/ChemicalCard";
import ChemicalDetailModal from "../../components/wiki/components/ChemicalDetailModal";
import WikiFilters from "../../components/wiki/components/WikiFilters";
import Pagination from "../../components/wiki/components/Pagination";

import "./ChemicalWiki.css";

export default function ChemicalWiki() {
  const {
    chemicals = [],
    loading,
    totalElements = 0,
    totalPages = 0,
    currentPage = 0,
    filters = {},
    formOptions = {},
    applyFilters,
    resetFilters,
    goToPage,
  } = useChemicalsWiki();

  const [selectedChemical, setSelectedChemical] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  const handleViewDetail = (chemical) => {
    setSelectedChemical(chemical);
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedChemical(null);
  };

  return (
    <div className="wiki-page">
      {/* Header */}
      <div className="wiki-header">
        <div className="wiki-header-content">
          <div className="wiki-title">
            <Science className="wiki-icon" />
            <div>
              <h1>Wiki Hóa Chất</h1>
              <p>Thư viện kiến thức hóa chất - Phòng thí nghiệm</p>
            </div>
          </div>

          <div className="wiki-search-container">
            <div className="search-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Tìm kiếm tên hóa chất, mã item, CAS number..."
                value={filters.keyword || ""}
                onChange={(e) => applyFilters({ keyword: e.target.value })}
                className="wiki-search-input"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="wiki-content">
        <button
          className="filter-toggle-btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FilterList /> {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
        </button>

        <div className="wiki-main-layout">
          {showFilters && (
            <div className="wiki-sidebar">
              <WikiFilters
                filters={filters}
                formOptions={formOptions}
                onFilterChange={applyFilters}
                onReset={resetFilters}
              />
            </div>
          )}

          <div className="wiki-results">
            <div className="results-header">
              <p className="results-count">
                Tìm thấy <strong>{totalElements.toLocaleString()}</strong> hóa chất
              </p>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Đang tải dữ liệu...</p>
              </div>
            ) : chemicals.length === 0 ? (
              <div className="empty-state">
                <Science sx={{ fontSize: 60, color: "#cbd5e1" }} />
                <h3>Không tìm thấy kết quả</h3>
                <p>Hãy thử thay đổi từ khóa hoặc bộ lọc</p>
              </div>
            ) : (
              <>
                <div className="chemical-grid">
                  {chemicals.map((chemical) => (
                    <ChemicalCard
                      key={chemical.id || chemical.itemCode}
                      chemical={chemical}
                      onViewDetail={handleViewDetail}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={goToPage}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <ChemicalDetailModal
        open={detailOpen}
        chemical={selectedChemical}
        onClose={handleCloseDetail}
      />
    </div>
  );
}