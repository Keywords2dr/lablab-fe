import axiosInstance from "./axiosInstance";

const ticketApi = {

  getAllForAdmin: (params) => {
    return axiosInstance.get('/tickets/admin/all', { params });
  },

  getDetail: (id) => {
    if (!id) return Promise.reject("ID không hợp lệ");
    return axiosInstance.get(`/tickets/${id}`);
  },

  adminApprove: (id, data) => {
    return axiosInstance.put(`/tickets/${id}/admin-approve`, data);
  },

  getPendingAdmin: () => {
    return axiosInstance.get('/tickets/admin/pending');
  }
};

export default ticketApi;