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

function ManagerShimmer() {
  return (
    <span
      style={{
        display: "inline-block",
        width: 90,
        height: 10,
        borderRadius: 4,
        background:
          "linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer-slide 1.4s ease-in-out infinite",
        verticalAlign: "middle",
      }}
    />
  );
}

export default function StepSelectRoom({
  rooms,
  loading,
  roomSearch,
  setRoomSearch,
  selectedRoom,
  setSelectedRoom,
  page,
  setPage,
  totalPages,
}) {
  return (
    <div className="ssr-wrapper">
      <style>{`
        @keyframes shimmer-slide {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes ssr-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.45; }
        }
      `}</style>

      {/* Search bar */}
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
            <button
              className="ssr-search-clear"
              onClick={() => setRoomSearch("")}
            >
              ✕
            </button>
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
        <div className="ssr-grid">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              style={{
                borderRadius: 14,
                border: "1px solid #f1f5f9",
                padding: "20px 16px",
                background: "#fff",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                animation: `ssr-pulse 1.4s ease-in-out infinite`,
                animationDelay: `${i * 0.08}s`,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "#f1f5f9",
                  margin: "0 auto 4px",
                }}
              />
              <div
                style={{
                  height: 14,
                  width: "65%",
                  borderRadius: 4,
                  background: "#f1f5f9",
                  margin: "0 auto",
                }}
              />
              <div
                style={{
                  height: 10,
                  width: "80%",
                  borderRadius: 4,
                  background: "#f8fafc",
                  margin: "0 auto",
                }}
              />
              <div
                style={{
                  height: 10,
                  width: "50%",
                  borderRadius: 4,
                  background: "#f8fafc",
                  margin: "0 auto",
                }}
              />
            </div>
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="ssr-empty">
          <div className="ssr-empty-icon">
            <InboxOutlined />
          </div>
          <div className="ssr-empty-title">Không tìm thấy phòng nào</div>
          <div className="ssr-empty-sub">Thử tìm kiếm với từ khóa khác</div>
        </div>
      ) : (
        <>
          <div className="ssr-grid">
            {rooms.map((room) => {
              const isSelected = selectedRoom?.id === room.id;
              const displayName =
                room.name ?? room.roomName ?? "Phòng không tên";
              // null = đang load, "" = không có GV, string = có GV
              const managerPending = room.managerName === null;

              return (
                <div
                  key={room.id}
                  className={`ssr-card${isSelected ? " ssr-card--selected" : ""}${!room.isActive ? " ssr-card--inactive" : ""}`}
                  onClick={() => setSelectedRoom(isSelected ? null : room)}
                >
                  {/* Ribbon trạng thái */}
                  <div
                    className={`ssr-ribbon ${room.isActive ? "ssr-ribbon--active" : "ssr-ribbon--inactive"}`}
                  >
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
                    <div
                      className={`ssr-card-icon${isSelected ? " ssr-card-icon--selected" : ""}`}
                    >
                      <MeetingRoomOutlined />
                    </div>
                  </div>

                  {/* Tên phòng */}
                  <div className="ssr-card-name">{displayName}</div>

                  {/* Giảng viên: shimmer khi null, tên hoặc "Chưa phân công" khi đã có */}
                  <div className="ssr-card-row">
                    <SupervisorAccountOutlined className="ssr-card-row-icon" />
                    <span className="ssr-card-row-label">GV:</span>
                    {managerPending ? (
                      <ManagerShimmer />
                    ) : (
                      <span className="ssr-card-row-value">
                        {room.managerName || "Chưa phân công"}
                      </span>
                    )}
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
                    <span>{room.location ?? "Chưa xác định"}</span>
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
                onClick={() => setPage((p) => p - 1)}
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
                onClick={() => setPage((p) => p + 1)}
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
