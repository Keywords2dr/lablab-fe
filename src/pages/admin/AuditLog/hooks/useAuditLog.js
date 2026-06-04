import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../../api/axiosInstance";

export function useAuditLog() {
  const [logs, setLogs]             = useState([]);
  const [modules, setModules]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [searchInput, setSearchInput] = useState("");

  const [filters, setFilters] = useState({
    role:    "",
    module:  "",
    sortBy:  "createdAt",
    sortDir: "desc",
  });

  // ── Fetch danh sách modules ────────────────────────────────────────────
  const fetchModules = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/audit-logs/modules");
      setModules(res.data);
    } catch {
      toast.error("Không thể lấy danh sách modules");
    }
  }, []);

  // ── Fetch logs (toàn bộ, filter client-side) ──────────────────────────
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/audit-logs", {
        params: {
          page:    0,
          size:    500,
          sortBy:  filters.sortBy,
          sortDir: filters.sortDir,
        },
      });
      setLogs(res.data.content || []);
    } catch (err) {
      console.error("Fetch audit logs error:", err);
      toast.error("Lỗi khi tải nhật ký hệ thống");
    } finally {
      setLoading(false);
    }
  }, [filters.sortBy, filters.sortDir]);

  useEffect(() => { fetchModules(); }, [fetchModules]);
  useEffect(() => { fetchLogs();   }, [fetchLogs]);

  // ── Filter client-side ────────────────────────────────────────────────
  const filteredLogs = useMemo(() => {
    let result = logs;

    if (searchInput.trim()) {
      const kw = searchInput.toLowerCase().trim();
      result = result.filter(
        (log) =>
          log.actorUsername?.toLowerCase().includes(kw) ||
          log.action?.toLowerCase().includes(kw) ||
          log.entityName?.toLowerCase().includes(kw)
      );
    }

    if (filters.role)   result = result.filter((log) => log.actorRole   === filters.role);
    if (filters.module) result = result.filter((log) => log.entityName  === filters.module);

    return result;
  }, [logs, searchInput, filters.role, filters.module]);

  const handleFilterChange = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  return {
    logs,
    modules,
    loading,
    selectedLog,
    searchInput,
    filters,
    filteredLogs,
    setSelectedLog,
    setSearchInput,
    handleFilterChange,
  };
}
