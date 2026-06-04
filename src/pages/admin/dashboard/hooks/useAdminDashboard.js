import { useState, useEffect, useMemo } from "react";
import { rentTicketApi } from "../../../../api/rentTicketApi";
import { roomApi } from "../../../../api/roomApi";
import { userApi } from "../../../../api/userApi";
import { chemicalApi } from "../../../../api/chemicalApi";
import { dashboardApi } from "../../../../api/dashboardApi";

export function useAdminDashboard() {
  const [stats, setStats] = useState({
    pendingCount: 0,
    activeRooms: 0,
    totalUsers: 0,
    lowStockCount: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState([]);
  const [weeklyLoading, setWeeklyLoading] = useState(true);
  const [roomUsage, setRoomUsage] = useState([]);
  const [roomUsageLoading, setRoomUsageLoading] = useState(true);
  const [feedItems, setFeedItems] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      setStatsLoading(true);
      setTicketsLoading(true);
      setWeeklyLoading(true);
      setRoomUsageLoading(true);
      setFeedLoading(true);

      const [
        pendingRes,
        roomsRes,
        usersRes,
        inventoryRes,
        weeklyRes,
        roomUsageRes,
        feedRes,
      ] = await Promise.allSettled([
        rentTicketApi.getAdminPending(),
        roomApi.getRooms({ status: "active", size: 1 }),
        userApi.getUsers({ size: 1 }),
        chemicalApi.getInventoryGlobal(),
        dashboardApi.getWeeklyStats(),
        dashboardApi.getRoomCurrentUsage(),
        dashboardApi.getActivityFeed(8),
      ]);

      if (cancelled) return;

      // 1. Phiếu chờ duyệt
      let pendingList = [];
      if (pendingRes.status === "fulfilled") {
        const d = pendingRes.value?.data;
        pendingList = Array.isArray(d)
          ? d
          : Array.isArray(d?.content)
            ? d.content
            : [];
      }
      setTickets(pendingList);
      setTicketsLoading(false);

      // 2. Stats cards
      let activeRooms = 0;
      if (roomsRes.status === "fulfilled") {
        const d = roomsRes.value?.data;
        activeRooms = d?.totalElements ?? d?.data?.totalElements ?? 0;
      }

      let totalUsers = 0;
      if (usersRes.status === "fulfilled") {
        const d = usersRes.value?.data;
        totalUsers = d?.totalElements ?? d?.data?.totalElements ?? 0;
      }

      let lowStockCount = 0;
      if (inventoryRes.status === "fulfilled") {
        const inv = inventoryRes.value?.data;
        const items = Array.isArray(inv) ? inv : Object.values(inv ?? {});
        lowStockCount = items.filter(
          (item) => (item?.grandTotal ?? 1) === 0,
        ).length;
      }

      setStats({
        pendingCount: pendingList.length,
        activeRooms,
        totalUsers,
        lowStockCount,
      });
      setStatsLoading(false);

      // 3. Biểu đồ 7 ngày
      setWeeklyData(
        weeklyRes.status === "fulfilled" ? (weeklyRes.value?.data ?? []) : [],
      );
      setWeeklyLoading(false);

      // 4. Trạng thái phòng
      setRoomUsage(
        roomUsageRes.status === "fulfilled"
          ? (roomUsageRes.value?.data ?? [])
          : [],
      );
      setRoomUsageLoading(false);

      // 5. Activity feed
      setFeedItems(
        feedRes.status === "fulfilled" ? (feedRes.value?.data ?? []) : [],
      );
      setFeedLoading(false);
    }

    fetchAll();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const maxWeekly = useMemo(
    () =>
      weeklyData.length > 0
        ? Math.max(
            ...weeklyData.map((d) => d.approved + d.rejected + d.pending),
            1,
          )
        : 1,
    [weeklyData],
  );

  return {
    stats,
    statsLoading,
    tickets,
    ticketsLoading,
    weeklyData,
    weeklyLoading,
    maxWeekly,
    roomUsage,
    roomUsageLoading,
    feedItems,
    feedLoading,
    refresh,
  };
}
