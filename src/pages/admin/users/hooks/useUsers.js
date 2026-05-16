import { useState, useCallback } from "react";
import { userApi } from "../../../../api/userApi";
import { toast } from "react-toastify";

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchUsers = useCallback(
    async (filters = {}) => {
      setLoading(true);
      try {
        const params = {
          page,
          size: rowsPerPage,
          ...filters,
          ...(filters.role === "" && { role: undefined }),
          ...(filters.isActive === "" && { isActive: undefined }),
        };

        const response = await userApi.getUsers(params);
        setUsers(response.data.content || response.data);
        setTotal(response.data.totalElements || response.data.length || 0);
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải danh sách người dùng");
      } finally {
        setLoading(false);
      }
    },
    [page, rowsPerPage],
  );

  const createUser = async (data) => {
    try {
      await userApi.createUser(data);
      toast.success("Tạo tài khoản thành công!");
      fetchUsers();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Tạo tài khoản thất bại");
      return false;
    }
  };

  const updateUser = async (userId, data) => {
    try {
      await userApi.updateUser(userId, data);
      toast.success("Cập nhật thành công!");
      fetchUsers();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Cập nhật thất bại");
      return false;
    }
  };

  const toggleActive = async (userId) => {
    try {
      await userApi.toggleUserActive(userId);
      toast.success("Cập nhật trạng thái thành công!");
      fetchUsers();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không thể thay đổi trạng thái",
      );
    }
  };

  const resetPassword = async (userId, newPassword) => {
    try {
      await userApi.resetUserPassword(userId, newPassword);
      toast.success("Đã reset mật khẩu thành công!");
      fetchUsers();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Reset mật khẩu thất bại");
      return false;
    }
  };

  return {
    users,
    loading,
    total,
    page,
    rowsPerPage,
    setPage,
    setRowsPerPage,
    fetchUsers,
    createUser,
    updateUser,
    toggleActive,
    resetPassword,
  };
};
