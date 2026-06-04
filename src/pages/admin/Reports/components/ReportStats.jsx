import React from 'react';

export default function ReportStats({ totalCount, roomCount, chemicalCount }) {
  const stats = [
    { label: 'Tổng báo cáo', value: totalCount, cls: 'orange' },
    { label: 'Báo cáo phòng', value: roomCount, cls: 'blue' },
    { label: 'Báo cáo hóa chất', value: chemicalCount, cls: 'purple' },
  ];

  return (
    <div className="arp-stats-row">
      {stats.map(({ label, value, cls }) => (
        <div key={label} className={`arp-stat-card ${cls}`}>
          <div>
            <div className="arp-stat-value">{value}</div>
            <div className="arp-stat-label">{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
