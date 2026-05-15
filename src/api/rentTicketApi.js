import axiosInstance from "./axiosInstance";

export const rentTicketApi = {
  // ── STUDENT / TEACHER ─────────────────────────────────────────────────

  /**
   * Tạo phiếu mượn phòng mới.
   * POST /api/tickets
   * @param {Object} data
   * @param {string} data.roomId
   * @param {string} data.purposeType  - TEACHING | RESEARCH | PRACTICE | OTHER
   * @param {string} data.subjectName
   * @param {string} data.classCode
   * @param {string} [data.lessonDetail]
   * @param {string} data.borrowDate
   * @param {string} data.expectedReturnDate 
   * @param {string} [data.note]
   */
  createTicket: (data) =>
    axiosInstance.post("/tickets", data),

  /**
   * Hủy phiếu mượn.
   * DELETE /api/tickets/:id
   */
  cancelTicket: (id) =>
    axiosInstance.delete(`/tickets/${id}`),

  /**
   * Lấy danh sách phiếu của người dùng hiện tại (phân trang).
   * GET /api/tickets/my
   */
  getMyTickets: (page = 0, size = 10) =>
    axiosInstance.get("/tickets/my", { params: { page, size } }),

  /**
   * Yêu cầu trả phòng.
   * PUT /api/tickets/:id/request-return
   * @param {Object} data - ReturnTicketRequest
   */
  requestReturn: (id, data) =>
    axiosInstance.put(`/tickets/${id}/request-return`, data),

  // ── SHARED ────────────────────────────────────────────────────────────

  /**
   * Lấy chi tiết một phiếu bất kỳ.
   * GET /api/tickets/:id
   */
  getTicketById: (id) =>
    axiosInstance.get(`/tickets/${id}`),

  // ── TEACHER ───────────────────────────────────────────────────────────

  /**
   * Lấy danh sách phiếu đang chờ teacher duyệt.
   * GET /api/tickets/teacher/pending
   */
  getTeacherPending: () =>
    axiosInstance.get("/tickets/teacher/pending"),

  /**
   * Lấy tất cả phiếu thuộc phòng teacher quản lý (phân trang).
   * GET /api/tickets/teacher/all
   */
  getTeacherAll: (page = 0, size = 10) =>
    axiosInstance.get("/tickets/teacher/all", { params: { page, size } }),

  /**
   * Teacher duyệt phiếu.
   * PUT /api/tickets/:id/teacher-approve
   * @param {Object} data - RentTicketApproveRequest
   */
  teacherApprove: (id, data) =>
    axiosInstance.put(`/tickets/${id}/teacher-approve`, data),

  /**
   * Kích hoạt phiếu (người mượn đã đến lấy phòng).
   * PUT /api/tickets/:id/activate
   */
  activateTicket: (id) =>
    axiosInstance.put(`/tickets/${id}/activate`),

  /**
   * Teacher xác nhận trả phòng.
   * PUT /api/tickets/:id/confirm-return
   */
  confirmReturn: (id) =>
    axiosInstance.put(`/tickets/${id}/confirm-return`),

  // ── ADMIN ─────────────────────────────────────────────────────────────

  /**
   * Lấy danh sách phiếu đang chờ admin duyệt.
   * GET /api/tickets/admin/pending
   */
  getAdminPending: () =>
    axiosInstance.get("/tickets/admin/pending"),

  /**
   * Lấy tất cả phiếu với filter (admin).
   * GET /api/tickets/admin/all
   * @param {Object} [params]
   * @param {string} [params.roomId]
   * @param {string} [params.status]      - TicketStatus enum
   * @param {string} [params.ticketType]  - TicketType enum
   * @param {string} [params.requesterId]
   * @param {number} [params.page=0]
   * @param {number} [params.size=10]
   * @param {string} [params.sortDir='desc'] - 'asc' | 'desc'
   */
  getAdminAll: (params = {}) => {
    const { roomId, status, ticketType, requesterId, page = 0, size = 10, sortDir = "desc" } = params;
    const query = { page, size, sortDir };
    if (roomId)      query.roomId      = roomId;
    if (status)      query.status      = status;
    if (ticketType)  query.ticketType  = ticketType;
    if (requesterId) query.requesterId = requesterId;
    return axiosInstance.get("/tickets/admin/all", { params: query });
  },

  /**
   * Admin duyệt phiếu.
   * PUT /api/tickets/:id/admin-approve
   * @param {Object} data - RentTicketApproveRequest
   */
  adminApprove: (id, data) =>
    axiosInstance.put(`/tickets/${id}/admin-approve`, data),
};