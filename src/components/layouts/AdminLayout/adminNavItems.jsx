import {
  Dashboard,
  Receipt,
  Inventory,
  MeetingRoom,
  PeopleAlt,
  WarningAmber,
  History,
  Settings,
  ManageAccounts,
  LocalShipping,
  DomainOutlined,
  HourglassEmpty,
  LibraryBooks,
  NotificationsActive,
} from "@mui/icons-material";

export const NAV_ITEMS = [
  {
    group: "CHỨC NĂNG CHÍNH",
    items: [
      {
        label: "Tổng Quan",
        icon: <Dashboard fontSize="small" />,
        path: "/admin",
      },
      {
        label: "Quản lý Phiếu Mượn",
        icon: <Receipt fontSize="small" />,
        path: "/admin/tickets",
        groupKey: "tickets",
        children: [
          { label: "Duyệt Phiếu",    icon: <HourglassEmpty fontSize="small" />, path: "/admin/tickets" },
          { label: "Lịch sử Mượn",   icon: <LibraryBooks fontSize="small" />,   path: "/admin/borrow-history" },
        ],
      },
      {
        label: "Quản lý Hóa chất",
        icon: <Inventory fontSize="small" />,
        path: "/admin/materials",
      },
      {
        label: "Ngưỡng Cảnh Báo Kho",
        icon: <NotificationsActive fontSize="small" />,
        path: "/admin/stock-alerts",
      },
      {
        label: "Quản lý Phòng Lab",
        icon: <MeetingRoom fontSize="small" />,
        path: "/admin/rooms",
        groupKey: "rooms",
        children: [
          { label: "Danh sách Phòng",    icon: <DomainOutlined fontSize="small" />, path: "/admin/rooms" },
          { label: "Phân quyền Quản lý", icon: <ManageAccounts fontSize="small" />, path: "/admin/rooms/managers" },
          { label: "Phân phối Vật tư",   icon: <LocalShipping fontSize="small" />,  path: "/admin/rooms/supplies" },
        ],
      },
      {
        label: "Quản lý Người dùng",
        icon: <PeopleAlt fontSize="small" />,
        path: "/admin/users",
      },
    ],
  },
  {
    group: "QUẢN TRỊ & GIÁM SÁT",
    items: [
      { label: "Báo cáo Sự cố",    icon: <WarningAmber fontSize="small" />, path: "/admin/reports" },
      { label: "Nhật ký Hệ thống", icon: <History fontSize="small" />,      path: "/admin/audit-logs" },
    ],
  },
  {
    group: "HỆ THỐNG",
    items: [
      { label: "Cài đặt chung", icon: <Settings fontSize="small" />, path: null },
    ],
  },
];
