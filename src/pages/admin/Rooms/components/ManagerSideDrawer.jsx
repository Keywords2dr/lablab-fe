import React, { useState, useEffect, useRef } from "react";
import {
  Close,
  Search,
  PersonRemove,
  CheckCircle,
  PersonAddAlt1,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import Avatar from "./Avatar";

const RE_USER_SEARCH = /^[\p{L}\p{N}\s@._-]*$/u;
const filterUserSearch = (val) =>
  [...val].filter((ch) => RE_USER_SEARCH.test(ch)).join("");

export default function ManagerSideDrawer({
  room,
  managers,
  assignableTeachers,
  loadingMap,
  onClose,
  onFetchAssignableTeachers,
  onAssign,
  onRemove,
}) {
  const [isClosing, setIsClosing] = useState(false);
  const [search, setSearch] = useState("");
  const [assigning, setAssigning] = useState(null);

  const isComposing = useRef(false);
  const searchTimer = useRef(null);

  // Fetch assignable teachers when room changes
  useEffect(() => {
    if (room) {
      onFetchAssignableTeachers(room.roomId, "");
      setSearch("");
    }
  }, [room, onFetchAssignableTeachers]);

  const commitSearch = (val) => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      if (room) onFetchAssignableTeachers(room.roomId, val);
    }, 400);
  };

  const handleSearchChange = (e) => {
    const filtered = filterUserSearch(e.target.value);
    setSearch(filtered);
    if (!isComposing.current) commitSearch(filtered);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300); // Wait for slideOutRight animation to finish
  };

  const handleAssign = async (teacher) => {
    if (!room) return;
    const displayName = teacher.fullName || teacher.username;
    setAssigning(teacher.userId);
    try {
      await onAssign(room.roomId, teacher.userId);
      toast.success(`Đã gán ${displayName} làm quản lý`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setAssigning(null);
    }
  };

  const handleRemove = async (manager) => {
    if (!room) return;
    const displayName = manager.fullName || manager.username;
    if (window.confirm(`Gỡ "${displayName}" khỏi quản lý phòng này?`)) {
      try {
        await onRemove(room.roomId, manager.userId);
        toast.success(`Đã xóa ${displayName}`);
      } catch (err) {
        toast.error(err.response?.data?.message || err.message);
      }
    }
  };

  if (!room) return null;

  const currentManagers = managers || [];
  const currentAssignable = assignableTeachers || [];
  const isLoadingManagers = loadingMap?.[room.roomId];

  return (
    <div
      className={`rm-drawer-overlay ${isClosing ? "rm-drawer-overlay--closing" : ""}`}
      onClick={handleClose}
    >
      <div
        className={`rm-drawer ${isClosing ? "rm-drawer--closing" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="rm-drawer-header">
          <div>
            <div className="rm-drawer-title">{room.roomName}</div>
            <div className="rm-drawer-sub">Chi tiết phân quyền quản lý</div>
          </div>
          <button className="rm-drawer-close" onClick={handleClose}>
            <Close />
          </button>
        </div>

        {/* Body */}
        <div className="rm-drawer-body">
          {/* Section: Current Managers */}
          <div className="rm-drawer-section">
            <div className="rm-ds-title">
              <CheckCircle style={{ fontSize: 16, color: "#10b981" }} />
              Quản lý hiện tại
              <span className="rm-ds-badge">{currentManagers.length}</span>
            </div>

            {isLoadingManagers ? (
              <div className="rm-current-list">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rm-manager-row">
                    <div className="skeleton skeleton-avatar" style={{ width: 42, height: 42 }}></div>
                    <div className="rm-mr-info">
                      <div className="skeleton skeleton-text" style={{ width: '50%' }}></div>
                      <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : currentManagers.length === 0 ? (
              <div className="rm-empty-state" style={{ padding: "20px" }}>
                Phòng này chưa có người quản lý nào.
              </div>
            ) : (
              <div className="rm-current-list">
                {currentManagers.map((m) => (
                  <div key={m.userId} className="rm-manager-row">
                    <Avatar name={m.fullName || m.username} size={42} />
                    <div className="rm-mr-info">
                      <div className="rm-mr-name">{m.fullName || m.username}</div>
                      <div className="rm-mr-email">{m.email || m.username}</div>
                    </div>
                    <button
                      className="rm-btn-remove"
                      title="Gỡ quyền"
                      onClick={() => handleRemove(m)}
                    >
                      <PersonRemove style={{ fontSize: 18 }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Add Manager */}
          <div className="rm-drawer-section" style={{ borderBottom: "none" }}>
            <div className="rm-ds-title" style={{ color: "#6366f1" }}>
              <PersonAddAlt1 style={{ fontSize: 18 }} />
              Thêm giáo viên quản lý
            </div>

            <div className="rm-command-palette">
              <input
                type="text"
                className="rm-cp-input"
                placeholder="Tìm tên, username, email..."
                value={search}
                onChange={handleSearchChange}
                onCompositionStart={() => {
                  isComposing.current = true;
                }}
                onCompositionEnd={(e) => {
                  isComposing.current = false;
                  const filtered = filterUserSearch(e.target.value);
                  setSearch(filtered);
                  commitSearch(filtered);
                }}
              />
              <Search className="rm-cp-icon" />
              {search && (
                <button
                  className="rm-cp-clear"
                  onClick={() => {
                    setSearch("");
                    onFetchAssignableTeachers(room.roomId, "");
                  }}
                >
                  <Close style={{ fontSize: 16 }} />
                </button>
              )}
            </div>

            <div className="rm-available-list">
              {currentAssignable.length === 0 ? (
                <div className="rm-empty-state" style={{ padding: "20px" }}>
                  {search ? "Không tìm thấy giáo viên phù hợp." : "Không còn giáo viên nào có thể gán."}
                </div>
              ) : (
                currentAssignable.map((t) => (
                  <div key={t.userId} className="rm-teacher-card">
                    <Avatar name={t.fullName || t.username} size={38} />
                    <div className="rm-mr-info">
                      <div className="rm-mr-name">{t.fullName || t.username}</div>
                      <div className="rm-mr-email">{t.email || t.username}</div>
                    </div>
                    <button
                      className="rm-btn-assign"
                      disabled={assigning === t.userId}
                      onClick={() => handleAssign(t)}
                    >
                      {assigning === t.userId ? "Đang gán..." : "Gán"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
