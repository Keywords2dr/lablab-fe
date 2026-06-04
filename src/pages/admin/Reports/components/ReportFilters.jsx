import React from 'react';

export default function ReportFilters({
  filterType, setFilterType,
  filterRoomId, setFilterRoomId,
  rooms, setPage
}) {
  return (
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
  );
}
