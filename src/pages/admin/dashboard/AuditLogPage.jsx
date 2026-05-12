import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../../../api/axiosInstance';
import './AuditLogPage.css';

// ==================== COLOR CONFIG ====================
const ACTION_COLORS = {
  CREATE: { bg: '#dcfce7', color: '#15803d' },
  UPDATE: { bg: '#dbeafe', color: '#1d4ed8' },
  DELETE: { bg: '#fee2e2', color: '#b91c1c' },
  LOGIN: { bg: '#fef9c3', color: '#a16207' },
  LOGOUT: { bg: '#f3e8ff', color: '#7e22ce' },
  VIEW: { bg: '#e0f2fe', color: '#0369a1' },
  REVOKE: { bg: '#fee2e2', color: '#b91c1c' },
};

const getActionStyle = (action = '') => {
  const key = Object.keys(ACTION_COLORS).find(k => action.toUpperCase().includes(k));
  return ACTION_COLORS[key] || { bg: '#f1f5f9', color: '#475569' };
};

const ROLE_COLORS = {
  ADMIN: { bg: '#fee2e2', color: '#b91c1c' },
  TEACHER: { bg: '#dcfce7', color: '#15803d' },
  STUDENT: { bg: '#dbeafe', color: '#1d4ed8' },
  MANAGER: { bg: '#fef9c3', color: '#a16207' },
  STAFF: { bg: '#e0f2fe', color: '#0369a1' },
};

const getRoleStyle = (role = '') => {
  const key = Object.keys(ROLE_COLORS).find(k => role.toUpperCase().includes(k));
  return ROLE_COLORS[key] || { bg: '#f1f5f9', color: '#475569' };
};

// ==================== KEY TRANSLATIONS ====================
const KEY_TRANSLATIONS = {
  ITEMNAME: 'Tên Công thức',
  NAME: 'Tên Công thức',
  ITEMCODE: 'Mã Công thức',
  CODE: 'Mã Công thức',
  QUANTITY: 'Số lượng',
  TOTALQUANTITY: 'Số lượng',
  PACKAGECOUNT: 'Đóng gói',
  PACKAGING: 'Đóng gói',
  ROOMNAME: 'Tên Phòng',
};

// ==================== HELPER FUNCTIONS ====================
function SkeletonRow() {
  return (
    <tr className="al-skeleton-row">
      {Array(5).fill(0).map((_, i) => (
        <td key={i}><div className="al-skeleton-cell" /></td>
      ))}
    </tr>
  );
}

function parseSafe(jsonString) {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString);
  } catch {
    return jsonString;
  }
}

