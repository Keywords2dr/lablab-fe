import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { roomApi } from "../../../../api/roomApi";

const normalizeRoom = (room = {}) => ({
  roomId: room.roomId ?? room.id ?? "",
  roomName: room.roomName ?? "",
  description: room.description ?? "",
  isActive: room.isActive ?? room.status === "ACTIVE",
  status: room.status ?? (room.isActive ? "ACTIVE" : "INACTIVE"),
});

export function useRooms({ pageSize = 100 } = {}) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ keyword: "", status: "" });
  const [pagination, setPagination] = useState({
    page: 0,
    size: pageSize,
    totalElements: 0,
    totalPages: 0,
  });

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    roomsWithoutStaff: 0,
    totalActiveTeachers: 0,
  });

  const abortRef = useRef(null);
  const abortStatsRef = useRef(null);
  const sizeRef = useRef(pageSize);
  useEffect(() => {
    sizeRef.current = pageSize;
  }, [pageSize]);

  const fetchStats = useCallback(async () => {
    if (abortStatsRef.current) abortStatsRef.current.abort();
    abortStatsRef.current = new AbortController();
    try {
      // Gọi song song: stats API + đếm active + đếm inactive
      const [statsRes, activeRes, inactiveRes] = await Promise.all([
        roomApi.getRoomStats().catch(() => null),
        roomApi.getRooms({ status: "active", page: 0, size: 1 }),
        roomApi.getRooms({ status: "inactive", page: 0, size: 1 }),
      ]);

      const d = statsRes?.data ?? {};
      const activeTotal = activeRes?.data?.totalElements ?? 0;
      const inactiveTotal = inactiveRes?.data?.totalElements ?? 0;

      setStats({
        total: activeTotal + inactiveTotal,
        active: activeTotal,
        inactive: inactiveTotal,
        roomsWithoutStaff: d.roomsWithoutStaff ?? 0,
        totalActiveTeachers: d.totalActiveTeachers ?? 0,
      });
    } catch (err) {
      if (err.name !== "CanceledError" && err.name !== "AbortError") {
        console.error("[useRooms] fetchStats failed:", err);
      }
    }
  }, []);

  const fetchRooms = useCallback(async (currentFilters, page = 0) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    try {
      const res = await roomApi.getRooms(
        { ...currentFilters, page, size: sizeRef.current },
        abortRef.current.signal,
      );
      const data = res.data?.content ?? res.data ?? [];
      setRooms(Array.isArray(data) ? data.map(normalizeRoom) : []);
      setPagination((prev) => ({
        ...prev,
        page: res.data?.number ?? page,
        totalElements: res.data?.totalElements ?? 0,
        totalPages: res.data?.totalPages ?? 0,
      }));
    } catch (err) {
      if (err.name !== "CanceledError" && err.name !== "AbortError") {
        console.error("[useRooms] fetchRooms failed:", err);
        setRooms([]);
        toast.error("Không thể tải danh sách phòng. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const isMounted = useRef(false);
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      fetchStats();
    }
    fetchRooms(filters, 0);
  }, [filters, fetchRooms, fetchStats]);

  const applyFilters = useCallback((patch) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPagination((prev) => ({ ...prev, page: 0 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ keyword: "", status: "" });
  }, []);

  const reload = useCallback(() => {
    fetchRooms(filters, pagination.page);
    fetchStats();
  }, [filters, pagination.page, fetchRooms, fetchStats]);

  const goToPage = useCallback(
    (page) => fetchRooms(filters, page),
    [filters, fetchRooms],
  );

  const createRoom = useCallback(
    async (data) => {
      const res = await roomApi.createRoom(data);
      await Promise.all([fetchRooms(filters, pagination.page), fetchStats()]);
      return res.data;
    },
    [filters, pagination.page, fetchRooms, fetchStats],
  );

  const updateRoom = useCallback(
    async (id, data) => {
      const res = await roomApi.updateRoom(id, data);
      await Promise.all([fetchRooms(filters, pagination.page), fetchStats()]);
      return res.data;
    },
    [filters, pagination.page, fetchRooms, fetchStats],
  );

  const deactivateRoom = useCallback(
    async (id) => {
      await roomApi.deactivateRoom(id);
      await Promise.all([fetchRooms(filters, pagination.page), fetchStats()]);
    },
    [filters, pagination.page, fetchRooms, fetchStats],
  );

  const activateRoom = useCallback(
    async (id) => {
      await roomApi.activateRoom(id);
      await Promise.all([fetchRooms(filters, pagination.page), fetchStats()]);
    },
    [filters, pagination.page, fetchRooms, fetchStats],
  );

  return {
    rooms,
    loading,
    filters,
    stats,
    pagination,
    applyFilters,
    resetFilters,
    reload,
    goToPage,
    createRoom,
    updateRoom,
    deactivateRoom,
    activateRoom,
  };
}
