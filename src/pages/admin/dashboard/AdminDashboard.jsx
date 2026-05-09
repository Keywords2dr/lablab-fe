import React from "react";
import { Grid, Typography } from "@mui/material";
import {
  AssignmentLate, Inventory, PeopleAlt, ReportProblem,
  CheckCircle, Cancel,
} from "@mui/icons-material";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  return (
    <div className="content-area">
      <Typography variant="h5" fontWeight="800" color="#0f172a" mb={4}>
        Tổng quan Hệ thống
      </Typography>

      <Grid container spacing={3} mb={6}>
        <Grid item xs={12} sm={6} md={3}>
          <div className="admin-card">
            <div className="ac-info"><h4>CHỜ PHÊ DUYỆT</h4><h2>12</h2></div>
            <div className="ac-icon orange"><AssignmentLate fontSize="large" /></div>
          </div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <div className="admin-card">
            <div className="ac-info"><h4>VẬT TƯ ĐANG MƯỢN</h4><h2>85</h2></div>
            <div className="ac-icon blue"><Inventory fontSize="large" /></div>
          </div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <div className="admin-card">
            <div className="ac-info"><h4>TỔNG NGƯỜI DÙNG</h4><h2>450</h2></div>
            <div className="ac-icon green"><PeopleAlt fontSize="large" /></div>
          </div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <div className="admin-card">
            <div className="ac-info"><h4>CẢNH BÁO VẬT TƯ</h4><h2>3</h2></div>
            <div className="ac-icon red"><ReportProblem fontSize="large" /></div>
          </div>
        </Grid>
      </Grid>

      <Typography variant="h6" fontWeight="700" color="#0f172a" mb={2}>
        Yêu cầu cần xử lý ngay
      </Typography>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã Phiếu</th>
              <th>Người Yêu Cầu</th>
              <th>Chi tiết mượn</th>
              <th>Khung giờ sử dụng</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>PM089</strong></td>
              <td>
                <div style={{ fontWeight: 600, color: "#0f172a" }}>Nguyễn Văn A</div>
                <span className="role-badge teacher">GIẢNG VIÊN</span>
              </td>
              <td>
                <div style={{ fontWeight: 600 }}>Phòng Thực Hành Hóa 01</div>
                <div style={{ fontSize: "0.85rem", color: "#64748b" }}>Đăng ký dạy thực hành</div>
              </td>
              <td>
                <div style={{ fontWeight: 600 }}>20/04/2026</div>
                <div style={{ color: "#2563eb", fontSize: "0.85rem", fontWeight: 600 }}>Ca Sáng (07:30 - 11:30)</div>
              </td>
              <td>
                <button className="action-btn btn-approve"><CheckCircle fontSize="small" /> Duyệt</button>
                <button className="action-btn btn-reject"><Cancel fontSize="small" /> Từ chối</button>
              </td>
            </tr>
            <tr>
              <td><strong>PM090</strong></td>
              <td>
                <div style={{ fontWeight: 600, color: "#0f172a" }}>Trần Thị B</div>
                <span className="role-badge student">SINH VIÊN</span>
              </td>
              <td>
                <div style={{ fontWeight: 600 }}>Axit Sunfuric (H2SO4) x2 Lít</div>
                <div style={{ fontSize: "0.85rem", color: "#64748b" }}>Dùng cho báo cáo đồ án</div>
              </td>
              <td>
                <div style={{ fontWeight: 600 }}>22/04/2026</div>
                <div style={{ color: "#2563eb", fontSize: "0.85rem", fontWeight: 600 }}>Ca Chiều (13:30 - 17:00)</div>
              </td>
              <td>
                <button className="action-btn btn-approve"><CheckCircle fontSize="small" /> Duyệt</button>
                <button className="action-btn btn-reject"><Cancel fontSize="small" /> Từ chối</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

