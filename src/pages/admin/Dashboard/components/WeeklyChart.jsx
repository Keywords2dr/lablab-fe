import { BarChart } from "@mui/icons-material";

const LEGEND = [
  { label: "Đã duyệt",    color: "#3b82f6" },
  { label: "Từ chối",     color: "#ef4444" },
  { label: "Đang xử lý", color: "#f59e0b" },
];

function ChartSkeleton() {
  return (
    <div className="adnew-chart adnew-chart-loading">
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div key={i} className="adnew-chart-col">
          <div className="adnew-bar-wrap">
            <div className="adnew-skeleton" style={{ width: "100%", height: "60%", borderRadius: 4 }} />
          </div>
          <span className="adnew-chart-day">—</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Card biểu đồ cột phiếu mượn 7 ngày gần nhất.
 */
export default function WeeklyChart({ weeklyData, loading, maxWeekly }) {
  return (
    <div className="adnew-card">
      <div className="adnew-card-header">
        <div className="adnew-card-title-wrap">
          <BarChart className="adnew-card-icon" style={{ color: "#6366f1" }} />
          <h2 className="adnew-card-title">Phiếu mượn trong tuần</h2>
        </div>
      </div>

      <div className="adnew-chart-legend">
        {LEGEND.map(({ label, color }) => (
          <span key={label} className="adnew-legend-item">
            <span className="adnew-legend-dot" style={{ background: color }} />
            {label}
          </span>
        ))}
      </div>

      {loading ? (
        <ChartSkeleton />
      ) : weeklyData.length === 0 ? (
        <div className="adnew-empty-state" style={{ minHeight: 120 }}>
          <BarChart style={{ fontSize: 36, color: "#cbd5e1", marginBottom: 8 }} />
          <p>Không có dữ liệu thống kê.</p>
        </div>
      ) : (
        <div className="adnew-chart">
          {weeklyData.map((d) => {
            const total = d.approved + d.rejected + d.pending;
            const empty = maxWeekly - total;
            return (
              <div key={d.date ?? d.dayLabel} className="adnew-chart-col">
                <div className="adnew-bar-wrap">
                  <div className="adnew-bar-empty"   style={{ flex: empty > 0 ? empty : 0.01 }} />
                  {d.pending  > 0 && <div className="adnew-bar-pending"  style={{ flex: d.pending }}  title={`Đang xử lý: ${d.pending}`}  />}
                  {d.rejected > 0 && <div className="adnew-bar-rejected" style={{ flex: d.rejected }} title={`Từ chối: ${d.rejected}`}      />}
                  {d.approved > 0 && <div className="adnew-bar-approved" style={{ flex: d.approved }} title={`Đã duyệt: ${d.approved}`}     />}
                </div>
                <span className="adnew-chart-total">{total > 0 ? total : ""}</span>
                <span className="adnew-chart-day">{d.dayLabel}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
