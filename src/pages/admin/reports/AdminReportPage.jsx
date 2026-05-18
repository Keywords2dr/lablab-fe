import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { reportApi } from '../../../api/reportApi';
import { roomApi } from '../../../api/roomApi';
import './AdminReportPage.css';

// ==================== CONFIG ====================
const REPORT_TYPE_LABELS = {
  ROOM: 'Phòng',
  CHEMICAL: 'Hóa chất',
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ==================== SKELETON ====================
function SkeletonRow() {
  return (
    <tr className="arp-skeleton-row">
      {Array(6).fill(0).map((_, i) => <td key={i}><div className="arp-skeleton-cell" /></td>)}
    </tr>
  );
}

// ==================== DETAIL MODAL ====================
function ReportDetailModal({ report, isOpen, onClose }) {
  if (!isOpen || !report) return null;

  return (
    <div className="arp-modal-overlay" onClick={onClose}>
      <div className="arp-modal" onClick={e => e.stopPropagation()}>
        <div className="arp-modal-header">
          <div>
            <h2>Chi tiết Báo cáo</h2>
            <p className="arp-modal-subid">
              Loại: <strong>{REPORT_TYPE_LABELS[report.reportType] || report.reportType}</strong>
            </p>
          </div>
          <button className="arp-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="arp-modal-body">
          {/* Meta info */}
          <div className="arp-modal-meta">
            {[
              { label: 'Người báo cáo', value: report.reporterName || '—' },
              { label: 'Loại báo cáo', value: <span className={`arp-type-badge ${report.reportType?.toLowerCase()}`}>{report.reportType === 'ROOM' ? 'Phòng' : 'Hóa chất'}</span> },
              { label: 'Phòng', value: report.roomName || '—' },
              ...(report.reportType === 'CHEMICAL' ? [{ label: 'Hóa chất', value: report.itemName || '—' }] : []),
              { label: 'Ngày tạo', value: formatDate(report.createdAt) },
            ].map(({ label, value }) => (
              <div key={label} className="arp-meta-cell">
                <span className="arp-meta-label">{label}</span>
                <span className="arp-meta-value">{value}</span>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <div className="arp-modal-section-title">Mô tả chi tiết</div>
            <p className="arp-modal-desc">{report.description}</p>
          </div>
        </div>

        <div className="arp-modal-footer">
          <button className="arp-btn-close" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN PAGE ====================
export default function AdminReportPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  // Filters
  const [filterType, setFilterType] = useState('');
  const [filterRoomId, setFilterRoomId] = useState('');

  // Rooms for filter dropdown
  const [rooms, setRooms] = useState([]);

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 10;

  // Fetch rooms for filter
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await roomApi.getRooms({ size: 100 });
        const data = res.data?.content || res.data || [];
        setRooms(Array.isArray(data) ? data : []);
      } catch {
        // silent
      }
    };
    fetchRooms();
  }, []);

  // Fetch reports
  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: PAGE_SIZE };
      if (filterType) params.reportType = filterType;
      if (filterRoomId) params.roomId = filterRoomId;
      const res = await reportApi.getAllReports(params);
      const data = res.data;
      setReports(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch {
      toast.error('Không thể tải danh sách báo cáo');
    } finally {
      setLoading(false);
    }
  }, [page, filterType, filterRoomId]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  // Stats (from current page data - approximation)
  const totalCount = totalElements;
  const roomCount = filterType === '' ? reports.filter(r => r.reportType === 'ROOM').length : (filterType === 'ROOM' ? reports.length : 0);
  const chemicalCount = filterType === '' ? reports.filter(r => r.reportType === 'CHEMICAL').length : (filterType === 'CHEMICAL' ? reports.length : 0);

  return (
    <div className="arp-page">
      {/* Header */}
      <div className="arp-header">
        <div className="arp-header-left">
          <div className="arp-header-icon">🚨</div>
          <div>
            <h1 className="arp-title">Quản lý Báo cáo Sự cố</h1>
            <p className="arp-subtitle">Xem xét các báo cáo sự cố từ người dùng</p>
          </div>
        </div>
        <div className="arp-header-right">
          <button className="arp-btn-refresh" onClick={() => { setPage(0); fetchReports(); }}>
            Làm mới
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="arp-stats-row">
        {[
          { label: 'Tổng báo cáo', value: totalCount, cls: 'orange' },
          { label: 'Báo cáo phòng', value: roomCount, cls: 'blue' },
          { label: 'Báo cáo hóa chất', value: chemicalCount, cls: 'purple' },
        ].map(({ label, value, cls }) => (
          <div key={label} className={`arp-stat-card ${cls}`}>
            <div>
              <div className="arp-stat-value">{value}</div>
              <div className="arp-stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="arp-filter-card">
        <div className="arp-filter-label">Bộ lọc</div>
        <div className="arp-filter-grid">
          <div className="arp-filter-item">
            <label>Loại báo cáo</label>
            <div className="arp-select-wrap">
              <select
                className="arp-select"
                value={filterType}
                onChange={e => { setFilterType(e.target.value); setPage(0); }}
              >
                <option value="">Tất cả</option>
                <option value="ROOM">Phòng</option>
                <option value="CHEMICAL">Hóa chất</option>
              </select>
            </div>
          </div>
          <div className="arp-filter-item">
            <label>Phòng</label>
            <div className="arp-select-wrap">
              <select
                className="arp-select"
                value={filterRoomId}
                onChange={e => { setFilterRoomId(e.target.value); setPage(0); }}
              >
                <option value="">Tất cả</option>
                {rooms.map(r => (
                  <option key={r.roomId} value={r.roomId}>{r.roomName}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="arp-table-card">
        <div className="arp-table-scroll">
          <table className="arp-table">
            <thead>
              <tr>
                <th>Loại</th>
                <th>Người báo cáo</th>
                <th>Phòng</th>
                <th>Hóa chất</th>
                <th>Mô tả</th>
                <th>Thời gian</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(6).fill(0).map((_, i) => <SkeletonRow key={i} />)
              ) : reports.length === 0 ? (
                <tr><td colSpan="7"><div className="arp-empty"><div className="arp-empty-icon" /><span>Không tìm thấy báo cáo nào</span></div></td></tr>
              ) : reports.map(r => (
                <tr key={r.reportId} className="arp-row" onClick={() => setSelected(r)}>
                  <td>
                    <span className={`arp-type-badge ${r.reportType?.toLowerCase()}`}>
                      {r.reportType === 'ROOM' ? 'Phòng' : 'Hóa chất'}
                    </span>
                  </td>
                  <td>
                    <div className="arp-user">
                      <div className="arp-avatar">{(r.reporterName || '?')[0].toUpperCase()}</div>
                      <span>{r.reporterName || '—'}</span>
                    </div>
                  </td>
                  <td>{r.roomName || '—'}</td>
                  <td>{r.itemName || <span style={{ color: '#cbd5e1' }}>—</span>}</td>
                  <td>
                    <div className="arp-desc-cell" title={r.description}>
                      {r.description?.length > 60 ? r.description.slice(0, 60) + '…' : r.description}
                    </div>
                  </td>
                  <td style={{ color: '#64748b', fontSize: 12.5, whiteSpace: 'nowrap' }}>{formatDate(r.createdAt)}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className="arp-action-btns">
                      <button className="arp-action-btn view" title="Xem chi tiết" onClick={() => setSelected(r)}>Xem</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="arp-pagination">
          <span className="arp-page-info">
            Hiển thị {reports.length} / {totalElements} báo cáo
          </span>
          {totalPages > 1 && (
            <div className="arp-page-buttons">
              <button className="arp-page-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>‹</button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum;
                if (totalPages <= 7) {
                  pageNum = i;
                } else if (page < 4) {
                  pageNum = i;
                } else if (page > totalPages - 5) {
                  pageNum = totalPages - 7 + i;
                } else {
                  pageNum = page - 3 + i;
                }
                return (
                  <button
                    key={pageNum}
                    className={`arp-page-btn ${page === pageNum ? 'active' : ''}`}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
              <button className="arp-page-btn" disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)}>›</button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <ReportDetailModal
        report={selected}
        isOpen={!!selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
