import { MODULE_LABELS } from "../constants/auditLogConstants";

export default function AuditLogFilters({
  modules,
  searchInput,
  filters,
  setSearchInput,
  handleFilterChange,
}) {
  return (
    <div className="al-filter-card">
      <div className="al-filter-label">Bộ lọc &amp; Tìm kiếm</div>
      <div className="al-filter-grid">
        {/* Search */}
        <div className="al-filter-item">
          <label>Tìm kiếm nhanh</label>
          <div className="al-search-box" style={{ position: "relative" }}>
            <input
              type="text"
              className="al-input"
              placeholder="Tìm tên người dùng, hành động..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  fontSize: "18px",
                  cursor: "pointer",
                  color: "#6b7280",
                }}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Module filter */}
        <div className="al-filter-item">
          <label>Phân hệ</label>
          <div className="al-select-wrap">
            <select
              value={filters.module}
              onChange={(e) => handleFilterChange("module", e.target.value)}
            >
              <option value="">Tất cả</option>
              {modules.map((mod, i) => (
                <option key={i} value={mod}>
                  {MODULE_LABELS[mod] || mod}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Role filter */}
        <div className="al-filter-item">
          <label>Vai trò</label>
          <div className="al-select-wrap">
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange("role", e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="ADMIN">Quản trị viên</option>
              <option value="TEACHER">Giảng viên</option>
              <option value="STUDENT">Sinh viên</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
