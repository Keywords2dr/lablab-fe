import { FiberManualRecord, AccessTime, Refresh } from "@mui/icons-material";

import { useAdminDashboard } from "./hooks/useAdminDashboard";
import StatsGrid from "./components/StatsGrid";
import TicketPendingCard from "./components/TicketPendingCard";
import ActivityFeed from "./components/ActivityFeed";
import HeroSummaryCard from "./components/HeroSummaryCard";
import WeeklyChart from "./components/WeeklyChart";
import RoomStatusCard from "./components/RoomStatusCard";

import "./styles/index.css";

export default function AdminDashboard() {
  const {
    stats,
    statsLoading,
    tickets,
    ticketsLoading,
    weeklyData,
    weeklyLoading,
    maxWeekly,
    roomUsage,
    roomUsageLoading,
    feedItems,
    feedLoading,
    refresh,
  } = useAdminDashboard();

  return (
    <div className="adnew-root">
      {/* ── Header ── */}
      <div className="adnew-header">
        <div className="adnew-header-left">
          <div className="adnew-greeting-tag">
            <FiberManualRecord className="adnew-live-dot" />
            Hệ thống đang hoạt động
          </div>
          <h1 className="adnew-heading">Tổng Quan Hệ Thống</h1>
          <p className="adnew-subheading">
            Chào mừng trở lại, Admin! Dưới đây là tình trạng hệ thống hôm nay.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="adnew-refresh-btn" onClick={refresh}>
            <Refresh style={{ fontSize: 16 }} /> Làm mới
          </button>
          <div className="adnew-header-time">
            <AccessTime style={{ fontSize: 16 }} />
            {new Date().toLocaleDateString("vi-VN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <StatsGrid stats={stats} statsLoading={statsLoading} />

      {/* ── Main body ── */}
      <div className="adnew-body">
        {/* Cột trái */}
        <div className="adnew-col-main">
          <TicketPendingCard tickets={tickets} loading={ticketsLoading} />
          <ActivityFeed feedItems={feedItems} loading={feedLoading} />
        </div>

        {/* Cột phải */}
        <div className="adnew-col-side">
          <HeroSummaryCard stats={stats} statsLoading={statsLoading} />
          <WeeklyChart
            weeklyData={weeklyData}
            loading={weeklyLoading}
            maxWeekly={maxWeekly}
          />
          <RoomStatusCard roomUsage={roomUsage} loading={roomUsageLoading} />
        </div>
      </div>
    </div>
  );
}
