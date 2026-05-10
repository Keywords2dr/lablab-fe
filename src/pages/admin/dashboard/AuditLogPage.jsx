import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../../../api/axiosInstance';
import './AuditLogPage.css';

const ACTION_COLORS = {
  CREATE: { bg: '#dcfce7', color: '#15803d' },
  UPDATE: { bg: '#dbeafe', color: '#1d4ed8' },
  DELETE: { bg: '#fee2e2', color: '#b91c1c' },
  LOGIN: { bg: '#fef9c3', color: '#a16207' },
  LOGOUT: { bg: '#f3e8ff', color: '#7e22ce' },
  VIEW: { bg: '#e0f2fe', color: '#0369a1' },
};

const getActionStyle = (action = '') => {
  const key = Object.keys(ACTION_COLORS).find(k => action.toUpperCase().includes(k));
  return ACTION_COLORS[key] || { bg: '#f1f5f9', color: '#475569' };
};

function SkeletonRow() {
  return (
    <tr className="al-skeleton-row">
      {Array(7).fill(0).map((_, i) => (
        <td key={i}><div className="al-skeleton-cell" /></td>
      ))}
    </tr>
  );
}

function parseSafe(jsonString) {
  if (!jsonString) return null;
  try { return JSON.parse(jsonString); } catch { return null; }
}

function buildDiff(oldObj, newObj) {
  const allKeys = Array.from(new Set([
    ...Object.keys(oldObj || {}),
    ...Object.keys(newObj || {}),
  ]));
  return allKeys.map(key => {
    const oldVal = oldObj?.[key];
    const newVal = newObj?.[key];
    const changed = JSON.stringify(oldVal) !== JSON.stringify(newVal);
    return { key, oldVal, newVal, changed };
  });
}

