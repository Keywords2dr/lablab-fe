import axiosInstance from "./axiosInstance";

export const userApi = {
  
  getProfile: () => axiosInstance.get("/users/me"),
  updateProfile: (data) => axiosInstance.put("/users/me", data),
  changePassword: (data) => axiosInstance.put("/users/me/password", data),

  //  Admin User Management ===
  getUsers: (params) => axiosInstance.get("/admin/users", { params }),
  
  getUserById: (userId) => axiosInstance.get(`/admin/users/${userId}`),
  
  createUser: (data) => axiosInstance.post("/admin/users", data),
  
  updateUser: (userId, data) => axiosInstance.put(`/admin/users/${userId}`, data),
  
  toggleUserActive: (userId) => axiosInstance.patch(`/admin/users/${userId}/toggle-active`),
  
  resetUserPassword: (userId, newPassword) => 
    axiosInstance.post(`/admin/users/${userId}/reset-password`, { newPassword }),
};