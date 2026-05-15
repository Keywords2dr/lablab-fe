import { useState, useEffect, useCallback } from "react";
import { rentTicketApi } from "../../../api/rentTicketApi";
import { roomApi } from "../../../api/roomApi";

export const TICKET_STATUS_MAP = {
  PENDING_OWNER: { label: "Chờ bạn duyệt", cls: "waiting" },
  PENDING_ADMIN: { label: "Chờ Admin duyệt", cls: "waiting" },
  APPROVED: { label: "Sẵn sàng bàn giao", cls: "active" },
  BORROWED: { label: "Đang mượn", cls: "active" },
  PENDING_RETURN: { label: "Chờ xác nhận trả", cls: "waiting" },
  RETURNED: { label: "Đã hoàn tất", cls: "inc-fixed" },
  REJECTED: { label: "Từ chối", cls: "rejected" },
  CANCELLED: { label: "Đã hủy", cls: "rejected" },
};

export const ROOM_STATUS_MAP = {
  AVAILABLE: { label: "Hoạt động", cls: "active" },
  MAINTENANCE: { label: "Bảo trì", cls: "waiting" },
};

export const INCIDENT_STATUS = {
  PENDING: { label: "Chờ xử lý", cls: "waiting" },
  PROCESSING: { label: "Đang xử lý", cls: "active" },
  FIXED: { label: "Đã xử lý", cls: "inc-fixed" },
};

export function useRoomManagement() {
  const [activeTab, setActiveTab] = useState("approval");

  const [room, setRoom] = useState(null);
  const [supplies, setSupplies] = useState([]);
  const [requests, setRequests] = useState([]);

  // ── TỐI ƯU LOADING ──
  // initialLoading: Chỉ dùng lúc load toàn trang (thông tin phòng)
  const [initialLoading, setInitialLoading] = useState(true);
  // tableLoading: Chỉ dùng khi chuyển trang/lọc dữ liệu trong bảng phiếu
  const [tableLoading, setTableLoading] = useState(false);

  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [detailItem, setDetailItem] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectNote, setRejectNote] = useState("");

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [newIncident, setNewIncident] = useState({ device: "", desc: "" });
  const [incidentSent, setIncidentSent] = useState(false);

  // 1. Chỉ chạy 1 lần duy nhất khi vào trang (Lấy thông tin tĩnh)
  useEffect(() => {
    const fetchStaticData = async () => {
      setInitialLoading(true);
      try {
        const roomRes = await roomApi.getMyManagedRooms();
        if (roomRes.data && roomRes.data.length > 0) {
          const myRoom = roomRes.data[0];
          setRoom({
            id: myRoom.roomId,
            name: myRoom.roomName,
            status: myRoom.isActive ? "AVAILABLE" : "MAINTENANCE",
            capacity: myRoom.capacity || 30,
            description: myRoom.description || "Đang cập nhật...",
          });

          // Lấy tồn kho (chạy độc lập, không block UI)
          const invRes = await roomApi.getRoomInventory(myRoom.roomId);
          setSupplies(invRes.data || []);
        }
      } catch (error) {
        console.error("Lỗi khi tải phòng:", error);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchStaticData();
  }, []);

  // 2. Fetch danh sách phiếu
  const fetchTickets = useCallback(async () => {
    setTableLoading(true);
    try {
      const ticketRes = await rentTicketApi.getTeacherAll(page, 10);
      setRequests(ticketRes.data.content || []);
      setTotalPages(ticketRes.data.totalPages || 0);
    } catch (error) {
      console.error("Lỗi khi tải phiếu:", error);
    } finally {
      setTableLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // ─── CÁC HÀM XỬ LÝ ─────────────────────────────────────────────────────────

  const handleApprove = async (id) => {
    try {
      await rentTicketApi.teacherApprove(id, { approved: true });
      fetchTickets(); // Chỉ load lại table
      setDetailItem(null);
    } catch (error) {
      alert("Lỗi khi duyệt phiếu!");
    }
  };

  const handleReject = async (id) => {
    try {
      await rentTicketApi.teacherApprove(id, {
        approved: false,
        rejectedReason: rejectNote,
      });
      fetchTickets();
      setRejectTarget(null);
      setRejectNote("");
      setDetailItem(null);
    } catch (error) {
      alert("Lỗi khi từ chối!");
    }
  };

  const handleActivate = async (id) => {
    try {
      await rentTicketApi.activateTicket(id);
      fetchTickets();
    } catch (error) {
      alert("Lỗi khi bàn giao!");
    }
  };

  const handleConfirmReturn = async (id) => {
    try {
      await rentTicketApi.confirmReturn(id);
      fetchTickets();
    } catch (error) {
      alert("Lỗi khi xác nhận trả!");
    }
  };

  const handleIncidentSubmit = () => {
    if (!newIncident.device.trim() || !newIncident.desc.trim()) return;
    setIncidentSent(true);
    setNewIncident({ device: "", desc: "" });
    setTimeout(() => setIncidentSent(false), 3000);
  };

  // ─── FILTER & LỌC DỮ LIỆU TRÊN TRANG HIỆN TẠI ────────────────────────────
  const pendingCount = requests.filter(
    (r) => r.status === "PENDING_OWNER",
  ).length;
  const filteredReqs = requests.filter((r) => {
    const ms = filterStatus === "ALL" || r.status === filterStatus;
    const mt =
      search === "" ||
      (r.requesterName &&
        r.requesterName.toLowerCase().includes(search.toLowerCase())) ||
      (r.ticketId && r.ticketId.includes(search));
    return ms && mt;
  });

  return {
    room,
    supplies,
    requests,
    initialLoading,
    tableLoading,
    activeTab,
    setActiveTab,
    filterStatus,
    setFilterStatus,
    search,
    setSearch,
    detailItem,
    setDetailItem,
    rejectTarget,
    setRejectTarget,
    rejectNote,
    setRejectNote,
    pendingCount,
    filteredReqs,
    newIncident,
    setNewIncident,
    incidentSent,
    handleApprove,
    handleReject,
    handleActivate,
    handleConfirmReturn,
    handleIncidentSubmit,
    page,
    setPage,
    totalPages,
  };
}
