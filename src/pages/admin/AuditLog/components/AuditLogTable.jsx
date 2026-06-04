import { MODULE_LABELS, getActionStyle, getRoleStyle } from "../constants/auditLogConstants";

function SkeletonRow() {
  return (
    <tr className="al-skeleton-row">
      {Array(5).fill(0).map((_, i) => (
        <td key={i}><div className="al-skeleton-cell" /></td>
      ))}
    </tr>
  );
}

export default function AuditLogTable({
  loading,
  filteredLogs,
  setSelectedLog,
}) {
  return (
    <div className="al-table-card">
      <div className="al-table-scroll">
        <table className="al-table">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Người dùng</th>
              <th>Hành động</th>
              <th>Phân hệ</th>
              <th>Vai trò</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(10).fill(0).map((_, i) => <SkeletonRow key={i} />)
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="5">
                  <div className="al-empty">Không tìm thấy dữ liệu</div>
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => {
                const actionStyle = getActionStyle(log.action);
                const roleStyle   = getRoleStyle(log.actorRole);
                return (
                  <tr
                    key={log.logId}
                    className="al-row"
                    onClick={() => setSelectedLog(log)}
                  >
                    <td>
                      <div className="al-datetime">
                        <span className="al-date">
                          {new Date(log.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                        <span className="al-time" style={{ marginLeft: "8px" }}>
                          {new Date(log.createdAt).toLocaleTimeString("vi-VN")}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="al-user">
                        <div className="al-avatar">
                          {(log.actorUsername || "?")[0].toUpperCase()}
                        </div>
                        <span>{log.actorUsername || "—"}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className="al-badge"
                        style={{ background: actionStyle.bg, color: actionStyle.color }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <span className="al-module-tag">
                        {MODULE_LABELS[log.entityName] || log.entityName}
                      </span>
                    </td>
                    <td>
                      <span
                        className="al-badge"
                        style={{ background: roleStyle.bg, color: roleStyle.color }}
                      >
                        {log.actorRole}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="al-pagination">
        <span className="al-page-info">
          Hiển thị {filteredLogs.length} bản ghi
        </span>
      </div>
    </div>
  );
}