function AuditLogModal({ log, isOpen, onClose }) {
  if (!isOpen || !log) return null;

  const oldObj = parseSafe(log.oldData);
  const newObj = parseSafe(log.newData);
  const hasDiff = oldObj || newObj;
  const diffRows = hasDiff ? buildDiff(oldObj, newObj) : [];
  const changedCount = diffRows.filter(r => r.changed).length;
  const actionStyle = getActionStyle(log.action);

  return (
    <div className="al-modal-overlay" onClick={onClose}>
      <div className="al-modal-content" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="al-modal-header">
          <div className="al-modal-header-left">
            <div className="al-modal-header-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <line x1="10" y1="9" x2="8" y2="9"/>
              </svg>
            </div>
            <div>
              <h2>Chi tiết nhật ký hệ thống</h2>
              {log.logId && (
                <p className="al-modal-subid">
                  ID &nbsp;<span className="al-mono">{log.logId}</span>
                </p>
              )}
            </div>
          </div>
          <button className="al-modal-close" onClick={onClose}>×</button>
        </div>

        {/* Body */}
        <div className="al-modal-body">

          {/* Meta strip */}
          <div className="al-meta-strip">
            {[
              { label: 'Thời gian', value: log.createdAt ? new Date(log.createdAt).toLocaleString('vi-VN') : '—' },
              { label: 'Người thực hiện', value: log.actorUsername || '—' },
              {
                label: 'Hành động',
                value: (
                  <span
                    className="al-badge"
                    style={{ background: actionStyle.bg, color: actionStyle.color }}
                  >
                    {log.action}
                  </span>
                ),
              },
              { label: 'Entity', value: log.entityName || '—' },
              { label: 'Vai trò', value: log.actorRole || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="al-meta-cell">
                <span className="al-meta-label">{label}</span>
                <span className="al-meta-value">{value}</span>
              </div>
            ))}
          </div>

          {/* Diff panels */}
          {hasDiff ? (
            <div className="al-diff-grid">
              {/* Old */}
              <div className="al-diff-panel">
                <div className="al-diff-panel-header al-diff-old">
                  <span className="al-diff-icon">−</span>
                  <span>Dữ liệu cũ</span>
                </div>
                <div className="al-diff-body">
                  {diffRows.map(({ key, oldVal, changed }) => (
                    <div key={key} className="al-diff-row">
                      <span className="al-diff-key">{key}</span>
                      <span className={`al-diff-val${changed ? ' al-diff-val--old' : ''}`}>
                        {oldVal === undefined ? '—' : String(oldVal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* New */}
              <div className="al-diff-panel">
                <div className="al-diff-panel-header al-diff-new">
                  <span className="al-diff-icon">+</span>
                  <span>Dữ liệu mới</span>
                </div>
                <div className="al-diff-body">
                  {diffRows.map(({ key, newVal, changed }) => (
                    <div key={key} className="al-diff-row">
                      <span className="al-diff-key">{key}</span>
                      <span className={`al-diff-val${changed ? ' al-diff-val--new' : ''}`}>
                        {newVal === undefined ? '—' : String(newVal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="al-diff-empty">Không có dữ liệu thay đổi</div>
          )}
        </div>

        {/* Footer */}
        <div className="al-modal-footer">
          <span className="al-modal-footer-meta">
            {changedCount > 0 ? `${changedCount} trường đã thay đổi` : 'Không có thay đổi'}
          </span>
          <button className="al-btn-secondary" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const [filters, setFilters] = useState({
    role: '',
    module: '',
    page: 0,
    size: 10,
    sortBy: 'createdAt',
    sortDir: 'desc',
  });

  const [pagination, setPagination] = useState({
    totalPages: 0,
    currentPage: 0,
    totalElements: 0,
  });

  const fetchModules = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/audit-logs/modules');
      setModules(res.data);
    } catch {
      toast.error('Không thể lấy danh sách modules');
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: filters.page.toString(),
        size: filters.size.toString(),
        sortBy: filters.sortBy,
        sortDir: filters.sortDir,
      });
      if (filters.role) params.append('role', filters.role);
      if (filters.module) params.append('module', filters.module);

      const res = await axiosInstance.get(`/audit-logs?${params}`);
      setLogs(res.data.content || []);
      setPagination({
        totalPages: res.data.totalPages || 0,
        currentPage: res.data.number || 0,
        totalElements: res.data.totalElements || 0,
      });
    } catch (err) {
      toast.error('Lỗi khi tải nhật ký hệ thống');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchModules(); }, [fetchModules]);
  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 0 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const openDetail = (log) => setSelectedLog(log);
  const closeModal = () => setSelectedLog(null);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const d = new Date(dateString);
    return {
      date: d.toLocaleDateString('vi-VN'),
      time: d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
  };

  const from = pagination.totalElements === 0 ? 0 : (pagination.currentPage * filters.size) + 1;
  const to = Math.min((pagination.currentPage + 1) * filters.size, pagination.totalElements);

  const pageNumbers = () => {
    const total = pagination.totalPages;
    const cur = filters.page;
    const pages = [];
    let start = Math.max(0, cur - 2);
    let end = Math.min(total - 1, cur + 2);
    if (end - start < 4) {
      if (start === 0) end = Math.min(4, total - 1);
      else start = Math.max(0, end - 4);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="al-page">
      {/* Header */}
      <div className="al-header">
        <div className="al-header-left">
          <div className="al-header-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div>
            <h1 className="al-title">Nhật Ký Hệ Thống</h1>
            <p className="al-subtitle">Theo dõi toàn bộ hoạt động người dùng trong hệ thống</p>
          </div>
        </div>
        <div className="al-stats-row">
          <div className="al-stat-pill">
            <span className="al-stat-dot green" />
            <span>{pagination.totalElements.toLocaleString()} bản ghi</span>
          </div>
          <button className="al-btn-reload" onClick={fetchLogs} disabled={loading}>
            <svg className={loading ? 'al-spin' : ''} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 01-9 9 9.75 9.75 0 01-6.74-2.74L3 16"/>
              <path d="M3 21v-5h5"/>
            </svg>
            {loading ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="al-filter-card">
        <div className="al-filter-label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          Bộ lọc
        </div>
        <div className="al-filter-grid">
          <div className="al-filter-item">
            <label>Module</label>
            <div className="al-select-wrap">
              <select value={filters.module} onChange={e => handleFilterChange('module', e.target.value)}>
                <option value="">Tất cả </option>
                {modules.map((mod, i) => <option key={i} value={mod}>{mod}</option>)}
              </select>
            </div>
          </div>
          <div className="al-filter-item">
            <label>Vai trò</label>
            <div className="al-input-wrap">
              <svg className="al-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Tìm theo role..."
                value={filters.role}
                onChange={e => handleFilterChange('role', e.target.value)}
              />
            </div>
          </div>
          <div className="al-filter-item">
            <label>Sắp xếp</label>
            <div className="al-select-wrap">
              <select value={filters.sortDir} onChange={e => handleFilterChange('sortDir', e.target.value)}>
                <option value="desc">Mới nhất trước</option>
                <option value="asc">Cũ nhất trước</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="al-table-card">
        <div className="al-table-scroll">
          <table className="al-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Người dùng</th>
                <th>Hành động</th>
                <th>Entity</th>
                <th>Vai trò</th>
                <th>Dữ liệu mới</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(filters.size > 8 ? 8 : filters.size).fill(0).map((_, i) => <SkeletonRow key={i} />)
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="al-empty">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                      <p>Không tìm thấy dữ liệu phù hợp</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const dt = formatDate(log.createdAt);
                  const actionStyle = getActionStyle(log.action);
                  return (
                    <tr key={log.logId} className="al-row" onClick={() => openDetail(log)} style={{ cursor: 'pointer' }}>
                      <td>
                        <div className="al-datetime">
                          <span className="al-date">{dt.date}</span>
                          <span className="al-time">{dt.time}</span>
                        </div>
                      </td>
                      <td>
                        <div className="al-user">
                          <div className="al-avatar">{(log.actorUsername || '?')[0].toUpperCase()}</div>
                          <span>{log.actorUsername || '—'}</span>
                        </div>
                      </td>
                      <td>
                        <span className="al-badge" style={{ background: actionStyle.bg, color: actionStyle.color }}>
                          {log.action}
                        </span>
                      </td>
                      <td><span className="al-module-tag">{log.entityName || '—'}</span></td>
                      <td><span className="al-role">{log.actorRole || '—'}</span></td>
                      <td className="al-desc" title={log.newData}>
                        {log.newData ? (() => {
                          try {
                            const obj = JSON.parse(log.newData);
                            const firstVal = Object.values(obj)[0];
                            return String(firstVal).slice(0, 60);
                          } catch { return log.newData.slice(0, 60); }
                        })() : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="al-pagination">
          <span className="al-page-info">
            {pagination.totalElements === 0
              ? 'Không có dữ liệu'
              : `Hiển thị ${from}–${to} / ${pagination.totalElements.toLocaleString()} bản ghi`}
          </span>
          <div className="al-page-buttons">
            <button className="al-page-btn" onClick={() => handlePageChange(0)} disabled={filters.page === 0} title="Trang đầu">«</button>
            <button className="al-page-btn" onClick={() => handlePageChange(filters.page - 1)} disabled={filters.page === 0} title="Trang trước">‹</button>
            {pageNumbers().map(p => (
              <button key={p} className={`al-page-btn ${p === filters.page ? 'active' : ''}`} onClick={() => handlePageChange(p)}>
                {p + 1}
              </button>
            ))}
            <button className="al-page-btn" onClick={() => handlePageChange(filters.page + 1)} disabled={filters.page >= pagination.totalPages - 1} title="Trang sau">›</button>
            <button className="al-page-btn" onClick={() => handlePageChange(pagination.totalPages - 1)} disabled={filters.page >= pagination.totalPages - 1} title="Trang cuối">»</button>
          </div>
        </div>
      </div>

      <AuditLogModal log={selectedLog} isOpen={!!selectedLog} onClose={closeModal} />
    </div>
  );
}

