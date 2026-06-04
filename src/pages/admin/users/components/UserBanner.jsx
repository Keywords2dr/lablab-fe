import React from "react";
import { Typography } from "@mui/material";
import { PeopleAlt } from "@mui/icons-material";

export default function UserBanner({ total, totalPages }) {
  return (
    <div className="users-banner">
      <div className="banner-left">
        <div className="banner-icon">
          <PeopleAlt sx={{ fontSize: 38, color: "white" }} />
        </div>
        <div className="banner-text-group">
          <Typography variant="h4" className="banner-title">
            Quản lý Người dùng
          </Typography>
          <Typography variant="body1" className="banner-desc">
            Thêm, chỉnh sửa và quản lý tài khoản người dùng trong hệ thống
          </Typography>
        </div>
      </div>

      <div className="banner-stats">
        <div className="stat-pill">
          <span className="stat-pill-number">{total}</span>
          <span className="stat-pill-label">Tổng người dùng</span>
        </div>
        <div className="stat-pill">
          <span className="stat-pill-number">{totalPages}</span>
          <span className="stat-pill-label">Số trang</span>
        </div>
      </div>
    </div>
  );
}
