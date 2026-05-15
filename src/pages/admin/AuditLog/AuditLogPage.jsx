import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../../../api/axiosInstance';
import './AuditLogPage.css';

// ==================== CONFIG ====================
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

// ==================== ĐỊNH NGHĨA HIỂN THỊ THEO ENTITY ====================
const ENTITY_DISPLAY_CONFIG = {
  RENT_TICKET: {
    translations: {
      itemName: 'Tên vật tư/HC',
      itemCode: 'Mã số',
      quantity: 'Số lượng',
      status: 'Trạng thái phiếu',
      purposeType: 'Mục đích',
      lessonDetail: 'Chi tiết bài học',
      roomName: 'Phòng học mượn',
      borrowDate: 'Ngày mượn',
      expectedReturnDate: 'Ngày hẹn trả',
      itemUnit: 'Đơn vị',
      returnNote: 'Ghi chú trả lại',
      quantityBorrowed: 'Số lượng đã mượn',
      quantityReturned: 'Số lượng đã trả',
      returnStatus: 'Trạng thái',
      classCode: 'Mã lớp',
      subjectName: 'Tên chủ đề',
      ticketType: 'Loại phiếu',
      requesterName: 'Tên người yêu cầu',
      requesterRole: 'Vai trò người yêu cầu',
      rejectedByName: 'Bị từ chối bởi',
      rejectedReason: 'Lí do từ chối',
      adminApprovedAt: 'Quản trị viên phê duyệt lúc',
      ownerApprovedAt: 'Chủ sở hữu đã phê duyệt lúc',
      adminApprovedByName: 'Tên Quản trị viên đã phê duyệt',
      ownerApprovedByName: 'Tên chủ sở hữu đã phê duyệt',
      createdAt: 'Được tạo lúc',
    }
  },
  ROOM_STAFF: {
    translations: {
      fullName: 'Họ và Tên',
      username: 'Tên tài khoản',
      role: 'Vai trò đảm nhiệm',
      roomName: 'Phòng',           // ← ĐÃ THÊM
      roomCode: 'Mã phòng',        // ← ĐÃ THÊM
      assignedRoom: 'Phòng',
      room: 'Phòng'
    }
  },
  ROOM_INVENTORY: {
    translations: {
      itemName: 'Tên Hóa Chất',
      itemCode: 'Mã Hóa Chất',
      totalQuantity: 'Số lượng',
      packaging: 'Đóng gói',
      roomName: 'Phòng số',
    }
  },
  ROOM: {
    translations: {
      isActive: 'Trang thái hoạt động',
      roomName: 'Phòng số',
      staffCount: 'Số lượng nhân viên',
      description:'Mô tả',
    }
  },
  CHEMICAL: {
    translations: {
      name: 'Tên hóa chất',
      unit: 'Đơn vị',
      formula: 'Công thức hóa học',
      itemCode: 'Mã hóa chất',
      supplier: 'Nhà cung cấp',
      packaging: 'Đóng gói',
      amountPerPackage:'Số lượng mỗi gói',
    }
  },
  USER: {
    translations: {
      role: 'Vai trò',
      email: 'Email',
      major: 'Chuyên ngành',
      faculty: 'Khoa',
      fullName: 'Họ và tên',
      isActive: 'Tình trang tài khoản',
      username:'Tài khoản',
      department:'Bộ môn',
    }
  },
  DEFAULT: {
    translations: {
      name: 'Tên',
      code: 'Mã',
      description: 'Mô tả',
      roomName: 'Phòng',
    }
  }
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
  try { return typeof jsonString === 'object' ? jsonString : JSON.parse(jsonString); } 
  catch { return jsonString; }
}

const formatValue = (key, val) => {
  if (val === null || val === undefined || val === '' || val === 'null') return null;
  
  const isDateKey = /date|at$/i.test(key);
  const isIsoDate = typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val);

  if (isDateKey || isIsoDate) {
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      return d.toLocaleString('vi-VN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
    }
  }
  return String(val);
};

