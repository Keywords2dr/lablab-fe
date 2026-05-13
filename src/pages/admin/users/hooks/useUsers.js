// src/pages/admin/users/hooks/useUsers.js
import { useState, useCallback } from 'react';
import { userApi } from '../../../../api/userApi';
import { toast } from 'react-toastify';

export const useUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const fetchUsers = useCallback(async (filters = {}) => {
        setLoading(true);
        try {
            const params = {
                page,
                size: rowsPerPage,
                ...filters
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
    }, [page, rowsPerPage]);

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
            toast.error("Không thể thay đổi trạng thái");
        }
    };

    /**
     * FIX: Thêm logic hỏi mật khẩu mới từ Admin
     * Nếu Admin không nhập hoặc hủy, hàm sẽ dừng lại.
     */
    const resetPassword = async (userId) => {
        // 1. Hiện thông báo cho Admin nhập mật khẩu mới
        const newPassword = window.prompt("Nhập mật khẩu mới để cứu tài khoản này (Tối thiểu 6 ký tự):");

        // 2. Kiểm tra nếu Admin nhấn Cancel
        if (newPassword === null) return;

        // 3. Kiểm tra độ dài mật khẩu (Validation cơ bản ở Frontend)
        if (newPassword.trim().length < 6) {
            toast.warning("Mật khẩu mới phải có ít nhất 6 ký tự!");
            return;
        }

        try {
            // 4. Gọi API với mật khẩu Admin vừa nhập
            await userApi.resetUserPassword(userId, newPassword.trim());
            toast.success("Đã thay đổi mật khẩu thành công!");
            fetchUsers(); 
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Reset mật khẩu thất bại");
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