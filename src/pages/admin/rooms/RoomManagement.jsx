import React, { useState } from "react";
import { DomainOutlined } from "@mui/icons-material";

import { useRooms } from "./hooks/useRooms";
import RoomTable from "./components/RoomTable";
import RoomFormModal from "./components/RoomFormModal";
import RoomDeactivateModal from "./components/RoomDeactivateModal";
import RoomActivateModal from "./components/RoomActivateModal";
import RoomInventoryModal from "./components/RoomInventoryModal";
import "./styles/index.css";

export default function RoomManagement() {
  const {
    rooms,
    loading,
    filters,
    stats,
    pagination,
    applyFilters,
    resetFilters,
    reload,
    goToPage,
    createRoom,
    updateRoom,
    deactivateRoom,
    activateRoom,
  } = useRooms({ pageSize: 10 });

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [activateTarget, setActivateTarget] = useState(null);
  const [inventoryRoom, setInventoryRoom] = useState(null);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormOpen(true);
  };
  const handleOpenEdit = (room) => {
    setEditingItem(room);
    setFormOpen(true);
  };
  const handleFormClose = () => {
    setFormOpen(false);
    setEditingItem(null);
  };

  const handleFilterByStatus = (status) => {
    applyFilters({ status: filters.status === status ? "" : status });
  };

  return (
    <div className="rm-root">
      {/* ── Page Header ── */}
      <div className="rm-header">
        <div className="rm-header-left">
          <div className="rm-header-icon">
            <DomainOutlined />
          </div>
          <div>
            <div className="rm-header-title">Quản lý Phòng Lab</div>
            <div className="rm-header-sub">
              Thêm, chỉnh sửa và quản lý trạng thái các phòng thí nghiệm
            </div>
          </div>
        </div>

        <div className="rm-stats">
          <div
            className={`rm-stat-badge${filters.status === "" ? " rm-stat-badge--selected" : ""}`}
            onClick={() => applyFilters({ status: "" })}
            title="Xem tất cả phòng"
          >
            <div className="num">{stats.total}</div>
            <div className="lbl">Tổng phòng</div>
          </div>

          {/* Hoạt động */}
          <div
            className={`rm-stat-badge rm-stat-badge--green${filters.status === "active" ? " rm-stat-badge--selected" : ""}`}
            onClick={() => handleFilterByStatus("active")}
            title="Lọc phòng đang hoạt động"
          >
            <div className="num">{stats.active}</div>
            <div className="lbl">Hoạt động</div>
          </div>

          {/* Ngừng HĐ */}
          <div
            className={`rm-stat-badge rm-stat-badge--red${filters.status === "inactive" ? " rm-stat-badge--selected" : ""}`}
            onClick={() => handleFilterByStatus("inactive")}
            title="Lọc phòng đang ngừng hoạt động"
          >
            <div className="num">{stats.inactive}</div>
            <div className="lbl">Ngừng HĐ</div>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <RoomTable
        rooms={rooms}
        loading={loading}
        filters={filters}
        pagination={pagination}
        onFilterChange={applyFilters}
        onResetFilters={resetFilters}
        onEdit={handleOpenEdit}
        onDeactivate={setDeactivateTarget}
        onActivate={setActivateTarget}
        onAdd={handleOpenAdd}
        onReload={reload}
        onPageChange={goToPage}
        onViewInventory={setInventoryRoom}
      />

      {/* ── Form Modal (Thêm / Sửa) ── */}
      <RoomFormModal
        open={formOpen}
        editingItem={editingItem}
        onClose={handleFormClose}
        onSaved={handleFormClose}
        onCreateRoom={createRoom}
        onUpdateRoom={updateRoom}
      />

      {/* ── Deactivate Modal ── */}
      <RoomDeactivateModal
        target={deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={() => setDeactivateTarget(null)}
        onDeactivateRoom={deactivateRoom}
      />

      {/* ── Activate Modal ── */}
      <RoomActivateModal
        target={activateTarget}
        onClose={() => setActivateTarget(null)}
        onConfirm={() => setActivateTarget(null)}
        onActivateRoom={activateRoom}
      />

      {/* ── Inventory Modal ── */}
      <RoomInventoryModal
        room={inventoryRoom}
        onClose={() => setInventoryRoom(null)}
      />
    </div>
  );
}
