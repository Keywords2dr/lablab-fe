import React from 'react';
import { useReports } from './hooks/useReports';
import ReportHeader from './components/ReportHeader';
import ReportStats from './components/ReportStats';
import ReportFilters from './components/ReportFilters';
import ReportTable from './components/ReportTable';
import ReportDetailModal from './components/ReportDetailModal';

import './styles/index.css';

export default function AdminReportPage() {
  const {
    reports,
    loading,
    selected,
    setSelected,
    filterType,
    setFilterType,
    filterRoomId,
    setFilterRoomId,
    rooms,
    page,
    setPage,
    totalPages,
    totalElements,
    fetchReports,
    totalCount,
    roomCount,
    chemicalCount,
  } = useReports();

  return (
    <div className="arp-page">
      <ReportHeader setPage={setPage} fetchReports={fetchReports} />

      <ReportStats
        totalCount={totalCount}
        roomCount={roomCount}
        chemicalCount={chemicalCount}
      />

      <ReportFilters
        filterType={filterType}
        setFilterType={setFilterType}
        filterRoomId={filterRoomId}
        setFilterRoomId={setFilterRoomId}
        rooms={rooms}
        setPage={setPage}
      />

      <ReportTable
        reports={reports}
        loading={loading}
        setSelected={setSelected}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        totalElements={totalElements}
      />

      <ReportDetailModal
        report={selected}
        isOpen={!!selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
