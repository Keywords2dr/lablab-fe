import { userApi } from "../../../../api/userApi";
import { toast } from "react-toastify";

const getErrorMessage = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return fallback;
  const errors = data.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    return errors.join("\n");
  }
  return data.message || fallback;
};

export const useUserActions = (onSuccess) => {
  const createUser = async (data) => {
    try {
      await userApi.createUser(data);
      toast.success("Tạo tài khoản thành công!");
      onSuccess?.();
      return true;
    } catch (error) {
      const msg = getErrorMessage(error, "Tạo tài khoản thất bại!");
      msg.split("\n").forEach((line) => toast.error(line));
      return false;
    }
  };

  const updateUser = async (userId, data) => {
    try {
      await userApi.updateUser(userId, data);
      toast.success("Cập nhật thành công!");
      onSuccess?.();
      return true;
    } catch (error) {
      const msg = getErrorMessage(error, "Cập nhật thất bại!");
      msg.split("\n").forEach((line) => toast.error(line));
      return false;
    }
  };

  const toggleUserActive = async (userId) => {
    try {
      await userApi.toggleUserActive(userId);
      toast.success("Cập nhật trạng thái thành công!");
      onSuccess?.();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không thể thay đổi trạng thái!",
      );
    }
  };

  const resetUserPassword = async (userId, newPassword) => {
    try {
      await userApi.resetUserPassword(userId, newPassword);
      toast.success("Reset mật khẩu thành công!");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Reset mật khẩu thất bại!");
      return false;
    }
  };

  return { createUser, updateUser, toggleUserActive, resetUserPassword };
};