// ==================== RENDER KV - ĐÃ TỐI ƯU ====================
function renderKV(data, entityName = '', depth = 0) {
  if (data === null || data === undefined) {
    return <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>—</span>;
  }
  if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
    return <span style={{ color: '#1e293b' }}>{String(data)}</span>;
  }

  if (Array.isArray(data)) {
    if (depth === 0) {
      return (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#4338ca', marginBottom: 12 }}>
            📋 Danh sách items ({data.length})
          </div>
          {data.map((item, i) => (
            <div key={i} style={{ marginBottom: i < data.length - 1 ? 20 : 0 }}>
              {renderKV(item, entityName, depth + 1)}
              {i < data.length - 1 && <hr style={{ border: 'none', borderTop: '1px dashed #cbd5e1', margin: '16px 0' }} />}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {data.map((item, i) => (
          <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', marginBottom: 8 }}>MỤC {i + 1}</div>
            {renderKV(item, entityName, depth + 1)}
          </div>
        ))}
      </div>
    );
  }

  if (typeof data === 'object' && data !== null) {
    let entries = Object.entries(data);

    entries = entries.filter(([key]) => {
      const lower = key.toLowerCase();
      if ((lower === 'itemid' || lower === 'itemId') && 
          entityName?.toLowerCase().includes('inventory')) return false;
      if (['userid', 'userId', 'roomid'].some(k => lower === k)) return false;
      return true;
    });

    const priorityOrder = ['itemName', 'name', 'itemCode', 'code', 'quantity', 'totalQuantity', 'packageCount', 'packaging', 'roomName'];

    entries.sort((a, b) => {
      const ia = priorityOrder.findIndex(p => a[0].toLowerCase().includes(p.toLowerCase()));
      const ib = priorityOrder.findIndex(p => b[0].toLowerCase().includes(p.toLowerCase()));
      if (ia === -1 && ib === -1) return 0;
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });

    if (entries.length === 1 && entries[0][0].toLowerCase() === 'items') {
      return renderKV(entries[0][1], entityName, depth);
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {entries.map(([key, val]) => {
          const lowerKey = key.toLowerCase();
          let displayKey = KEY_TRANSLATIONS[key] || KEY_TRANSLATIONS[key.toUpperCase()] || key;
          let displayValue = val;

          if (['itemname', 'name'].some(k => lowerKey.includes(k))) displayKey = 'Tên Công thức';
          if (['itemcode', 'code'].some(k => lowerKey.includes(k))) displayKey = 'Mã Công thức';
          if (['quantity', 'totalquantity'].some(k => lowerKey.includes(k))) {
            displayKey = 'Số lượng';
            displayValue = (val === 0 || val === null) ? 1 : val;
          }
          if (['packagecount', 'packaging'].some(k => lowerKey.includes(k))) displayKey = 'Đóng gói';
          if (lowerKey.includes('roomname')) displayKey = 'Tên Phòng';

          return (
            <div key={key} style={{
              display: 'grid',
              gridTemplateColumns: '170px 1fr',
              gap: 16,
              padding: '11px 0',
              borderBottom: '1px solid #f1f5f9',
              alignItems: 'flex-start'
            }}>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: '#475569' }}>
                {displayKey}
              </span>
              <div style={{ fontSize: 14.5, color: '#1e293b', wordBreak: 'break-all' }}>
                {renderKV(displayValue, entityName, depth + 1)}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return <span>{String(data)}</span>;
}

function renderJsonData(data, isOld, entityName = '') {
  if (data === null || data === undefined) {
    return <p style={{ fontSize: 14, color: '#94a3b8', fontStyle: 'italic' }}>{isOld ? 'Không có dữ liệu cũ' : 'Không có dữ liệu mới'}</p>;
  }
  return <div style={{ width: '100%' }}>{renderKV(data, entityName)}</div>;
}

// ==================== MODAL ====================
function AuditLogModal({ log, isOpen, onClose }) {
  if (!isOpen || !log) return null;

  const oldObj = parseSafe(log.oldData);
  const newObj = parseSafe(log.newData);
  const actionStyle = getActionStyle(log.action);

  return (
    <div className="al-modal-overlay" onClick={onClose}>
      <div className="al-modal-content" onClick={e => e.stopPropagation()}>
        <div className="al-modal-header">
          <div className="al-modal-header-left">
            <h2>Chi tiết nhật ký hệ thống</h2>
            {log.logId && <p className="al-modal-subid">ID: <span className="al-mono">{log.logId}</span></p>}
          </div>
          <button className="al-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="al-modal-body">
          <div className="al-meta-strip">
            {[
              { label: 'Thời gian', value: log.createdAt ? new Date(log.createdAt).toLocaleString('vi-VN') : '—' },
              { label: 'Người thực hiện', value: log.actorUsername || '—' },
              { label: 'Hành động', value: <span className="al-badge" style={{ background: actionStyle.bg, color: actionStyle.color }}>{log.action}</span> },
              { label: 'Entity', value: <span className="al-badge" style={{ background: '#ede9fe', color: '#6d28d9' }}>{log.entityName || '—'}</span> },
              { label: 'Vai trò', value: <span className="al-badge" style={{ background: getRoleStyle(log.actorRole).bg, color: getRoleStyle(log.actorRole).color }}>{log.actorRole || '—'}</span> },
            ].map(({ label, value }) => (
              <div key={label} className="al-meta-cell">
                <span className="al-meta-label">{label}</span>
                <span className="al-meta-value">{value}</span>
              </div>
            ))}
          </div>
          <div className="al-diff-grid">
            <div className="al-diff-panel">
              <div className="al-diff-panel-header al-diff-old">
                <span className="al-diff-icon">−</span><span>Dữ liệu cũ</span>
              </div>
              <div className="al-diff-body">{renderJsonData(oldObj, true, log.entityName)}</div>
            </div>
            <div className="al-diff-panel">
              <div className="al-diff-panel-header al-diff-new">
                <span className="al-diff-icon">+</span><span>Dữ liệu mới</span>
              </div>
              <div className="al-diff-body">{renderJsonData(newObj, false, log.entityName)}</div>
            </div>
          </div>
        </div>
        <div className="al-modal-footer">
          <button className="al-btn-close" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================
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
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchModules(); }, [fetchModules]);
  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value, page: 0 }));
  const handlePageChange = (newPage) => setFilters(prev => ({ ...prev, page: newPage }));
  const openDetail = (log) => setSelectedLog(log);
  const closeModal = () => setSelectedLog(null);

  const formatDate = (dateString) => {
    if (!dateString) return { date: '—', time: '' };
    const d = new Date(dateString);
    return {
      date: d.toLocaleDateString('vi-VN'),
      time: d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
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
                <option value="">Tất cả</option>
                {modules.map((mod, i) => <option key={i} value={mod}>{mod}</option>)}
              </select>
            </div>
          </div>
          <div className="al-filter-item">
            <label>Vai trò</label>
            <div className="al-select-wrap">
              <select value={filters.role} onChange={e => handleFilterChange('role', e.target.value)}>
                <option value="">Tất cả</option>
                <option value="ADMIN">ADMIN</option>
                <option value="TEACHER">TEACHER</option>
                <option value="STUDENT">STUDENT</option>
                <option value="MANAGER">MANAGER</option>
                <option value="STAFF">STAFF</option>
              </select>
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

      {/* Table - ĐÃ BỎ CỘT DỮ LIỆU MỚI */}
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
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(filters.size > 8 ? 8 : filters.size).fill(0).map((_, i) => <SkeletonRow key={i} />)
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="al-empty">
                      <p>Không tìm thấy dữ liệu phù hợp</p>
                    </div>
                  </td>
                </tr>
              ) : logs.map((log) => {
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
                        <div className="al-avatar">{(log.actorUsername || '?')[0]?.toUpperCase() || '?'}</div>
                        <span>{log.actorUsername || '—'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="al-badge" style={{ background: actionStyle.bg, color: actionStyle.color }}>
                        {log.action}
                      </span>
                    </td>
                    <td><span className="al-module-tag">{log.entityName || '—'}</span></td>
                    <td>
                      <span className="al-badge" style={{ background: getRoleStyle(log.actorRole).bg, color: getRoleStyle(log.actorRole).color }}>
                        {log.actorRole || '—'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="al-pagination">
          <span className="al-page-info">
            {pagination.totalElements === 0 ? 'Không có dữ liệu' : `Hiển thị ${from}–${to} / ${pagination.totalElements.toLocaleString()} bản ghi`}
          </span>
          <div className="al-page-buttons">
            <button className="al-page-btn" onClick={() => handlePageChange(0)} disabled={filters.page === 0}>«</button>
            <button className="al-page-btn" onClick={() => handlePageChange(filters.page - 1)} disabled={filters.page === 0}>‹</button>
            {pageNumbers().map(p => (
              <button key={p} className={`al-page-btn ${p === filters.page ? 'active' : ''}`} onClick={() => handlePageChange(p)}>
                {p + 1}
              </button>
            ))}
            <button className="al-page-btn" onClick={() => handlePageChange(filters.page + 1)} disabled={filters.page >= pagination.totalPages - 1}>›</button>
            <button className="al-page-btn" onClick={() => handlePageChange(pagination.totalPages - 1)} disabled={filters.page >= pagination.totalPages - 1}>»</button>
          </div>
        </div>
      </div>

      <AuditLogModal log={selectedLog} isOpen={!!selectedLog} onClose={closeModal} />
    </div>
  );
} 