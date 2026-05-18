import axiosInstance from "./axiosInstance";

export const reportApi = {
  // User gửi phiếu báo cáo
  createReport: (data) =>
    axiosInstance.post("/reports", data),

  // User xem lịch sử phiếu của mình
  getMyReports: (params = {}) => {
    const { page = 0, size = 10 } = params;
    return axiosInstance.get("/reports/my", { params: { page, size, sort: "createdAt,desc" } });
  },

  // Admin xem tất cả + filter
  getAllReports: (params = {}) => {
    const { reportType, roomId, itemId, page = 0, size = 10 } = params;
    const queryParams = { page, size, sort: "createdAt,desc" };
    if (reportType) queryParams.reportType = reportType;
    if (roomId) queryParams.roomId = roomId;
    if (itemId) queryParams.itemId = itemId;
    return axiosInstance.get("/reports", { params: queryParams });
  },
};
