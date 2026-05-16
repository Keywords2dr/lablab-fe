import { useState, useCallback } from "react";
import { userApi } from "../../../../api/userApi";
import { toast } from "react-toastify";

export const useUserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const fetchUsers = useCallback(
    async (filters = {}) => {
      setLoading(true);
      try {
        const params = {
          page,
          size: rowsPerPage,
          ...(filters.keyword && { keyword: filters.keyword }),
          ...(filters.role && { role: filters.role }),
          ...(filters.isActive !== "" && { isActive: filters.isActive }),
        };

        const res = await userApi.getUsers(params);
        setUsers(res.data.content ?? res.data);
        setTotal(res.data.totalElements ?? res.data.length ?? 0);
      } catch {
        toast.error("Không thể tải danh sách người dùng!");
      } finally {
        setLoading(false);
      }
    },
    [page, rowsPerPage],
  );

  const totalPages = Math.ceil(total / rowsPerPage) || 1;

  return {
    users,
    loading,
    total,
    totalPages,
    page,
    rowsPerPage,
    setPage,
    fetchUsers,
  };
};
