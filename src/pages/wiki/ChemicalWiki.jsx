import { useState } from "react";
import { Search, Science, FilterList } from "@mui/icons-material";

import { useChemicalsWiki } from "../../components/wiki/hooks/useChemicalsWiki";
import ChemicalCard from "../../components/wiki/ChemicalCard";
import ChemicalDetailModal from "../../components/wiki/ChemicalDetailModal";
import WikiFilters from "../../components/wiki/WikiFilters";
import Pagination from "../../components/wiki/Pagination";

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
          <div className="wiki-header-top-row">
            <div className="wiki-title">
              <div className="wiki-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
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
              <div>
                <h1>Wiki</h1>

              </div>
            </div>
          </div>

          <div className="wiki-search-container">
            <div className="search-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Tìm kiếm tên hóa chất"
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

        <p className="results-count" style={{ marginBottom: '14px' }}>
          Tìm thấy <strong>{totalElements.toLocaleString()}</strong> hóa chất
        </p>

        <div className="wiki-main-layout">
          {showFilters && (
            <div className="wiki-sidebar">
              <div className="wiki-sidebar-sticky">
                <WikiFilters
                  filters={filters}
                  formOptions={formOptions}
                  onFilterChange={applyFilters}
                  onReset={resetFilters}
                />
              </div>
            </div>
          )}

          <div className="wiki-results">

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