// ==================== RENDER KV ====================
function renderKV(data, entityName = '') {
  if (data === null || data === undefined) return null;
  
  if (typeof data !== 'object') {
    const val = formatValue('', data);
    return val ? <span className="al-kv-val">{val}</span> : null;
  }

  if (Array.isArray(data)) {
    const validItems = data.map(item => renderKV(item, entityName)).filter(Boolean);
    if (validItems.length === 0) return null;
    return (
      <div className="al-kv-arr">
        {data.map((item, i) => {
          const content = renderKV(item, entityName);
          if (!content) return null;
          return (
            <div key={i} className="al-kv-nested">
              <div className="al-kv-idx">Mục {i + 1}</div>
              {content}
            </div>
          );
        })}
      </div>
    );
  }

  const config = ENTITY_DISPLAY_CONFIG[entityName] || ENTITY_DISPLAY_CONFIG.DEFAULT;
  
  let entries = Object.entries(data).filter(([key, val]) => {
    const lower = key.toLowerCase();
    const blackList = [
      'userid', 'roomid', 'id', 'itemid', 'ticketid', 'detailid', 'requesterid',
      'rejectedat', 'rejectedbyid', 'adminapprovedbyid', 'ownerapprovedbyid',
      'actualreturndate'
    ];
    if (blackList.some(k => lower === k)) return false;

    const formatted = formatValue(key, val);
    return formatted !== null && formatted !== '—' && formatted !== '';
  });

  if (entries.length === 0) return null;

  return (
    <div className="al-kv-table">
      {entries.map(([key, val]) => {
        const displayKey = config.translations[key] || key;
        const displayValue = typeof val === 'object' && val !== null 
          ? renderKV(val, entityName) 
          : formatValue(key, val);

        if (!displayValue) return null;

        return (
          <div key={key} className="al-kv-row">
            <span className="al-kv-key">{displayKey}</span>
            <div className="al-kv-val">{displayValue}</div>
          </div>
        );
      })}
    </div>
  );
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
              <div className="al-diff-body">
                {renderKV(oldObj, log.entityName) || <p className="al-diff-empty">Không có dữ liệu cũ</p>}
              </div>
            </div>
            <div className="al-diff-panel">
              <div className="al-diff-panel-header al-diff-new">
                <span className="al-diff-icon">+</span><span>Dữ liệu mới</span>
              </div>
              <div className="al-diff-body">
                {renderKV(newObj, log.entityName) || <p className="al-diff-empty">Không có dữ liệu mới</p>}
              </div>
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
  
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({
    role: '', 
    module: '', 
    search: '', 
    page: 0, 
    size: 10, 
    sortBy: 'createdAt', 
    sortDir: 'desc',
  });

  const [pagination, setPagination] = useState({
    totalPages: 0, currentPage: 0, totalElements: 0,
  });

  const fetchModules = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/audit-logs/modules');
      setModules(res.data);
    } catch { toast.error('Không thể lấy danh sách modules'); }
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/audit-logs', {
        params: {
          page: 0,
          size: 500,
          sortBy: filters.sortBy,
          sortDir: filters.sortDir,
        }
      });

      setLogs(response.data.content || []);
      setPagination({
        totalPages: 1,
        currentPage: 0,
        totalElements: response.data.content?.length || 0,
      });
    } catch (err) { 
      console.error("Fetch Error:", err);
      toast.error('Lỗi khi tải nhật ký hệ thống'); 
    } finally { 
      setLoading(false); 
    }
  }, [filters.sortBy, filters.sortDir]);

  const filteredLogs = useMemo(() => {
    let result = logs;

    if (searchInput.trim()) {
      const keyword = searchInput.toLowerCase().trim();
      result = result.filter(log =>
        (log.actorUsername && log.actorUsername.toLowerCase().includes(keyword)) ||
        (log.action && log.action.toLowerCase().includes(keyword)) ||
        (log.entityName && log.entityName.toLowerCase().includes(keyword))
      );
    }

    if (filters.role) {
      result = result.filter(log => log.actorRole === filters.role);
    }

    if (filters.module) {
      result = result.filter(log => log.entityName === filters.module);
    }

    return result;
  }, [logs, searchInput, filters.role, filters.module]);

  useEffect(() => { fetchModules(); }, [fetchModules]);
  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const from = 1;
  const to = filteredLogs.length;

  return (
    <div className="al-page">
      <div className="al-header">
        <div className="al-header-left">
          <div className="al-header-icon">🛡️</div>
          <div>
            <h1 className="al-title">Nhật Ký Hệ Thống</h1>
            <p className="al-subtitle">Theo dõi toàn bộ hoạt động người dùng trong hệ thống</p>
          </div>
        </div>
      </div>

      <div className="al-filter-card">
        <div className="al-filter-label">Bộ lọc & Tìm kiếm</div>
        <div className="al-filter-grid">
          <div className="al-filter-item">
            <label>Tìm kiếm nhanh</label>
            <div className="al-search-box" style={{ position: 'relative' }}>
              <input 
                type="text" 
                className="al-input"
                placeholder="Tìm tên người dùng, hành động..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <button 
                  onClick={() => setSearchInput('')}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    fontSize: '18px',
                    cursor: 'pointer',
                    color: '#6b7280'
                  }}
                >
                  ×
                </button>
              )}
            </div>
          </div>

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
              </select>
            </div>
          </div>
        </div>
      </div>

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
                Array(10).fill(0).map((_, i) => <SkeletonRow key={i} />)
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan="5"><div className="al-empty">Không tìm thấy dữ liệu</div></td></tr>
              ) : filteredLogs.map((log) => {
                const actionStyle = getActionStyle(log.action);
                return (
                  <tr key={log.logId} className="al-row" onClick={() => setSelectedLog(log)}>
                    <td>
                      <div className="al-datetime">
                        <span className="al-date">{new Date(log.createdAt).toLocaleDateString('vi-VN')}</span>
                        <span className="al-time" style={{ marginLeft: '8px' }}>{new Date(log.createdAt).toLocaleTimeString('vi-VN')}</span>
                      </div>
                    </td>
                    <td>
                      <div className="al-user">
                        <div className="al-avatar">{(log.actorUsername || '?')[0].toUpperCase()}</div>
                        <span>{log.actorUsername || '—'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="al-badge" style={{ background: actionStyle.bg, color: actionStyle.color }}>{log.action}</span>
                    </td>
                    <td><span className="al-module-tag">{log.entityName}</span></td>
                    <td>
                      <span className="al-badge" style={{ background: getRoleStyle(log.actorRole).bg, color: getRoleStyle(log.actorRole).color }}>{log.actorRole}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="al-pagination">
          <span className="al-page-info">Hiển thị {filteredLogs.length} bản ghi</span>
        </div>
      </div>

      <AuditLogModal log={selectedLog} isOpen={!!selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  );
}