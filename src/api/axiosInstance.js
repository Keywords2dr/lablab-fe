import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { toast } from "react-toastify"; // Bổ sung để hiện thông báo khi lỗi

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 1. Interceptor cho Request: Đính kèm Token trước khi gửi đi (GIỮ NGUYÊN GỐC)
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
    // Logic 401 GỐC CỦA BẠN - KHÔNG XÓA
    if (error.response && error.response.status === 401) {
      // Nếu Backend báo lỗi 401 (Hết hạn token), đăng xuất user ngay
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }

    // --- PHẦN BỔ SUNG ĐỂ FIX TRANG DUYỆT PHIẾU ---
    const status = error.response ? error.response.status : null;
    
    if (status === 403) {
      toast.error("Lỗi 403: Bạn không có quyền Admin hoặc Token không hợp lệ!");
    } 
    else if (status === 500) {
      // Báo lỗi Enum hoặc lỗi Server để bạn biết đường fix DB
      const msg = error.response.data?.message || "Lỗi hệ thống (500)";
      toast.error(`Server lỗi: ${msg}`);
    }
    // --------------------------------------------

    return Promise.reject(error);
  },
);

export default axiosInstance;