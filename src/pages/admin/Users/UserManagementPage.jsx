import React, { useState, useEffect, useCallback } from "react";

import { useUserList } from "./hooks/useUserList";
import { useUserActions } from "./hooks/useUserActions";
import { DEFAULT_FILTERS } from "./constants/userConstants";

import UserBanner from "./components/UserBanner";
import UserFilterBar from "./components/UserFilterBar";
import UserTable from "./components/UserTable";
import UserFormModal from "./components/UserFormModal";
import ResetPasswordModal from "./components/ResetPasswordModal";

import "./styles/index.css";

const UserManagementPage = () => {
  // ── Filters ──────────────────────────────────────────────────────────────
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // ── Data & pagination ────────────────────────────────────────────────────
  const { users, loading, total, totalPages, page, setPage, fetchUsers } =
    useUserList();

  useEffect(() => {
    fetchUsers(filters);
  }, [fetchUsers, filters, page]);

  const refresh = useCallback(() => fetchUsers(filters), [fetchUsers, filters]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const { createUser, updateUser, toggleUserActive, resetUserPassword } =
    useUserActions(refresh);

  // ── Modal state ──────────────────────────────────────────────────────────
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
    setPage(0);
    setFilters((prev) => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="admin-users-page">
      <UserBanner total={total} totalPages={totalPages} />

      <UserFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onCreateNew={openCreateModal}
      />

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

      <UserFormModal
        open={formModal.open}
        user={formModal.user}
        onClose={closeFormModal}
        onCreate={createUser}
        onUpdate={updateUser}
      />

      <ResetPasswordModal
        open={resetModal.open}
        onClose={closeResetModal}
        onConfirm={handleConfirmReset}
      />
    </div>
  );
};

export default UserManagementPage;
