// Cấu hình màu nền và icon cho từng loại thông báo
export const TYPE_CONFIG = {
  // Phòng Lab
  ROOM_ASSIGN:  { bg: "linear-gradient(135deg,#43e97b,#38f9d7)", icon: "🔑" },
  ROOM_REMOVE:  { bg: "linear-gradient(135deg,#f857a6,#ff5858)", icon: "🚫" },

  // Phiếu mượn — tạo mới
  TICKET_CREATED:          { bg: "linear-gradient(135deg,#f7971e,#ffd200)", icon: "📋" },
  TICKET_CREATED_NO_STAFF: { bg: "linear-gradient(135deg,#f7971e,#ffd200)", icon: "📋" },

  // Phiếu mượn — duyệt / từ chối
  TICKET_APPROVED:                          { bg: "linear-gradient(135deg,#43e97b,#38f9d7)", icon: "✅" },
  TICKET_APPROVED_NOTIFY_TEACHER:           { bg: "linear-gradient(135deg,#43e97b,#38f9d7)", icon: "✅" },
  TICKET_PENDING_ADMIN:                     { bg: "linear-gradient(135deg,#f7971e,#ffd200)", icon: "⏳" },
  TICKET_PENDING_ADMIN_ALERT:               { bg: "linear-gradient(135deg,#f7971e,#ffd200)", icon: "📋" },
  TICKET_REJECTED_BY_TEACHER:               { bg: "linear-gradient(135deg,#f857a6,#ff5858)", icon: "❌" },
  TICKET_REJECTED_BY_ADMIN:                 { bg: "linear-gradient(135deg,#f857a6,#ff5858)", icon: "❌" },
  TICKET_REJECTED_BY_ADMIN_NOTIFY_TEACHER:  { bg: "linear-gradient(135deg,#f857a6,#ff5858)", icon: "❌" },

  // Phiếu mượn — bàn giao / trả
  TICKET_BORROWED:       { bg: "linear-gradient(135deg,#4facfe,#00f2fe)", icon: "🧪" },
  TICKET_PENDING_RETURN: { bg: "linear-gradient(135deg,#43e97b,#38f9d7)", icon: "📦" },
  TICKET_RETURNED:       { bg: "linear-gradient(135deg,#43e97b,#38f9d7)", icon: "✅" },
  RETURN_ISSUE_ALERT:    { bg: "linear-gradient(135deg,#f7971e,#ffd200)", icon: "⚠️" },
  RETURN_ISSUE_REQUESTER:{ bg: "linear-gradient(135deg,#f7971e,#ffd200)", icon: "⚠️" },

  // Phiếu mượn — hủy
  TICKET_CANCELLED:              { bg: "linear-gradient(135deg,#f857a6,#ff5858)", icon: "🚫" },
  TICKET_CANCELLED_CONFIRMATION: { bg: "linear-gradient(135deg,#f857a6,#ff5858)", icon: "🚫" },

  // Nhắc nhở / quá hạn
  TICKET_EXPIRY_REMINDER:       { bg: "linear-gradient(135deg,#f7971e,#ffd200)", icon: "⏰" },
  TICKET_EXPIRY_REMINDER_STAFF: { bg: "linear-gradient(135deg,#f7971e,#ffd200)", icon: "⏰" },
  TICKET_OVERDUE:               { bg: "linear-gradient(135deg,#f857a6,#ff5858)", icon: "🚨" },
  TICKET_OVERDUE_STAFF:         { bg: "linear-gradient(135deg,#f857a6,#ff5858)", icon: "🚨" },
  TICKET_OVERDUE_CRITICAL:      { bg: "linear-gradient(135deg,#f857a6,#ff5858)", icon: "🚨" },

  // Tồn kho
  STOCK_LOW:          { bg: "linear-gradient(135deg,#f7971e,#ffd200)", icon: "📉" },
  STOCK_OUT:          { bg: "linear-gradient(135deg,#f857a6,#ff5858)", icon: "❗" },
  INVENTORY_ALLOCATE: { bg: "linear-gradient(135deg,#4facfe,#00f2fe)", icon: "📥" },
  INVENTORY_REVOKE:   { bg: "linear-gradient(135deg,#a18cd1,#fbc2eb)", icon: "📤" },

  default: { bg: "linear-gradient(135deg,#a18cd1,#fbc2eb)", icon: "🔔" },
};

// Các loại thông báo điều hướng TEACHER → trang quản lý phòng
export const TEACHER_MANAGE_TYPES = new Set([
  "ROOM_ASSIGN",
  "ROOM_REMOVE",
  "TICKET_CREATED",
  "TICKET_PENDING_ADMIN_ALERT",
  "TICKET_PENDING_RETURN",
  "RETURN_ISSUE_ALERT",
  "TICKET_APPROVED_NOTIFY_TEACHER",
  "TICKET_REJECTED_BY_ADMIN_NOTIFY_TEACHER",
]);

// Các loại thông báo điều hướng STUDENT → trang lịch sử
export const STUDENT_HISTORY_TYPES = new Set([
  "TICKET_RETURNED",
  "TICKET_CANCELLED",
  "TICKET_CANCELLED_CONFIRMATION",
  "RETURN_ISSUE_ALERT",
  "RETURN_ISSUE_REQUESTER",
]);
