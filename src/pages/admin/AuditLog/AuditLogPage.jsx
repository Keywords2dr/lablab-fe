import { MODULE_LABELS, getActionStyle, getRoleStyle } from "./auditLogConstants";
import { useAuditLog } from "./useAuditLog";
import AuditLogModal from "./AuditLogModal";
import "./AuditLogPage.css";

// ── Sub-component: skeleton row khi loading ────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="al-skeleton-row">
      {Array(5).fill(0).map((_, i) => (
        <td key={i}><div className="al-skeleton-cell" /></td>
      ))}
    </tr>
  );
}

// ── Component chính ────────────────────────────────────────────────────────
export default function AuditLogPage() {
  const {
    modules,
    loading,
    selectedLog,
    searchInput,
    filters,
    filteredLogs,
    setSelectedLog,
    setSearchInput,
    handleFilterChange,
  } = useAuditLog();

  return (
    <div className="al-page">
      {/* ── Header ── */}
      <div className="al-header">
        <div className="al-header-left">
          <div className="al-header-icon">🛡️</div>
          <div>
            <h1 className="al-title">Nhật Ký Hệ Thống</h1>
            <p className="al-subtitle">
              Theo dõi toàn bộ hoạt động người dùng trong hệ thống
            </p>
          </div>
        </div>
      </div>

      {/* ── Filter card ── */}
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
                    position: "absolute", right: "12px", top: "50%",
                    transform: "translateY(-50%)", background: "none",
                    border: "none", fontSize: "18px", cursor: "pointer",
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

      {/* ── Table ── */}
      <div className="al-table-card">
        <div className="al-table-scroll">
          <table className="al-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Người dùng</th>
                <th>Hành động</th>
                <th>Phân hệ</th>
                <th>Vai trò</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(10).fill(0).map((_, i) => <SkeletonRow key={i} />)
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="al-empty">Không tìm thấy dữ liệu</div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const actionStyle = getActionStyle(log.action);
                  const roleStyle   = getRoleStyle(log.actorRole);
                  return (
                    <tr
                      key={log.logId}
                      className="al-row"
                      onClick={() => setSelectedLog(log)}
                    >
                      <td>
                        <div className="al-datetime">
                          <span className="al-date">
                            {new Date(log.createdAt).toLocaleDateString("vi-VN")}
                          </span>
                          <span className="al-time" style={{ marginLeft: "8px" }}>
                            {new Date(log.createdAt).toLocaleTimeString("vi-VN")}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="al-user">
                          <div className="al-avatar">
                            {(log.actorUsername || "?")[0].toUpperCase()}
                          </div>
                          <span>{log.actorUsername || "—"}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className="al-badge"
                          style={{ background: actionStyle.bg, color: actionStyle.color }}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td>
                        <span className="al-module-tag">
                          {MODULE_LABELS[log.entityName] || log.entityName}
                        </span>
                      </td>
                      <td>
                        <span
                          className="al-badge"
                          style={{ background: roleStyle.bg, color: roleStyle.color }}
                        >
                          {log.actorRole}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="al-pagination">
          <span className="al-page-info">
            Hiển thị {filteredLogs.length} bản ghi
          </span>
        </div>
      </div>

      {/* ── Modal chi tiết ── */}
      <AuditLogModal
        log={selectedLog}
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}
