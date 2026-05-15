import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { rentTicketApi } from "../../../api/rentTicketApi";
import { toast } from "react-toastify";

export const TICKET_STATUS_MAP = {
  PENDING_OWNER: {
    label: "Chờ duyệt phòng",
    cls: "pending",
    color: "#f59e0b",
    icon: "⏳",
  },
  PENDING_ADMIN: {
    label: "Chờ Admin duyệt",
    cls: "pending-admin",
    color: "#8b5cf6",
    icon: "⏳",
  },
  APPROVED: {
    label: "Đã duyệt",
    cls: "approved",
    color: "#0ea5e9",
    icon: "✅",
  },
  BORROWED: {
    label: "Đang mượn",
    cls: "borrowed",
    color: "#10b981",
    icon: "📦",
  },
  PENDING_RETURN: {
    label: "Chờ xác nhận trả",
    cls: "pending-return",
    color: "#f97316",
    icon: "🔄",
  },
  RETURNED: {
    label: "Đã hoàn tất",
    cls: "returned",
    color: "#6b7280",
    icon: "✔️",
  },
  REJECTED: { label: "Từ chối", cls: "rejected", color: "#ef4444", icon: "❌" },
  CANCELLED: {
    label: "Đã hủy",
    cls: "cancelled",
    color: "#9ca3af",
    icon: "🚫",
  },
};

export const TICKET_TYPE_MAP = {
  ROOM_ONLY: { label: "Phòng", short: "PHÒNG", cls: "room" },
  CHEMICAL_ONLY: { label: "Hóa chất", short: "HÓA CHẤT", cls: "chemical" },
};

export const TIMELINE_STEPS = [
  { key: "CREATED", label: "Tạo phiếu" },
  { key: "PENDING_OWNER", label: "Chờ duyệt phòng" },
  { key: "PENDING_ADMIN", label: "Chờ Admin duyệt" },
  { key: "APPROVED", label: "Đã duyệt" },
  { key: "BORROWED", label: "Đang mượn" },
  { key: "PENDING_RETURN", label: "Yêu cầu trả" },
  { key: "RETURNED", label: "Hoàn tất" },
];

const STATUS_ORDER = [
  "CREATED",
  "PENDING_OWNER",
  "PENDING_ADMIN",
  "APPROVED",
  "BORROWED",
  "PENDING_RETURN",
  "RETURNED",
];

export function mapPurpose(purposeType) {
  switch (purposeType) {
    case "TEACHING":
      return "Giảng dạy";
    case "RESEARCH":
      return "Nghiên cứu";
    case "EXAM":
      return "Thi cử";
    case "OTHER":
      return "Khác";
    default:
      return purposeType;
  }
}

export function buildFullDetail(data) {
  const ownerNameStr =
    data.ownerApprovedByName || data.ownerName || "Chưa xác nhận";

  const rawDetails = data.items || data.ticketDetails || data.details || [];

  const chemicals =
    data.ticketType === "CHEMICAL_ONLY"
      ? rawDetails.map((d) => ({
          name: d.itemName || d.item?.name || "—",
          quantity: d.quantityBorrowed ?? d.quantity ?? 0,
          unit: d.itemUnit || d.item?.unit || d.unit || "",
        }))
      : [];

  return {
    ...data,
    subject: data.subjectName || data.subject,
    classCode: data.classCode,
    lessonContent: data.lessonDetail || data.lessonContent,
    purpose: mapPurpose(data.purposeType) || data.purpose,
    ownerName: ownerNameStr,
    chemicals,
  };
}

export function getTimelineProgress(status) {
  if (status === "REJECTED" || status === "CANCELLED") {
    return {
      currentIndex: STATUS_ORDER.indexOf("PENDING_OWNER"),
      isFailed: true,
    };
  }
  const idx = STATUS_ORDER.indexOf(status);
  return { currentIndex: idx >= 0 ? idx : 0, isFailed: false };
}

const ACTIVE_STATUSES = [
  "PENDING_OWNER",
  "PENDING_ADMIN",
  "APPROVED",
  "BORROWED",
  "PENDING_RETURN",
];
const HISTORY_STATUSES = ["RETURNED", "REJECTED", "CANCELLED"];

