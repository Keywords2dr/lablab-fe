import React, { useState, useEffect, useRef } from "react";
import {
  PersonAdd,
  PersonRemove,
  Search,
  Close,
  ManageAccounts,
  CheckCircle,
  WarningAmberRounded,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import Avatar from "./Avatar";

const RE_ROOM_SEARCH = /^[\p{L}\p{N}\s]*$/u;
const filterRoomSearch = (val) =>
  [...val].filter((ch) => RE_ROOM_SEARCH.test(ch)).join("");

const RE_USER_SEARCH = /^[\p{L}\p{N}\s@._-]*$/u;
const filterUserSearch = (val) =>
  [...val].filter((ch) => RE_USER_SEARCH.test(ch)).join("");

function ConfirmDialog({
  open,
  title,
  message,
  variant = "assign",
  onConfirm,
  onCancel,
}) {
  if (!open) return null;
  const isRemove = variant === "remove";
  return (
    <div className="rm-dialog-overlay" onClick={onCancel} role="presentation">
      <div
        className="rm-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rm-dialog-title"
      >
        <div className={`rm-dialog-icon rm-dialog-icon--${variant}`}>
          {isRemove ? <WarningAmberRounded /> : <PersonAdd />}
        </div>
        <div className="rm-dialog-title" id="rm-dialog-title">
          {title}
        </div>
        <div className="rm-dialog-message">{message}</div>
        <div className="rm-dialog-actions">
          <button className="rm-btn--ghost" onClick={onCancel}>
            Hủy
          </button>
          <button
            className={`rm-btn--confirm${isRemove ? " rm-btn--danger" : ""}`}
            onClick={onConfirm}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Panel ────────────────────────────────────────────────────────────────
export default function ManagerAssignPanel({
  rooms,
  managers,
  assignableTeachers,
  loading,
  onFetchManagers,
  onFetchAssignableTeachers,
  onAssign,
  onRemove,
}) {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomSearch, setRoomSearch] = useState("");
  const [search, setSearch] = useState("");
  const [assigning, setAssigning] = useState(null);

  // Dialog state
  const [dialog, setDialog] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const isComposing = useRef(false);
  const searchTimer = useRef(null);

  useEffect(() => {
    if (rooms.length === 0) return;
    rooms.forEach((room) => {
      if (managers[room.roomId] === undefined) {
        onFetchManagers(room.roomId);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms]);

  useEffect(() => {
    if (selectedRoom) {
      onFetchManagers(selectedRoom.roomId);
      onFetchAssignableTeachers(selectedRoom.roomId, "");
      setSearch("");
    }
  }, [selectedRoom, onFetchManagers, onFetchAssignableTeachers]);

  const commitSearch = (val) => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      if (selectedRoom) onFetchAssignableTeachers(selectedRoom.roomId, val);
    }, 400);
  };

  const closeDialog = () =>
    setDialog({ open: false, title: "", message: "", onConfirm: null });

  // ── Assign with confirm ───────────────────────────────────────────────────
  const handleAssign = (teacher) => {
    if (!selectedRoom) return;
    const displayName = teacher.fullName || teacher.username;
    setDialog({
      open: true,
      variant: "assign",
      title: "Xác nhận gán quản lý",
      message: `Gán "${displayName}" làm quản lý phòng "${selectedRoom.roomName}"?`,
      onConfirm: async () => {
        closeDialog();
        setAssigning(teacher.userId);
        try {
          await onAssign(selectedRoom.roomId, teacher.userId);
          toast.success(`Đã gán ${displayName} làm quản lý`);
        } catch (err) {
          toast.error(err.response?.data?.message || err.message);
        } finally {
          setAssigning(null);
        }
      },
    });
  };

  // ── Remove with confirm ───────────────────────────────────────────────────
  const handleRemove = (manager) => {
    if (!selectedRoom) return;
    const displayName = manager.fullName || manager.username;
    setDialog({
      open: true,
      variant: "remove",
      title: "Xác nhận gỡ quản lý",
      message: `Gỡ "${displayName}" khỏi vai trò quản lý phòng "${selectedRoom.roomName}"?`,
      onConfirm: async () => {
        closeDialog();
        try {
          await onRemove(selectedRoom.roomId, manager.userId);
          toast.success(`Đã xóa ${displayName} khỏi phòng`);
        } catch (err) {
          toast.error(err.response?.data?.message || err.message);
        }
      },
    });
  };

  const handleRoomSearchChange = (e) => {
    const filtered = filterRoomSearch(e.target.value);
    setRoomSearch(filtered);
  };

  const handleTeacherSearchChange = (e) => {
    const filtered = filterUserSearch(e.target.value);
    setSearch(filtered);
    if (!isComposing.current) commitSearch(filtered);
  };

  const filteredRooms = roomSearch.trim()
    ? rooms.filter((r) =>
        r.roomName.toLowerCase().includes(roomSearch.toLowerCase()),
      )
    : rooms;

  const currentManagers = selectedRoom
    ? (managers[selectedRoom.roomId] ?? [])
    : [];
  const currentAssignable = selectedRoom
    ? (assignableTeachers[selectedRoom.roomId] ?? [])
    : [];

  return (
    <>
      <div className="mgr-panel">
        {/* ── LEFT: Room List ── */}
        <div className="mgr-room-list">
          {/* Header */}
          <div className="mgr-room-list-header">
            <div className="mgr-section-title">
              <ManageAccounts fontSize="small" /> Chọn phòng
            </div>
            <span className="mgr-room-count-badge">{rooms.length}</span>
          </div>

          {/* Search phòng */}
          <div className="mgr-room-search">
            <Search fontSize="small" />
            <input
              placeholder="Tìm tên phòng..."
              value={roomSearch}
              onChange={handleRoomSearchChange}
            />
            {roomSearch && (
              <button
                className="mgr-search-clear"
                onClick={() => setRoomSearch("")}
                style={{ marginLeft: "auto" }}
              >
                <Close fontSize="small" />
              </button>
            )}
          </div>

          {/* Scrollable list */}
          <div className="mgr-room-scroll">
            {filteredRooms.length === 0 ? (
              <div className="mgr-room-empty">Không tìm thấy phòng</div>
            ) : (
              filteredRooms.map((room) => {
                const isLoading = managers[room.roomId] === undefined;
                const count = (managers[room.roomId] ?? []).length;
                return (
                  <div
                    key={room.roomId}
                    className={`mgr-room-item${selectedRoom?.roomId === room.roomId ? " active" : ""}`}
                    onClick={() => setSelectedRoom(room)}
                  >
                    {/* Icon phòng */}
                    <div className="mgr-room-icon">
                      <ManageAccounts fontSize="small" />
                    </div>

                    {/* Text */}
                    <div className="mgr-room-item-body">
                      <div className="mgr-room-item-name">{room.roomName}</div>
                      <div className="mgr-room-item-sub">
                        {room.description || "Phòng thí nghiệm"}
                      </div>
                    </div>

                    {/* Badge số quản lý */}
                    <span
                      className={`mgr-mgr-count${
                        isLoading ? " loading" : count === 0 ? " none" : ""
                      }`}
                    >
                      {isLoading ? "..." : `${count} QL`}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT: Assign Area ── */}
        <div className="mgr-assign-area">
          {!selectedRoom ? (
            <div className="mgr-placeholder">
              <ManageAccounts style={{ fontSize: 64, color: "#cbd5e1" }} />
              <p>Chọn một phòng để quản lý phân quyền</p>
            </div>
          ) : (
            <>
              {/* Room header */}
              <div className="mgr-assign-header">
                <div>
                  <div className="mgr-assign-room-name">
                    {selectedRoom.roomName}
                  </div>
                </div>
                <button
                  className="mgr-close-btn"
                  onClick={() => setSelectedRoom(null)}
                >
                  <Close />
                </button>
              </div>

              <div className="mgr-section-label">
                <CheckCircle fontSize="small" style={{ color: "#10b981" }} />
                Quản lý hiện tại ({currentManagers.length})
              </div>

              {loading[selectedRoom.roomId] ? (
                <p className="mgr-loading-text">Đang tải...</p>
              ) : currentManagers.length === 0 ? (
                <div className="mgr-no-manager">Phòng này chưa có quản lý</div>
              ) : (
                <div className="mgr-manager-list">
                  {currentManagers.map((m) => (
                    <div key={m.userId} className="mgr-manager-card">
                      <Avatar name={m.fullName || m.username} size={40} />
                      <div className="mgr-manager-info">
                        <div className="mgr-manager-name">
                          {m.fullName || m.username}
                        </div>
                        <div className="mgr-manager-email">
                          {m.email || m.username}
                        </div>
                      </div>
                      <button
                        className="mgr-remove-btn"
                        title="Xóa khỏi phòng"
                        onClick={() => handleRemove(m)}
                      >
                        <PersonRemove fontSize="small" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Manager */}
              <div className="mgr-section-label" style={{ marginTop: 20 }}>
                <PersonAdd fontSize="small" style={{ color: "#6366f1" }} />
                Thêm giáo viên làm quản lý
              </div>

              <div className="mgr-search-wrap">
                <Search className="mgr-search-icon" />
                <input
                  placeholder="Tìm tên, username, email..."
                  value={search}
                  onCompositionStart={() => {
                    isComposing.current = true;
                  }}
                  onCompositionEnd={(e) => {
                    isComposing.current = false;
                    const filtered = filterUserSearch(e.target.value);
                    setSearch(filtered);
                    commitSearch(filtered);
                  }}
                  onChange={handleTeacherSearchChange}
                />
                {search && (
                  <button
                    className="mgr-search-clear"
                    onClick={() => {
                      setSearch("");
                      if (selectedRoom)
                        onFetchAssignableTeachers(selectedRoom.roomId, "");
                    }}
                  >
                    <Close />
                  </button>
                )}
              </div>

              <div className="mgr-lecturer-list">
                {currentAssignable.length === 0 ? (
                  <p className="mgr-no-result">
                    {search
                      ? "Không tìm thấy giáo viên phù hợp"
                      : "Không còn giáo viên nào có thể gán"}
                  </p>
                ) : (
                  currentAssignable.map((t) => (
                    <div key={t.userId} className="mgr-lecturer-card">
                      <Avatar name={t.fullName || t.username} size={36} />
                      <div className="mgr-manager-info">
                        <div className="mgr-manager-name">
                          {t.fullName || t.username}
                        </div>
                        <div className="mgr-manager-email">
                          {t.email || t.username}
                        </div>
                      </div>
                      <button
                        className="mgr-add-btn"
                        disabled={assigning === t.userId}
                        onClick={() => handleAssign(t)}
                      >
                        <PersonAdd fontSize="small" />
                        {assigning === t.userId ? "..." : "Gán"}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={dialog.open}
        title={dialog.title}
        message={dialog.message}
        variant={dialog.variant}
        onConfirm={dialog.onConfirm}
        onCancel={closeDialog}
      />
    </>
  );
}
