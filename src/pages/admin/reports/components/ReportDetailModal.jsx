import React from 'react';
import { REPORT_TYPE_LABELS } from '../constants/reportConstants';
import { formatDate } from '../utils/reportHelpers';

export default function ReportDetailModal({ report, isOpen, onClose }) {
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
