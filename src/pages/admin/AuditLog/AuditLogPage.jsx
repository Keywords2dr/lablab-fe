import { useAuditLog } from "./hooks/useAuditLog";
import AuditLogHeader from "./components/AuditLogHeader";
import AuditLogFilters from "./components/AuditLogFilters";
import AuditLogTable from "./components/AuditLogTable";
import AuditLogModal from "./components/AuditLogModal";

import "./styles/index.css";

export default function AuditLogPage() {
  const {
    modules,
    loading,
    selectedLog,
    searchInput,
    filters,
    filteredLogs,
    setSelectedLog,
    setSearchInput,
    handleFilterChange,
  } = useAuditLog();

  return (
    <div className="al-page">
      <AuditLogHeader />

      <AuditLogFilters
        modules={modules}
        searchInput={searchInput}
        filters={filters}
        setSearchInput={setSearchInput}
        handleFilterChange={handleFilterChange}
      />

      <AuditLogTable
        loading={loading}
        filteredLogs={filteredLogs}
        setSelectedLog={setSelectedLog}
      />

      <AuditLogModal
        log={selectedLog}
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}
