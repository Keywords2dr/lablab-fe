import React from "react";
import "./styles/TeacherRoomManagePage.css";
import { useRoomManagement } from "./hooks/useRoomManagement";

import RoomCard from "./components/RoomCard";
import TabNavigation from "./components/TabNavigation";
import ApprovalPanel from "./components/ApprovalPanel";
import SuppliesPanel from "./components/SuppliesPanel";
import IncidentPanel from "./components/IncidentPanel";
import { DetailModal, RejectModal } from "./components/Modals";

export default function TeacherRoomManagePage() {
  const {
    room,
    supplies,
    initialLoading,
    tableLoading,
    activeTab,
    setActiveTab,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    filteredReqs,
    pendingCount,
    detailItem,
    setDetailItem,
    rejectTarget,
    setRejectTarget,
    rejectNote,
    setRejectNote,
    newIncident,
    setNewIncident,
    incidentSent,
    handleApprove,
    handleReject,
    handleActivate,
    handleConfirmReturn,
    handleIncidentSubmit,
    page,
    setPage,
    totalPages,
  } = useRoomManagement();

  if (initialLoading) {
    return (
      <div
        className="trm-wrapper"
        style={{
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
          height: "100vh",
        }}
      >
        <div className="trm-loading-spinner">Đang tải dữ liệu hệ thống...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="trm-wrapper">
        <div className="trm-alert-info">
          Bạn hiện chưa có phòng Lab nào được phân công quản lý. Vui lòng liên
          hệ Admin.
        </div>
      </div>
    );
  }

  return (
    <div className="trm-wrapper">
      <RoomCard room={room} pendingCount={pendingCount} />
      <TabNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingCount}
      />

      {activeTab === "approval" && (
        <ApprovalPanel
          search={search}
          setSearch={setSearch}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filteredReqs={filteredReqs}
          setDetailItem={setDetailItem}
          handleApprove={handleApprove}
          setRejectTarget={setRejectTarget}
          handleActivate={handleActivate}
          handleConfirmReturn={handleConfirmReturn}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          tableLoading={tableLoading}
        />
      )}

      {activeTab === "supplies" && (
        <SuppliesPanel room={room} supplies={supplies} />
      )}
      {activeTab === "incident" && (
        <IncidentPanel
          newIncident={newIncident}
          setNewIncident={setNewIncident}
          incidentSent={incidentSent}
          handleIncidentSubmit={handleIncidentSubmit}
        />
      )}

      <DetailModal
        detailItem={detailItem}
        setDetailItem={setDetailItem}
        handleApprove={handleApprove}
        setRejectTarget={setRejectTarget}
      />
      <RejectModal
        rejectTarget={rejectTarget}
        setRejectTarget={setRejectTarget}
        rejectNote={rejectNote}
        setRejectNote={setRejectNote}
        handleReject={handleReject}
      />
    </div>
  );
}
