import React, { useState, useEffect, useCallback } from "react";
import {
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  InputAdornment,
} from "@mui/material";
import {
  Add as AddIcon,
  PeopleAlt,
  Search as SearchIcon,
} from "@mui/icons-material";

import UserTable from "./components/UserTable";
import UserFormModal from "./components/UserFormModal";
import ResetPasswordModal from "./components/ResetPasswordModal";
import { useUserList } from "./hooks/useUserList";
import { useUserActions } from "./hooks/useUserActions";
import "./styles/UserManagementPage.css";

const UserManagementPage = () => {
  // ── Filters ──────────────────────────────────────────────────────────────
  const [filters, setFilters] = useState({
    keyword: "",
    role: "",
    isActive: "",
  });

  // ── Data & pagination (single source of truth) ───────────────────────────
  const { users, loading, total, totalPages, page, setPage, fetchUsers } =
    useUserList();

  useEffect(() => {
    fetchUsers(filters);
  }, [fetchUsers, filters, page]);

  const refresh = useCallback(() => fetchUsers(filters), [fetchUsers, filters]);

  // ── Actions ─────────────────────────────────
  const { createUser, updateUser, toggleUserActive, resetUserPassword } =
    useUserActions(refresh);

  const [formModal, setFormModal] = useState({ open: false, user: null });

  const openCreateModal = () => setFormModal({ open: true, user: null });
  const openEditModal = (user) => setFormModal({ open: true, user });
  const closeFormModal = () => setFormModal({ open: false, user: null });

  const [resetModal, setResetModal] = useState({ open: false, userId: null });

  const openResetModal = (userId) => setResetModal({ open: true, userId });
  const closeResetModal = () => setResetModal({ open: false, userId: null });

  const handleConfirmReset = async (newPassword) => {
    const success = await resetUserPassword(resetModal.userId, newPassword);
    if (success) closeResetModal();
  };

  // ── Filter helpers ────────────────────────────────────────────────────────
  const handleFilterChange = (field) => (e) => {
    setPage(0); // reset về trang 1 khi đổi filter
    setFilters((prev) => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="admin-users-page">
      {/* Banner */}
      <div className="users-banner">
        <div className="banner-left">
          <div className="banner-icon">
            <PeopleAlt sx={{ fontSize: 38, color: "white" }} />
          </div>
          <div className="banner-text-group">
            <Typography variant="h4" className="banner-title">
              Quản lý Người dùng
            </Typography>
            <Typography variant="body1" className="banner-desc">
              Thêm, chỉnh sửa và quản lý tài khoản người dùng trong hệ thống
            </Typography>
          </div>
        </div>

        {/* Stat pills */}
        <div className="banner-stats">
          <div className="stat-pill">
            <span className="stat-pill-number">{total}</span>
            <span className="stat-pill-label">Tổng người dùng</span>
          </div>
          <div className="stat-pill">
            <span className="stat-pill-number">{totalPages}</span>
            <span className="stat-pill-label">Số trang</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <div className="filters-row">
          <TextField
            placeholder="Tìm theo tên, username, email..."
            variant="outlined"
            size="small"
            className="search-input"
            value={filters.keyword}
            onChange={handleFilterChange("keyword")}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <FormControl size="small" className="filter-select">
            <InputLabel>Vai trò</InputLabel>
            <Select
              value={filters.role}
              label="Vai trò"
              onChange={handleFilterChange("role")}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="TEACHER">TEACHER</MenuItem>
              <MenuItem value="STUDENT">STUDENT</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" className="filter-select">
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={filters.isActive}
              label="Trạng thái"
              onChange={handleFilterChange("isActive")}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="true">Hoạt động</MenuItem>
              <MenuItem value="false">Đã khóa</MenuItem>
            </Select>
          </FormControl>
        </div>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateModal}
          className="create-new-button"
        >
          Tạo tài khoản mới
        </Button>
      </div>

      {/* Table — nhận data từ props, không tự fetch */}
      <div className="table-container">
        <UserTable
          users={users}
          loading={loading}
          total={total}
          totalPages={totalPages}
          page={page}
          onPageChange={(newPage) => setPage(newPage)}
          onEdit={openEditModal}
          onToggleActive={toggleUserActive}
          onResetPassword={openResetModal}
        />
      </div>

      {/* Modal Tạo / Chỉnh sửa */}
      <UserFormModal
        open={formModal.open}
        user={formModal.user}
        onClose={closeFormModal}
        onCreate={createUser}
        onUpdate={updateUser}
      />

      {/* Modal Reset mật khẩu */}
      <ResetPasswordModal
        open={resetModal.open}
        onClose={closeResetModal}
        onConfirm={handleConfirmReset}
      />
    </div>
  );
};

export default UserManagementPage;
