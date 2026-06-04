import {
  Receipt,
  MeetingRoom,
  Inventory2,
  PeopleAlt,
  Science as ScienceIcon,
  Person,
  Build,
} from "@mui/icons-material";

// ── Ticket type ───────────────────────────────────────────────────────────
export const TICKET_TYPE_LABEL = {
  ROOM_ONLY:        "Phòng Lab",
  CHEMICAL_ONLY:    "Vật tư",
  ROOM_AND_CHEMICAL:"Phòng & Vật tư",
};

// ── Avatar colors cho danh sách phiếu ────────────────────────────────────
export const AVATAR_COLORS = [
  "#3b82f6", "#8b5cf6", "#10b981",
  "#f59e0b", "#ef4444", "#6366f1",
];

// ── Activity feed: icon và màu theo category ──────────────────────────────
export const FEED_CATEGORY_ICON = {
  TICKET:    <Receipt   style={{ fontSize: 15 }} />,
  ROOM:      <MeetingRoom style={{ fontSize: 15 }} />,
  CHEMICAL:  <ScienceIcon style={{ fontSize: 15 }} />,
  USER:      <Person    style={{ fontSize: 15 }} />,
  INVENTORY: <Inventory2 style={{ fontSize: 15 }} />,
  SYSTEM:    <Build     style={{ fontSize: 15 }} />,
};

export const FEED_CATEGORY_COLOR = {
  TICKET:    "#3b82f6",
  ROOM:      "#10b981",
  CHEMICAL:  "#8b5cf6",
  USER:      "#f59e0b",
  INVENTORY: "#6366f1",
  SYSTEM:    "#94a3b8",
};

// ── Stats cards config (dynamic, nhận stats + navigate) ──────────────────
export function getStatsConfig(stats, statsLoading) {
  return [
    {
      id:    "tickets",
      label: "Phiếu chờ duyệt",
      value: statsLoading ? "—" : String(stats.pendingCount),
      icon:  <Receipt />,
      color: "blue",
      path:  "/admin/tickets",
    },
    {
      id:    "rooms",
      label: "Phòng đang hoạt động",
      value: statsLoading ? "—" : String(stats.activeRooms),
      icon:  <MeetingRoom />,
      color: "green",
      path:  "/admin/rooms",
    },
    {
      id:    "materials",
      label: "Hóa chất hết hàng",
      value: statsLoading ? "—" : String(stats.lowStockCount),
      icon:  <Inventory2 />,
      color: "orange",
      path:  "/admin/stock-alerts",
    },
    {
      id:    "users",
      label: "Tổng người dùng",
      value: statsLoading ? "—" : String(stats.totalUsers),
      icon:  <PeopleAlt />,
      color: "purple",
      path:  "/admin/users",
    },
  ];
}
