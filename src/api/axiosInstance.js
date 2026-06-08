import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { toast } from "react-toastify";

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
    // Logic 401 GỐC CỦA BẠN
    if (error.response && error.response.status === 401) {
      toast.error("Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.");
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }

    const status = error.response ? error.response.status : null;
    
    if (status === 403) {
      toast.error("Phiên đăng nhập hết hạn hoặc bạn không có quyền truy cập!");
      useAuthStore.getState().logout();
      window.location.href = "/login";
    } 
    else if (status === 500) {
      const msg = error.response.data?.message || "Lỗi hệ thống (500)";
      toast.error(`Server lỗi: ${msg}`);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;