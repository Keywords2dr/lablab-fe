import React from 'react';
import { formatDate } from '../utils/reportHelpers';

function SkeletonRow() {
  return (
    <tr className="arp-skeleton-row">
      {Array(6).fill(0).map((_, i) => <td key={i}><div className="arp-skeleton-cell" /></td>)}
    </tr>
  );
}

export default function ReportTable({
  reports,
  loading,
  setSelected,
  page,
  setPage,
  totalPages,
  totalElements
}) {
  return (
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
  );
}
