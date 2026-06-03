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

export const TICKET_TYPE = {
  ROOM_ONLY: { label: "Đặt phòng Lab", color: "blue" },
  CHEMICAL_ONLY: { label: "Mượn hóa chất", color: "indigo" },
};

export const ROLE_LABEL = {
  STUDENT: "Sinh viên",
  TEACHER: "Giảng viên",
  ADMIN: "Quản trị viên",
};

export const AVATAR_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#6366f1",
];

/* ── Helpers ─────────────────────────────────────────────────── */
export const fmtDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

export const fmtDateTime = (iso) => {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return (
      d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }) +
      " " +
      d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    );
  } catch {
    return "—";
  }
};
