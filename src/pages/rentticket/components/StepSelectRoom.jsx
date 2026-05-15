import React from "react";
import "../styles/stepSelectRoom.css";
import {
  MeetingRoomOutlined,
  SearchOutlined,
  LocationOnOutlined,
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
  page,
  setPage,
  totalPages
}) {
  return (
    <div className="ssr-wrapper">
      {/* Search bar nổi bật */}
      <div className="ssr-search-section">
        <div className="ssr-search-box">
          <SearchOutlined className="ssr-search-icon" />
          <input
            className="ssr-search-input"
            placeholder="Tìm theo tên hoặc vị trí phòng…"
            value={roomSearch}
            onChange={(e) => setRoomSearch(e.target.value)}
          />
          {roomSearch && (
            <button className="ssr-search-clear" onClick={() => setRoomSearch("")}>✕</button>
          )}
        </div>
        {!loading && rooms.length > 0 && (
          <div className="ssr-result-count">
            <span className="ssr-count-num">{rooms.length}</span> phòng sẵn sàng
          </div>
        )}
      </div>

      {/* Nội dung */}
      {loading ? (
        <div className="ssr-loading">
          <div className="ssr-loading-rings">
            <div /><div /><div />
          </div>
          <p className="ssr-loading-text">Đang tải danh sách phòng...</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="ssr-empty">
          <div className="ssr-empty-icon"><InboxOutlined /></div>
          <div className="ssr-empty-title">Không tìm thấy phòng nào</div>
          <div className="ssr-empty-sub">Thử tìm kiếm với từ khóa khác</div>
        </div>
      ) : (
        <>
          <div className="ssr-grid">
            {rooms.map((room) => {
              const isSelected = selectedRoom?.id === room.id;
              const displayName = room.name || room.roomName || "Phòng không tên";

              return (
                <div
                  key={room.id}
                  className={`ssr-card${isSelected ? " ssr-card--selected" : ""}${!room.isActive ? " ssr-card--inactive" : ""}`}
                  onClick={() => setSelectedRoom(isSelected ? null : room)}
                >
                  {/* Ribbon trạng thái */}
                  <div className={`ssr-ribbon ${room.isActive ? "ssr-ribbon--active" : "ssr-ribbon--inactive"}`}>
                    <span className="ssr-ribbon-dot" />
                    {room.isActive ? "Sẵn sàng" : "Ngừng HĐ"}
                  </div>

                  {/* Checkmark khi chọn */}
                  {isSelected && (
                    <div className="ssr-check">
                      <CheckCircleOutlined />
                    </div>
                  )}

                  {/* Icon phòng */}
                  <div className="ssr-card-icon-wrap">
                    <div className={`ssr-card-icon${isSelected ? " ssr-card-icon--selected" : ""}`}>
                      <MeetingRoomOutlined />
                    </div>
                  </div>

                  {/* Tên phòng */}
                  <div className="ssr-card-name">{displayName}</div>

                  {/* Giáo viên */}
                  <div className="ssr-card-row">
                    <SupervisorAccountOutlined className="ssr-card-row-icon" />
                    <span className="ssr-card-row-label">GV:</span>
                    <span className="ssr-card-row-value">{room.managerName || "Chưa phân công"}</span>
                  </div>

                  {/* Mô tả */}
                  {room.description && (
                    <div className="ssr-card-desc">
                      <DescriptionOutlined className="ssr-card-desc-icon" />
                      <span>{room.description}</span>
                    </div>
                  )}

                  {/* Footer vị trí */}
                  <div className="ssr-card-footer">
                    <LocationOnOutlined className="ssr-card-footer-icon" />
                    <span>{room.location || "Chưa xác định"}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="ssr-pagination">
              <button
                className="ssr-page-btn"
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
              >
                <NavigateBefore /> Trước
              </button>

              <div className="ssr-page-pills">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`ssr-page-pill${page === i ? " ssr-page-pill--active" : ""}`}
                    onClick={() => setPage(i)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                className="ssr-page-btn"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
              >
                Sau <NavigateNext />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}