import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { notificationApi } from "../../../api/notificationApi";
import { getUserRole, timeAgo, getRedirectPath } from "../notifications/notificationUtils";

const PAGE_SIZE = 20;

export function useNotificationsPage() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [page, setPage]                   = useState(0);
  const [hasMore, setHasMore]             = useState(true);
  const [filter, setFilter]               = useState("all");

  // ── Load trang đầu tiên khi mount ─────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const loadFirst = async () => {
      setLoading(true);
      try {
        const res  = await notificationApi.getNotifications(0, PAGE_SIZE);
        const data = res.data;
        if (cancelled) return;

        const items = data?.content ?? (Array.isArray(data) ? data : []);
        setNotifications(items);
        setPage(1);
        setHasMore(items.length === PAGE_SIZE);
      } catch {
        // axiosInstance đã xử lý lỗi 401/403/500
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadFirst();
    return () => { cancelled = true; };
  }, []);

  const loadMore = useCallback(async () => {
    setLoading(true);
    try {
      const res   = await notificationApi.getNotifications(page, PAGE_SIZE);
      const data  = res.data;
      const items = data?.content ?? (Array.isArray(data) ? data : []);
      setNotifications((prev) => [...prev, ...items]);
      setPage((p) => p + 1);
      setHasMore(items.length === PAGE_SIZE);
    } catch {
      // axiosInstance đã xử lý lỗi
    } finally {
      setLoading(false);
    }
  }, [page]);

  // ── Đánh dấu tất cả đã đọc ────────────────────────────────────────────────
  const markAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // axiosInstance đã xử lý lỗi
    }
  };

  // ── Click vào 1 thông báo: đánh dấu đã đọc + điều hướng ──────────────────
  const handleNotiClick = async (n) => {
    if (!n.isRead) {
      try {
        await notificationApi.markAsRead(n.id);
        setNotifications((prev) =>
          prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
        );
      } catch {
        // axiosInstance đã xử lý lỗi
      }
    }
    navigate(getRedirectPath(n.type, getUserRole()));
  };

  // ── Filter view ───────────────────────────────────────────────────────────
  const filtered =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  return {
    filtered,
    loading,
    hasMore,
    filter,
    setFilter,
    loadMore,
    markAllRead,
    handleNotiClick,
    timeAgo,
  };
}
