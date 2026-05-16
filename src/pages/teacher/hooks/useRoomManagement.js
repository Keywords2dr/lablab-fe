import { useState, useEffect, useCallback } from "react";
import { rentTicketApi } from "../../../api/rentTicketApi";
import { roomApi } from "../../../api/roomApi";
import { chemicalApi } from "../../../api/chemicalApi";

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

  // initialLoading: true cho đến khi CẢ danh sách phòng lẫn chi tiết phòng đầu tiên đã sẵn sàng.
  // Tránh flash "bạn chưa có phòng" do room=null trong khoảng giữa 2 useEffect cũ.
  const [initialLoading, setInitialLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search, setSearch] = useState("");

  const [detailItem, setDetailItem] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [chemicalDict, setChemicalDict] = useState({});

  const [rejectTarget, setRejectTarget] = useState(null);
  const [newIncident, setNewIncident] = useState({ device: "", desc: "" });
  const [incidentSent, setIncidentSent] = useState(false);

  // ─── Fetch hóa chất dictionary (chạy song song, không block UI) ───────────
  useEffect(() => {
    const fetchChemicalDictionary = async () => {
      try {
        const res = await chemicalApi.getChemicals({ size: 1000 });
        const items = res.data?.content || res.data || [];
        const dict = {};
        items.forEach((item) => {
          const formula = item.chemicalFormula || item.formula;
          if (formula) {
            if (item.id || item.chemicalId)
              dict[item.id || item.chemicalId] = formula;
            if (item.code || item.itemCode)
              dict[item.code || item.itemCode] = formula;
          }
        });
        setChemicalDict(dict);
      } catch (error) {
        console.error("Không tải được từ điển hóa chất:", error);
      }
    };
    fetchChemicalDictionary();
  }, []);

  // ─── FIX: Gộp fetchManagedRooms + fetchRoomDetail vào 1 luồng ────────────
  // Trước đây: fetchManagedRooms xong → setInitialLoading(false) → room vẫn null
  // → render "bạn chưa có phòng" → fetchRoomDetail mới chạy → setRoom → render lại.
  // Giờ: chỉ setInitialLoading(false) sau khi cả 2 bước đều hoàn tất.
  useEffect(() => {
    const bootstrap = async () => {
      setInitialLoading(true);
      try {
        // Bước 1: lấy danh sách phòng quản lý
        const res = await roomApi.getMyManagedRooms();
        if (!res.data || res.data.length === 0) {
          // Không có phòng nào → tắt loading, để UI hiện thông báo đúng
          setInitialLoading(false);
          return;
        }

        const rooms = res.data;
        setManagedRooms(rooms);
        const firstId = rooms[0].roomId || rooms[0].room?.roomId || rooms[0].id;
        setSelectedRoomId(firstId);

        // Bước 2: lấy chi tiết phòng đầu tiên ngay trong cùng luồng
        // → room có giá trị trước khi initialLoading tắt
        const roomDetailRes = await roomApi.getRoomById(firstId);
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
      } finally {
        // Chỉ tắt loading sau khi cả 2 bước xong
        setInitialLoading(false);
      }
    };

    bootstrap();
  }, []);

  // ─── Khi người dùng chọn phòng khác từ dropdown ──────────────────────────
  // useEffect riêng, chỉ chạy khi selectedRoomId thay đổi SAU lần mount đầu.
  // Lần mount đầu đã được xử lý trong bootstrap() rồi nên dùng ref để bỏ qua.
  const [isFirstMount, setIsFirstMount] = useState(true);

  useEffect(() => {
    if (isFirstMount) {
      // Bỏ qua lần render đầu tiên — bootstrap() đã xử lý
      setIsFirstMount(false);
      return;
    }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoomId]);

  // ─── Fetch vật tư ─────────────────────────────────────────────────────────
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

  // ─── Fetch phiếu mượn ─────────────────────────────────────────────────────
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

  // ─── Handlers ─────────────────────────────────────────────────────────────
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
    chemicalDict,
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
