import axiosInstance from "./axiosInstance";

export const notificationApi = {
  getUnreadCount: () => axiosInstance.get("/notifications/unread-count"),

  getNotifications: (page = 0, size = 10) =>
    axiosInstance.get("/notifications", { params: { page, size } }),

  markAsRead: (id) => axiosInstance.patch(`/notifications/${id}/read`),

  markAllAsRead: () => axiosInstance.patch("/notifications/read-all"),
};
