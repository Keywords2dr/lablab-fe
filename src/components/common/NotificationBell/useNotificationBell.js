import { useState, useEffect, useRef, useMemo } from "react";
import { notificationApi } from "../../../api/notificationApi";
import { getUserRole, timeAgo, getRedirectPath } from "../notifications/notificationUtils";

export function useNotificationBell({ onViewAll } = {}) {
  const [open, setOpen]                  = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [tab, setTab]                     = useState("all");
  const [ring, setRing]                   = useState(false);
  const [currentTime, setCurrentTime]     = useState(() => Date.now());

  const panelRef  = useRef(null);
  const prevCount = useRef(0);

  // ── Polling unread count mỗi 30 giây ─────────────────────────────────────
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res  = await notificationApi.getUnreadCount();
        const data = res.data;
        const c    = Number(typeof data === "number" ? data : (data.unreadCount ?? 0));
        if (c > prevCount.current) {
          setRing(true);
          setTimeout(() => setRing(false), 600);
        }
        prevCount.current = c;
        setUnreadCount(c);
      } catch {
        // axiosInstance đã xử lý lỗi 401/403/500
      }
    };

    fetchCount();
    const id = setInterval(fetchCount, 30_000);
    return () => clearInterval(id);
  }, []);

  // ── Fetch danh sách khi mở panel ──────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    notificationApi
      .getNotifications(0, 10)
      .then((res) => {
        const data = res.data;
        if (data?.content)      setNotifications(data.content);
        else if (Array.isArray(data)) setNotifications(data);
      })
      .catch(() => {});
  }, [open]);

  // ── Đóng panel khi click ra ngoài ─────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleToggleOpen = () => {
    setOpen((prev) => {
      if (!prev) setCurrentTime(Date.now());
      return !prev;
    });
  };

  const handleItemClick = async (n) => {
    if (!n.read) {
      try {
        await notificationApi.markAsRead(n.id);
        setNotifications((prev) =>
          prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // axiosInstance đã xử lý lỗi
      }
    }
    setOpen(false);
    const role = getUserRole();
    window.location.href = getRedirectPath(n.type, role);
  };

  const markAll = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // axiosInstance đã xử lý lỗi
    }
  };

  const handleViewAll = () => {
    setOpen(false);
    onViewAll?.();
  };

  // ── Phân nhóm thông báo: Mới (< 24h) và Trước đó ─────────────────────────
  const { shown, recent, earlier } = useMemo(() => {
    const shown = tab === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

    const DAY     = 86_400_000;
    const recent  = shown.filter((n) =>  n.createdAt && currentTime - new Date(n.createdAt) < DAY);
    const earlier = shown.filter((n) => !n.createdAt || currentTime - new Date(n.createdAt) >= DAY);

    return { shown, recent, earlier };
  }, [tab, notifications, currentTime]);

  return {
    open,
    tab,
    ring,
    shown,
    recent,
    earlier,
    unreadCount,
    panelRef,
    setTab,
    handleToggleOpen,
    handleItemClick,
    markAll,
    handleViewAll,
    timeAgo,
  };
}
