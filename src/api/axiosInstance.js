import axios from "axios";
import { useAuthStore } from "../store/authStore";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 1. Interceptor cho Request: Đính kèm Token trước khi gửi đi
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token; // Lấy token từ Zustand Store
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 2. Interceptor cho Response: Xử lý lỗi hệ thống tập trung
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Nếu Backend báo lỗi 401 (Hết hạn token), đăng xuất user ngay
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
