import React from "react";
import "./styles/TeacherRoomManagePage.css";
import { useRoomManagement } from "./hooks/useRoomManagement";

import RoomCard from "./components/RoomCard";
import TabNavigation from "./components/TabNavigation";
import ApprovalPanel from "./components/ApprovalPanel";
import SuppliesPanel from "./components/SuppliesPanel";
import IncidentPanel from "./components/IncidentPanel";
import { DetailModal, RejectModal } from "./components/Modals";

function PageSkeleton() {
  return (
    <div className="trm-wrapper">
      {/* RoomCard skeleton */}
      <div
        className="trm-room-card"
        style={{
          background: "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)",
          minHeight: "120px",
          borderRadius: "16px",
          marginBottom: "16px",
          animation: "trm-pulse 1.4s ease-in-out infinite",
        }}
      />

      {/* TabNavigation skeleton */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "16px",
        }}
      >
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: "42px",
              width: "140px",
              borderRadius: "10px",
              background: "#e2e8f0",
              animation: "trm-pulse 1.4s ease-in-out infinite",
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>

      {/* Panel skeleton */}
      <div
        className="trm-panel"
        style={{
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        {/* Search bar skeleton */}
        <div
          style={{
            height: "44px",
            borderRadius: "10px",
            background: "#e2e8f0",
            animation: "trm-pulse 1.4s ease-in-out infinite",
          }}
        />
        {/* Filter chips skeleton */}
        <div style={{ display: "flex", gap: "8px" }}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                height: "32px",
                width: "110px",
                borderRadius: "999px",
                background: "#e2e8f0",
                animation: "trm-pulse 1.4s ease-in-out infinite",
                animationDelay: `${i * 0.08}s`,
              }}
            />
          ))}
        </div>
        {/* Table rows skeleton */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              height: "52px",
              borderRadius: "8px",
              background: i % 2 === 0 ? "#f1f5f9" : "#e2e8f0",
              animation: "trm-pulse 1.4s ease-in-out infinite",
              animationDelay: `${i * 0.07}s`,
            }}
          />
        ))}
      </div>

      {/* CSS animation nhúng inline để không phụ thuộc file CSS */}
      <style>{`
        @keyframes trm-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

export default function TeacherRoomManagePage() {
  const {
    room,
    managedRooms,
    selectedRoomId,
    setSelectedRoomId,
    supplies,
    suppliesPage,
    setSuppliesPage,
    suppliesTotalPages,
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
    handleOpenDetail,
    loadingDetail,
    chemicalDict,
    rejectTarget,
    setRejectTarget,
    newIncident,
    setNewIncident,
    incidentSent,
    handleIncidentSubmit,
    refreshData,
    page,
    setPage,
    totalPages,
  } = useRoomManagement();

  if (initialLoading) {
    return <PageSkeleton />;
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
      <RoomCard
        room={room}
        pendingCount={pendingCount}
        managedRooms={managedRooms}
        selectedRoomId={selectedRoomId}
        setSelectedRoomId={setSelectedRoomId}
      />
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
          handleOpenDetail={handleOpenDetail}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          tableLoading={tableLoading}
        />
      )}

      {activeTab === "supplies" && (
        <SuppliesPanel
          room={room}
          supplies={supplies}
          suppliesPage={suppliesPage}
          setSuppliesPage={setSuppliesPage}
          suppliesTotalPages={suppliesTotalPages}
        />
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
        loadingDetail={loadingDetail}
        setDetailItem={setDetailItem}
        setRejectTarget={setRejectTarget}
        refreshData={refreshData}
        chemicalDict={chemicalDict}
      />
      <RejectModal
        rejectTarget={rejectTarget}
        setRejectTarget={setRejectTarget}
        refreshData={refreshData}
      />
    </div>
  );
}
