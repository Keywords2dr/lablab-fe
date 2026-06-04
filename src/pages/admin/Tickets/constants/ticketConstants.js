/* ── Constants ─────────────────────────────────────────────── */
export const TICKET_STATUS = {
  PENDING_OWNER: { label: "Chờ GV duyệt", color: "orange" },
  PENDING_ADMIN: { label: "Chờ Admin duyệt", color: "cyan" },
  APPROVED: { label: "Đã duyệt", color: "green" },
  BORROWED: { label: "Đang mượn", color: "blue" },
  PENDING_RETURN: { label: "Chờ trả", color: "purple" },
  RETURNED: { label: "Đã trả", color: "slate" },
  REJECTED: { label: "Bị từ chối", color: "red" },
  CANCELLED: { label: "Đã hủy", color: "slate" },
};

export const TICKET_STATUS_DETAIL = {
  PENDING_OWNER:  { label: "Chờ GV Duyệt",   dot: "#f59e0b" },
  PENDING_ADMIN:  { label: "Chờ Admin Duyệt", dot: "#0ea5e9" },
  APPROVED:       { label: "Đã Duyệt",        dot: "#10b981" },
  BORROWED:       { label: "Đang Mượn",       dot: "#3b82f6" },
  PENDING_RETURN: { label: "Chờ Trả",         dot: "#8b5cf6" },
  RETURNED:       { label: "Đã Trả",          dot: "#94a3b8" },
  REJECTED:       { label: "Bị Từ Chối",      dot: "#ef4444" },
  CANCELLED:      { label: "Đã Hủy",          dot: "#94a3b8" },
};

export const TICKET_TYPE = {
  ROOM_ONLY: { label: "Đặt phòng Lab", color: "blue", antColor: "blue" },
  CHEMICAL_ONLY: { label: "Mượn hóa chất", color: "indigo", antColor: "geekblue" },
};

export const ROLE_LABEL = {
  STUDENT: "Sinh viên",
  TEACHER: "Giảng viên",
  ADMIN: "Quản trị viên",
};

export const RETURN_STATUS = {
  RETURNED: { label: "Đã trả đủ", color: "#059669", bg: "#d1fae5" },
  PARTIAL:  { label: "Trả thiếu", color: "#d97706", bg: "#fef3c7" },
  DAMAGED:  { label: "Hư hỏng",   color: "#dc2626", bg: "#fee2e2" },
  LOST:     { label: "Mất mát",   color: "#dc2626", bg: "#fee2e2" },
};

export const PURPOSE_MAP = {
  TEACHING: "Giảng dạy",
  RESEARCH: "Nghiên cứu",
  EXAM: "Thi cử",
  OTHER: "Khác",
};

export const AVATAR_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#6366f1",
];
