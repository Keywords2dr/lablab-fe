import React, { useRef, useState } from "react";
import {
  ManageAccounts,
  WarningAmberRounded,
  CheckCircle,
} from "@mui/icons-material";
import Avatar from "./Avatar";

export default function ManagerGridCard({ room, managers, onClick, isActive }) {
  // 3D Tilt Effect State — hooks must be called unconditionally before any early return
  const cardRef = useRef(null);
  const [transform, setTransform] = useState("");

  // If room is null, render a full skeleton card
  if (!room) {
    return (
      <div className="rm-grid-card">
        <div className="rm-gc-header">
          <div
            className="skeleton skeleton-avatar"
            style={{ borderRadius: "14px", width: "48px", height: "48px" }}
          ></div>
          <div className="skeleton skeleton-badge"></div>
        </div>
        <div
          className="skeleton skeleton-text"
          style={{ width: "80%", height: "20px", marginBottom: "10px" }}
        ></div>
        <div
          className="skeleton skeleton-text skeleton-text-short"
          style={{ marginBottom: "20px" }}
        ></div>
        <div className="rm-gc-avatars" style={{ marginTop: "auto" }}>
          <div style={{ display: "flex" }}>
            <div className="skeleton skeleton-avatar"></div>
            <div
              className="skeleton skeleton-avatar"
              style={{ marginLeft: "-12px" }}
            ></div>
            <div
              className="skeleton skeleton-avatar"
              style={{ marginLeft: "-12px" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  const isLoading = managers === undefined;
  const mgrList = managers || [];
  const hasManagers = mgrList.length > 0;

  // Render overlapping avatars
  const maxDisplay = 3;
  const displayMgrs = mgrList.slice(0, maxDisplay);
  const remaining = mgrList.length - maxDisplay;

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -5; // max 5 deg rotation
    const rotateY = ((x - centerX) / centerX) * 5;

    setTransform(
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
    );
  };

  const handleMouseLeave = () => {
    setTransform(""); // Reset to default
  };

  return (
    <div
      ref={cardRef}
      className={`rm-grid-card ${isActive ? "rm-grid-card--active" : ""}`}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transform,
        transition: transform ? "none" : "transform 0.4s ease-out",
      }}
    >
      <div className="rm-gc-header">
        <div className="rm-gc-icon">
          <ManageAccounts />
        </div>
        {isLoading ? (
          <div className="skeleton skeleton-badge"></div>
        ) : hasManagers ? (
          <div className="rm-gc-status rm-gc-status--ok">
            <CheckCircle style={{ fontSize: 14 }} /> Đã phân quyền
          </div>
        ) : (
          <div className="rm-gc-status rm-gc-status--warn">
            <WarningAmberRounded style={{ fontSize: 14 }} /> Chưa có QL
          </div>
        )}
      </div>

      <div className="rm-gc-name" title={room.roomName}>
        {room.roomName}
      </div>
      <div className="rm-gc-sub" title={room.description || "Phòng thí nghiệm"}>
        {room.description || "Phòng thí nghiệm"}
      </div>

      <div className="rm-gc-avatars">
        {isLoading ? (
          <div style={{ display: "flex", gap: "4px" }}>
            <div className="skeleton skeleton-avatar"></div>
            <div
              className="skeleton skeleton-avatar"
              style={{ marginLeft: "-12px" }}
            ></div>
            <div
              className="skeleton skeleton-avatar"
              style={{ marginLeft: "-12px" }}
            ></div>
          </div>
        ) : hasManagers ? (
          <>
            <div style={{ display: "flex" }}>
              {displayMgrs.map((m) => (
                <div
                  key={m.userId}
                  className="rm-gc-avatar-wrap"
                  title={m.fullName || m.username}
                >
                  <Avatar name={m.fullName || m.username} size={36} />
                </div>
              ))}
              {remaining > 0 && (
                <div className="rm-gc-avatars-more">+{remaining}</div>
              )}
            </div>
            <div className="rm-gc-avatar-names">
              {mgrList.map((m) => m.fullName || m.username).join(", ")}
            </div>
          </>
        ) : !isLoading && !hasManagers ? (
          <div className="rm-gc-empty-managers">Chưa có người quản lý</div>
        ) : null}
      </div>
    </div>
  );
}
