import React from "react";
import {
  MeetingRoomOutlined,
  SearchOutlined,
  LocationOnOutlined,
  PeopleAltOutlined,
  CheckCircleOutlined,
  InboxOutlined,
  SupervisorAccountOutlined,
  DescriptionOutlined,
  NavigateNext,
  NavigateBefore,
} from "@mui/icons-material";

export default function StepSelectRoom({
  rooms,
  loading,
  roomSearch,
  setRoomSearch,
  selectedRoom,
  setSelectedRoom,
  // Thêm props mới
  page,
  setPage,
  totalPages
}) {
  return (
    <div className="rr-card">
      {/* Header & Search Bar giữ nguyên */}
      <div className="rr-card-header">
        <div className="rr-card-header-icon"><MeetingRoomOutlined /></div>
        <div className="rr-card-header-text">
          <h3>Chọn phòng Lab</h3>
          <p>Danh sách các phòng thí nghiệm đang sẵn sàng phục vụ.</p>
        </div>
      </div>

      <div className="rr-card-body">
        <div className="rr-search-bar">
          <div className="rr-search-input-wrap">
            <SearchOutlined />
            <input
              className="rr-search-input"
              placeholder="Tìm theo tên hoặc vị trí phòng…"
              value={roomSearch}
              onChange={(e) => setRoomSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="rr-loading">
            <div className="rr-spinner" />
            <span className="rr-loading-text">Đang tải dữ liệu...</span>
          </div>
        ) : rooms.length === 0 ? (
          <div className="rr-empty">
            <InboxOutlined />
            <div className="rr-empty-title">Không tìm thấy phòng nào</div>
          </div>
        ) : (
          <>
            <div className="rr-room-grid">
              {rooms.map((room) => {
                const isSelected = selectedRoom?.id === room.id;
                const displayName = room.name || room.roomName || "Phòng không tên";

                return (
                  <div
                    key={room.id}
                    className={`rr-room-card${isSelected ? " selected" : ""}`}
                    onClick={() => setSelectedRoom(isSelected ? null : room)}
                  >
                    {isSelected && <div className="rr-check-mark"><CheckCircleOutlined /></div>}
                    <div className="rr-room-card-top">
                      <div className="rr-room-icon"><MeetingRoomOutlined /></div>
                      <span className={`rr-room-badge ${room.isActive ? "" : "inactive"}`}>
                        {room.isActive ? "HOẠT ĐỘNG" : "NGỪNG HĐ"}
                      </span>
                    </div>

                    <div className="rr-room-name" style={{ fontWeight: 'bold', fontSize: '1.1rem', margin: '8px 0 4px 0' }}>
                      {displayName}
                    </div>

                    <div className="rr-room-info-item" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: '#1e293b', marginBottom: 4 }}>
                      <SupervisorAccountOutlined style={{ fontSize: 16, color: '#3b82f6' }} />
                      <span>GV: <strong>{room.managerName || "Chưa phân công"}</strong></span>
                    </div>

                    {room.description && (
                      <div className="rr-room-info-item desc-box">
                        <DescriptionOutlined style={{ fontSize: 14 }} />
                        <span className="line-clamp-2">{room.description}</span>
                      </div>
                    )}

                    <div className="rr-room-info-item location-footer">
                      <LocationOnOutlined style={{ fontSize: 14 }} />
                      <span>{room.location || "Chưa xác định vị trí"}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* BỘ PHÂN TRANG (PAGINATION) */}
            {totalPages > 1 && (
              <div className="rr-pagination" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '15px',
                marginTop: '30px',
                padding: '10px'
              }}>
                <button 
                  className="rr-btn-page"
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                  style={{ opacity: page === 0 ? 0.5 : 1, cursor: page === 0 ? 'not-allowed' : 'pointer' }}
                >
                  <NavigateBefore /> Trước
                </button>
                
                <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>
                  Trang {page + 1} / {totalPages}
                </span>

                <button 
                  className="rr-btn-page"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                  style={{ opacity: page >= totalPages - 1 ? 0.5 : 1, cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer' }}
                >
                  Sau <NavigateNext />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}