import { useNavigate } from "react-router-dom";
import { getStatsConfig } from "../constants/dashboardConstants";

export default function StatsGrid({ stats, statsLoading }) {
  const navigate    = useNavigate();
  const statsConfig = getStatsConfig(stats, statsLoading);

  return (
    <div className="adnew-stats-grid">
      {statsConfig.map((s) => (
        <div
          key={s.id}
          className={`adnew-stat-card adnew-stat-${s.color} ${statsLoading ? "adnew-stat-loading" : ""}`}
          onClick={() => navigate(s.path)}
        >
          <div className="adnew-stat-icon">{s.icon}</div>
          <div className="adnew-stat-body">
            <span className="adnew-stat-label">{s.label}</span>
            <span className="adnew-stat-value">
              {statsLoading ? <span className="adnew-skeleton" /> : s.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