// ─────────────────────────────────────────────────────────────────
// Hook chính
// ─────────────────────────────────────────────────────────────────
export function useTickets(mode = "tracking") {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);

  // Cache chi tiết phiếu để không fetch lại khi mở modal lần 2
  const detailCache = useRef(new Map());

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const excludeStr =
        mode === "tracking"
          ? HISTORY_STATUSES.join(",")
          : ACTIVE_STATUSES.join(",");

      const res = await rentTicketApi.getMyTicketsFiltered({
        excludeStatus: excludeStr,
        size: 500,
      });

      const rawData = res.data?.content || res.data || [];

      // FIX 1: Không còn N+1 query — map đồng bộ, không gọi thêm API
      // Nếu backend đã trả classCode thì dùng luôn.
      // Nếu backend CHƯA trả, gom tất cả ticketId thiếu classCode rồi
      // fetch song song (Promise.all) thay vì tuần tự (await trong loop).
      const missingIds = rawData
        .filter((t) => !t.classCode)
        .map((t) => t.ticketId);

      // Fetch tất cả ticket thiếu classCode song song (1 round-trip thay vì N)
      let extraMap = {};
      if (missingIds.length > 0) {
        const results = await Promise.allSettled(
          missingIds.map((id) => rentTicketApi.getTicketById(id)),
        );
        results.forEach((r, i) => {
          if (r.status === "fulfilled") {
            extraMap[missingIds[i]] = r.value.data?.classCode ?? null;
          }
        });
      }

      const hydratedTickets = rawData.map((t) => ({
        ...t,
        subject: t.subjectName || "Chưa cập nhật môn",
        classCode: t.classCode ?? extraMap[t.ticketId] ?? null,
        lessonContent: t.lessonDetail,
        purpose: mapPurpose(t.purposeType),
        cancelReason: t.status === "CANCELLED" ? "Đã hủy bởi người mượn" : null,
      }));

      // Xóa cache detail cũ khi refresh danh sách
      detailCache.current.clear();
      setTickets(hydratedTickets);
    } catch (error) {
      toast.error("Lỗi khi tải dữ liệu phiếu mượn");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // FIX 2: getTicketDetail có cache — mở lại modal không fetch lại
  const getTicketDetail = useCallback(async (ticketId) => {
    if (detailCache.current.has(ticketId)) {
      return detailCache.current.get(ticketId);
    }
    const res = await rentTicketApi.getTicketById(ticketId);
    const detail = buildFullDetail(res.data);
    detailCache.current.set(ticketId, detail);
    return detail;
  }, []);

  const relevantStatuses =
    mode === "tracking" ? ACTIVE_STATUSES : HISTORY_STATUSES;

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (!relevantStatuses.includes(t.status)) return false;
      if (filterStatus !== "ALL" && t.status !== filterStatus) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          t.ticketId?.toLowerCase().includes(q) ||
          t.roomName?.toLowerCase().includes(q) ||
          t.subject?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tickets, search, filterStatus, relevantStatuses]);

  const statusCounts = useMemo(() => {
    const counts = { ALL: 0 };
    relevantStatuses.forEach((s) => (counts[s] = 0));
    tickets.forEach((t) => {
      if (relevantStatuses.includes(t.status)) {
        counts.ALL++;
        counts[t.status] = (counts[t.status] || 0) + 1;
      }
    });
    return counts;
  }, [tickets, relevantStatuses]);

  const handleCancelTicket = useCallback(
    async (ticketId) => {
      try {
        await rentTicketApi.cancelTicket(ticketId);
        toast.success("Hủy phiếu thành công!");
        fetchTickets();
      } catch (error) {
        toast.error(error.response?.data?.message || "Lỗi khi hủy phiếu!");
      }
    },
    [fetchTickets],
  );

  const handleRequestReturn = useCallback(
    async (ticketId, payload) => {
      try {
        const body =
          typeof payload === "object" && payload !== null
            ? payload
            : { items: [], returnNote: payload ?? "" };
        await rentTicketApi.requestReturn(ticketId, body);
        toast.success("Đã gửi yêu cầu trả!");
        fetchTickets();
      } catch (error) {
        toast.error(error.response?.data?.message || "Lỗi khi yêu cầu trả!");
      }
    },
    [fetchTickets],
  );

  return {
    tickets: filteredTickets,
    allTickets: tickets,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    statusCounts,
    handleCancelTicket,
    handleRequestReturn,
    getTicketDetail,
    loading,
  };
}
