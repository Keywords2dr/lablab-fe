import axiosInstance from "./axiosInstance";

export const dashboardApi = {
  /*Biểu đồ phiếu mượn 7 ngày gần nhất.*/
  getWeeklyStats: () => axiosInstance.get("/tickets/admin/stats/weekly"),

  /*Trạng thái sử dụng thực tế của tất cả phòng Lab.*/
  getRoomCurrentUsage: () => axiosInstance.get("/rooms/current-usage"),

  /*Activity feed thân thiện cho dashboard.*/
  getActivityFeed: (limit = 8) =>
    axiosInstance.get("/audit-logs/feed", { params: { limit } }),
};
