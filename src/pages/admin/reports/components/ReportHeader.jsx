import React from 'react';

export default function ReportHeader({ setPage, fetchReports }) {
  return (
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
  );
}
