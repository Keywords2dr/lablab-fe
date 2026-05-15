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

const PAGE_SIZE = 10;

export function useRoomManagement() {
  const [activeTab, setActiveTab] = useState("approval");
  const [room, setRoom] = useState(null);
  const [managedRooms, setManagedRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  const [supplies, setSupplies] = useState([]);
  const [suppliesPage, setSuppliesPage] = useState(0);
  const [suppliesTotalPages, setSuppliesTotalPages] = useState(0);

  const [requests, setRequests] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  const [initialLoading, setInitialLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search, setSearch] = useState("");

  // Chi tiết phiếu
  const [detailItem, setDetailItem] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [rejectTarget, setRejectTarget] = useState(null);
  const [newIncident, setNewIncident] = useState({ device: "", desc: "" });
  const [incidentSent, setIncidentSent] = useState(false);

  useEffect(() => {
    const fetchManagedRooms = async () => {
      setInitialLoading(true);
      try {
        const res = await roomApi.getMyManagedRooms();
        if (res.data && res.data.length > 0) {
          setManagedRooms(res.data);
          const firstId =
            res.data[0].roomId || res.data[0].room?.roomId || res.data[0].id;
          setSelectedRoomId(firstId);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchManagedRooms();
  }, []);

  useEffect(() => {
    if (!selectedRoomId) return;
    const fetchRoomDetail = async () => {
      try {
        const roomDetailRes = await roomApi.getRoomById(selectedRoomId);
        const roomData = roomDetailRes.data;
        setRoom({
          id: roomData.roomId,
          name: roomData.roomName,
          status: roomData.isActive ? "AVAILABLE" : "MAINTENANCE",
          description:
            roomData.description || "Chưa có mô tả chi tiết cho phòng Lab này.",
        });
        setSuppliesPage(0);
      } catch (error) {
        console.error(error);
      }
    };
    fetchRoomDetail();
  }, [selectedRoomId]);

  const fetchSupplies = useCallback(async () => {
    if (!selectedRoomId) return;
    try {
      const invRes = await roomApi.getRoomInventory(
        selectedRoomId,
        suppliesPage,
        PAGE_SIZE,
      );
      const data = invRes.data;
      if (Array.isArray(data)) {
        setSupplies(data);
        setSuppliesTotalPages(1);
      } else {
        setSupplies(data.content || []);
        setSuppliesTotalPages(data.totalPages || 0);
      }
    } catch (error) {
      console.error(error);
    }
  }, [selectedRoomId, suppliesPage]);

  useEffect(() => {
    fetchSupplies();
  }, [fetchSupplies]);

  const fetchTickets = useCallback(async () => {
    setTableLoading(true);
    try {
      const ticketsReq =
        filterStatus === "ALL"
          ? rentTicketApi.getTeacherAll(page, PAGE_SIZE)
          : rentTicketApi.getTeacherByStatus(filterStatus, page, PAGE_SIZE);

      const [ticketRes, pendingRes] = await Promise.all([
        ticketsReq,
        rentTicketApi.getTeacherPending(),
      ]);

      setRequests(ticketRes.data.content || []);
      setTotalPages(ticketRes.data.totalPages || 0);
      setPendingCount(pendingRes.data ? pendingRes.data.length : 0);
    } catch (error) {
      console.error(error);
    } finally {
      setTableLoading(false);
    }
  }, [page, filterStatus]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleOpenDetail = async (ticket) => {
    setLoadingDetail(true);
    setDetailItem(ticket);
    try {
      const res = await rentTicketApi.getTicketById(ticket.ticketId);
      setDetailItem(res.data);
    } catch (error) {
      console.error("Lỗi lấy chi tiết:", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleIncidentSubmit = () => {
    if (!newIncident.device.trim() || !newIncident.desc.trim()) return;
    setIncidentSent(true);
    setNewIncident({ device: "", desc: "" });
    setTimeout(() => setIncidentSent(false), 3000);
  };

  const filteredReqs = requests.filter((r) => {
    if (search === "") return true;
    const q = search.toLowerCase();
    return (
      (r.requesterName && r.requesterName.toLowerCase().includes(q)) ||
      (r.ticketId && r.ticketId.toLowerCase().includes(q))
    );
  });

  return {
    room,
    managedRooms,
    selectedRoomId,
    setSelectedRoomId,
    supplies,
    suppliesPage,
    setSuppliesPage,
    suppliesTotalPages,
    requests,
    initialLoading,
    tableLoading,
    activeTab,
    setActiveTab,
    filterStatus,
    setFilterStatus: (s) => {
      setFilterStatus(s);
      setPage(0);
    },
    search,
    setSearch,
    detailItem,
    setDetailItem,
    handleOpenDetail,
    loadingDetail,
    rejectTarget,
    setRejectTarget,
    pendingCount,
    filteredReqs,
    newIncident,
    setNewIncident,
    incidentSent,
    handleIncidentSubmit,
    refreshData: fetchTickets,
    page,
    setPage,
    totalPages,
  };
}
