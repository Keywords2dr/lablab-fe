import { TEACHER_MANAGE_TYPES, STUDENT_HISTORY_TYPES } from "./notificationConstants";

export function getUserRole() {
  try {
    const raw = localStorage.getItem("auth-storage");
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.state?.user?.role || null;
    }
  } catch {
    // parse thất bại — trả về null bên dưới
  }
  return null;
}

export function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "Vừa xong";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} ngày trước`;
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

export function getRedirectPath(type, role) {
  if (role === "ADMIN") return "/admin/tickets";
  if (role === "STUDENT") {
    return STUDENT_HISTORY_TYPES.has(type) ? "/borrow-history" : "/my-tickets";
  }
  if (role === "TEACHER") {
    return TEACHER_MANAGE_TYPES.has(type) ? "/manage/assigned-rooms" : "/borrow-history";
  }
  return "/";
}
