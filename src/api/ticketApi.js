import axiosInstance from "./axiosInstance";

/**
 * API dành riêng cho quản lý Phiếu mượn (Tickets)
 * Lưu ý: axiosInstance đã có baseURL là ".../api", 
 * nên các endpoint ở đây không cần bắt đầu bằng /api nữa.
 */
const ticketApi = {
  /**
   * Lấy danh sách tất cả phiếu mượn dành cho Admin (Phân trang & Lọc)
   * URL thực tế: {baseURL}/tickets/admin/all
   */
  getAllForAdmin: (params) => {
    return axiosInstance.get('/tickets/admin/all', { params });
  },

  /**
   * Lấy thông tin chi tiết một phiếu mượn cụ thể bằng ID
   * URL thực tế: {baseURL}/tickets/{id}
   */
  getDetail: (id) => {
    if (!id) return Promise.reject("ID không hợp lệ");
    return axiosInstance.get(`/tickets/${id}`);
  },

  /**
   * Admin phê duyệt hoặc từ chối phiếu mượn
   * @param {String} id - UUID của phiếu mượn
   * @param {Object} data - { approved: boolean, rejectedReason: string }
   * URL thực tế: {baseURL}/tickets/{id}/admin-approve
   */
  adminApprove: (id, data) => {
    return axiosInstance.put(`/tickets/${id}/admin-approve`, data);
  },

  /**
   * Lấy danh sách phiếu đang chờ Admin duyệt (nếu cần dùng cho thông báo)
   */
  getPendingAdmin: () => {
    return axiosInstance.get('/tickets/admin/pending');
  }
};

export default ticketApi;