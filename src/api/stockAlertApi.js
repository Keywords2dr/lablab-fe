import axiosInstance from "./axiosInstance";

export const stockAlertApi = {
  // ── Cảnh báo tồn kho ──────────────────────────────────────────────────────
  getStockAlerts: () =>
    axiosInstance.get("/stock-alerts"),

  // ── Ngưỡng cảnh báo ───────────────────────────────────────────────────────
  getAllThresholds: () =>
    axiosInstance.get("/stock-alerts/thresholds"),

  setThreshold: (data) =>
    axiosInstance.post("/stock-alerts/thresholds", data),

  deleteThreshold: (itemId) =>
    axiosInstance.delete(`/stock-alerts/thresholds/${itemId}`),
};
