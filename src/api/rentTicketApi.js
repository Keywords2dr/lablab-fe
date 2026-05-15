import axiosInstance from "./axiosInstance";

export const rentTicketApi = {
  // ── STUDENT / TEACHER ─────────────────────────────────────────────────
  createTicket: (data) => axiosInstance.post("/tickets", data),

  cancelTicket: (id) => axiosInstance.delete(`/tickets/${id}`),

  getMyTickets: (page = 0, size = 10) =>
    axiosInstance.get("/tickets/my", { params: { page, size } }),

  getMyTicketsByStatus: (status, page = 0, size = 10) =>
    axiosInstance.get("/tickets/my/filter", { params: { status, page, size } }),

  getMyTicketsFiltered: (params) =>
    axiosInstance.get("/tickets/my/search", { params }),

  requestReturn: (id, data) =>
    axiosInstance.put(`/tickets/${id}/request-return`, data),

  // ── SHARED ────────────────────────────────────────────────────────────
  getTicketById: (id) => axiosInstance.get(`/tickets/${id}`),

  // ── TEACHER ───────────────────────────────────────────────────────────
  getTeacherPending: () => axiosInstance.get("/tickets/teacher/pending"),

  getTeacherAll: (page = 0, size = 10) =>
    axiosInstance.get("/tickets/teacher/all", { params: { page, size } }),

  getTeacherByStatus: (status, page = 0, size = 10) =>
    axiosInstance.get("/tickets/teacher/filter", {
      params: { status, page, size },
    }),

  teacherApprove: (id, data) =>
    axiosInstance.put(`/tickets/${id}/teacher-approve`, data),

  activateTicket: (id) => axiosInstance.put(`/tickets/${id}/activate`),

  confirmReturn: (id) => axiosInstance.put(`/tickets/${id}/confirm-return`),

  // ── ADMIN ─────────────────────────────────────────────────────────────
  getAdminPending: () => axiosInstance.get("/tickets/admin/pending"),

  getAllForAdmin: (params) =>
    axiosInstance.get("/tickets/admin/all", { params }),

  adminApprove: (id, data) =>
    axiosInstance.put(`/tickets/${id}/admin-approve`, data),
};
