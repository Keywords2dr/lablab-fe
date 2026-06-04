// ── Labels hiển thị tên module ────────────────────────────────────────────
export const MODULE_LABELS = {
  RENT_TICKET:    "Phiếu mượn",
  ROOM:           "Phòng Lab",
  ROOM_STAFF:     "Nhân viên phòng",
  ROOM_INVENTORY: "Kho hóa chất phòng",
  CHEMICAL:       "Hóa chất",
  USER:           "Người dùng",
};

// ── Labels hiển thị tên role ──────────────────────────────────────────────
export const ROLE_LABELS = {
  ADMIN:   "Quản trị viên",
  TEACHER: "Giảng viên",
  STUDENT: "Sinh viên",
  MANAGER: "Quản lý phòng",
  STAFF:   "Nhân viên",
};

// ── Màu badge theo action ─────────────────────────────────────────────────
export const ACTION_COLORS = {
  CREATE: { bg: "#dcfce7", color: "#15803d" },
  UPDATE: { bg: "#dbeafe", color: "#1d4ed8" },
  DELETE: { bg: "#fee2e2", color: "#b91c1c" },
  LOGIN:  { bg: "#fef9c3", color: "#a16207" },
  LOGOUT: { bg: "#f3e8ff", color: "#7e22ce" },
  VIEW:   { bg: "#e0f2fe", color: "#0369a1" },
  REVOKE: { bg: "#fee2e2", color: "#b91c1c" },
};

export const getActionStyle = (action = "") => {
  const key = Object.keys(ACTION_COLORS).find((k) =>
    action.toUpperCase().includes(k)
  );
  return ACTION_COLORS[key] || { bg: "#f1f5f9", color: "#475569" };
};

// ── Màu badge theo role ───────────────────────────────────────────────────
export const ROLE_COLORS = {
  ADMIN:   { bg: "#fee2e2", color: "#b91c1c" },
  TEACHER: { bg: "#dcfce7", color: "#15803d" },
  STUDENT: { bg: "#dbeafe", color: "#1d4ed8" },
  MANAGER: { bg: "#fef9c3", color: "#a16207" },
  STAFF:   { bg: "#e0f2fe", color: "#0369a1" },
};

export const getRoleStyle = (role = "") => {
  const key = Object.keys(ROLE_COLORS).find((k) =>
    role.toUpperCase().includes(k)
  );
  return ROLE_COLORS[key] || { bg: "#f1f5f9", color: "#475569" };
};

// ── Config dịch field name + value theo từng entity ──────────────────────
export const ENTITY_DISPLAY_CONFIG = {
  RENT_TICKET: {
    translations: {
      itemName:             "Tên vật tư/HC",
      itemCode:             "Mã số",
      quantity:             "Số lượng",
      status:               "Trạng thái phiếu",
      purposeType:          "Mục đích",
      lessonDetail:         "Chi tiết bài học",
      roomName:             "Phòng học mượn",
      borrowDate:           "Ngày mượn",
      expectedReturnDate:   "Ngày hẹn trả",
      itemUnit:             "Đơn vị",
      returnNote:           "Ghi chú trả lại",
      quantityBorrowed:     "Số lượng đã mượn",
      quantityReturned:     "Số lượng đã trả",
      returnStatus:         "Trạng thái",
      classCode:            "Mã lớp",
      subjectName:          "Tên chủ đề",
      ticketType:           "Loại phiếu",
      requesterName:        "Tên người yêu cầu",
      requesterRole:        "Vai trò người yêu cầu",
      rejectedByName:       "Bị từ chối bởi",
      rejectedReason:       "Lí do từ chối",
      adminApprovedAt:      "Quản trị viên phê duyệt lúc",
      ownerApprovedAt:      "Chủ sở hữu đã phê duyệt lúc",
      adminApprovedByName:  "Tên Quản trị viên đã phê duyệt",
      ownerApprovedByName:  "Tên chủ sở hữu đã phê duyệt",
      createdAt:            "Được tạo lúc",
    },
  },
  ROOM_STAFF: {
    translations: {
      fullName:     "Họ và Tên",
      username:     "Tên tài khoản",
      role:         "Vai trò đảm nhiệm",
      roomName:     "Phòng",
      roomCode:     "Mã phòng",
      assignedRoom: "Phòng",
      room:         "Phòng",
    },
  },
  ROOM_INVENTORY: {
    translations: {
      itemName:      "Tên Hóa Chất",
      itemCode:      "Mã Hóa Chất",
      totalQuantity: "Số lượng",
      packaging:     "Đóng gói",
      roomName:      "Phòng số",
    },
  },
  ROOM: {
    translations: {
      isActive:    "Trạng thái hoạt động",
      roomName:    "Phòng số",
      staffCount:  "Số lượng nhân viên",
      description: "Mô tả",
    },
  },
  CHEMICAL: {
    translations: {
      name:            "Tên hóa chất",
      unit:            "Đơn vị",
      formula:         "Công thức hóa học",
      itemCode:        "Mã hóa chất",
      supplier:        "Nhà cung cấp",
      packaging:       "Đóng gói",
      amountPerPackage:"Số lượng mỗi gói",
    },
  },
  USER: {
    translations: {
      role:       "Vai trò",
      email:      "Email",
      major:      "Chuyên ngành",
      faculty:    "Khoa",
      fullName:   "Họ và tên",
      isActive:   "Tình trạng tài khoản",
      username:   "Tài khoản",
      department: "Bộ môn",
    },
  },
  DEFAULT: {
    translations: {
      name:        "Tên",
      code:        "Mã",
      description: "Mô tả",
      roomName:    "Phòng",
    },
  },
};

// ── Dịch giá trị enum sang tiếng Việt ────────────────────────────────────
export const VALUE_LABELS = {
  ticketType: {
    ROOM_ONLY:        "Đặt phòng Lab",
    CHEMICAL_ONLY:    "Mượn hóa chất",
    ROOM_AND_CHEMICAL:"Phòng & Hóa chất",
  },
  status: {
    PENDING_OWNER:  "Chờ giảng viên duyệt",
    PENDING_ADMIN:  "Chờ Admin duyệt",
    PENDING_RETURN: "Chờ trả",
    APPROVED:       "Đã duyệt",
    REJECTED:       "Bị từ chối",
    RETURNED:       "Đã trả",
    CANCELLED:      "Đã hủy",
  },
  returnStatus: {
    PENDING_OWNER:  "Chờ giảng viên duyệt",
    PENDING_ADMIN:  "Chờ Admin duyệt",
    PENDING_RETURN: "Chờ trả",
    APPROVED:       "Đã duyệt",
    REJECTED:       "Bị từ chối",
    RETURNED:       "Đã trả",
    CANCELLED:      "Đã hủy",
  },
  purposeType: {
    TEACHING: "Giảng dạy",
    RESEARCH: "Nghiên cứu",
    EXAM:     "Kiểm tra / Thi",
  },
};

// ── Blacklist field không hiển thị ────────────────────────────────────────
export const FIELD_BLACKLIST = new Set([
  "userid", "roomid", "id", "itemid", "ticketid",
  "detailid", "requesterid", "rejectedat",
  "rejectedbyid", "adminapprovedbyid", "ownerapprovedbyid", "actualreturndate",
]);
