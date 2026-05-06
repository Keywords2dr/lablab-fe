import axiosInstance from "./axiosInstance";

export const userApi = {
  getProfile: () => axiosInstance.get("/users/me"),
  updateProfile: (data) => axiosInstance.put("/users/me", data),
  changePassword: (data) => axiosInstance.put("/users/me/password", data),
};