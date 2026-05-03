import axiosInstance from "./axiosInstance";

export const authApi = {
  login: (data) => {
    return axiosInstance.post("/auth/login", data);
  },

  forgotPassword: (email) => {
    return axiosInstance.post("/auth/forgot-password", { email });
  },

  verifyResetCode: (email, code) => {
    return axiosInstance.post("/auth/verify-reset-code", { email, code });
  },

  resetPassword: (email, code, newPassword, confirmPassword) => {
    return axiosInstance.post("/auth/reset-password", {
      email,
      code,
      newPassword,
      confirmPassword,
    });
  },
};
