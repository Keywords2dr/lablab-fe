import { useState, useCallback } from "react";
import { roomApi } from "../../../../api/roomApi";

export function useRoomManagers() {
  const [managers, setManagers] = useState({});
  const [assignableTeachers, setAssignable] = useState({});
  const [loading, setLoading] = useState({});

  const fetchManagers = useCallback(async (roomId) => {
    setLoading((prev) => ({ ...prev, [roomId]: true }));
    try {
      const res = await roomApi.getRoomStaff(roomId);
      setManagers((prev) => ({ ...prev, [roomId]: res.data ?? [] }));
    } catch (err) {
      console.error("[useRoomManagers] fetchManagers failed:", err);
      setManagers((prev) => ({ ...prev, [roomId]: [] }));
    } finally {
      setLoading((prev) => ({ ...prev, [roomId]: false }));
    }
  }, []);

  const fetchAssignableTeachers = useCallback(async (roomId, keyword = "") => {
    try {
      const res = await roomApi.getAssignableTeachers(roomId, keyword);
      const list = res.data ?? [];
      setAssignable((prev) => ({
        ...prev,
        [roomId]: Array.isArray(list) ? list : [],
      }));
    } catch (err) {
      console.error("[useRoomManagers] fetchAssignableTeachers failed:", err);
      setAssignable((prev) => ({ ...prev, [roomId]: [] }));
    }
  }, []);

  const assign = useCallback(
    async (roomId, userId) => {
      await roomApi.assignStaff(roomId, userId);
      await fetchManagers(roomId);
      await fetchAssignableTeachers(roomId);
    },
    [fetchManagers, fetchAssignableTeachers],
  );

  const remove = useCallback(
    async (roomId, userId) => {
      await roomApi.removeStaff(roomId, userId);
      setManagers((prev) => ({
        ...prev,
        [roomId]: (prev[roomId] ?? []).filter((m) => m.userId !== userId),
      }));
      await fetchAssignableTeachers(roomId);
    },
    [fetchAssignableTeachers],
  );

  const getManagerCount = (roomId) => (managers[roomId] ?? []).length;

  return {
    managers,
    assignableTeachers,
    loading,
    fetchManagers,
    fetchAssignableTeachers,
    assign,
    remove,
    getManagerCount,
  };
}
