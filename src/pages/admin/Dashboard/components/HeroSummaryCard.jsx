import { useNavigate } from "react-router-dom";
import { ArrowForward, MeetingRoom, PeopleAlt, Inventory2 } from "@mui/icons-material";

/**
 * Hero card bên cột phải — hiển thị tổng quan nhanh số phiếu + stats.
 */
export default function HeroSummaryCard({ stats, statsLoading }) {
  const navigate = useNavigate();

  return (
    <div className="adnew-hero-card">
      <div className="adnew-hero-bg-orb" />
      <div className="adnew-hero-content">
        <p className="adnew-hero-label">Phiếu chờ Admin duyệt</p>
        <div className="adnew-hero-number">
          {statsLoading ? "—" : stats.pendingCount}
        </div>

        <div className="adnew-hero-stats">
          <div className="adnew-hero-stat">
            <MeetingRoom style={{ fontSize: 14 }} />
            <span>{statsLoading ? "—" : stats.activeRooms} phòng đang hoạt động</span>
          </div>
          <div className="adnew-hero-stat">
            <PeopleAlt style={{ fontSize: 14 }} />
            <span>{statsLoading ? "—" : stats.totalUsers} người dùng</span>
          </div>
          <div className="adnew-hero-stat red">
            <Inventory2 style={{ fontSize: 14 }} />
            <span>{statsLoading ? "—" : stats.lowStockCount} hóa chất hết hàng</span>
          </div>
        </div>

        <button className="adnew-hero-btn" onClick={() => navigate("/admin/tickets")}>
          Quản lý phiếu mượn <ArrowForward style={{ fontSize: 14 }} />
        </button>
      </div>
    </div>
  );
}
