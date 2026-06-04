import { MODULE_LABELS, getActionStyle, getRoleStyle } from "./auditLogConstants";
import { parseSafe, renderKV } from "./auditLogHelpers";

export default function AuditLogModal({ log, isOpen, onClose }) {
  if (!isOpen || !log) return null;

  const oldObj      = parseSafe(log.oldData);
  const newObj      = parseSafe(log.newData);
  const actionStyle = getActionStyle(log.action);
  const roleStyle   = getRoleStyle(log.actorRole);

  const metaItems = [
    {
      label: "Thời gian",
      value: log.createdAt ? new Date(log.createdAt).toLocaleString("vi-VN") : "—",
    },
    { label: "Người thực hiện", value: log.actorUsername || "—" },
    {
      label: "Hành động",
      value: (
        <span className="al-badge" style={{ background: actionStyle.bg, color: actionStyle.color }}>
          {log.action}
        </span>
      ),
    },
    {
      label: "Phân hệ",
      value: (
        <span className="al-badge" style={{ background: "#ede9fe", color: "#6d28d9" }}>
          {MODULE_LABELS[log.entityName] || log.entityName || "—"}
        </span>
      ),
    },
    {
      label: "Vai trò",
      value: (
        <span className="al-badge" style={{ background: roleStyle.bg, color: roleStyle.color }}>
          {log.actorRole || "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="al-modal-overlay" onClick={onClose}>
      <div className="al-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="al-modal-header">
          <div className="al-modal-header-left">
            <h2>Chi tiết nhật ký hệ thống</h2>
            {log.logId && (
              <p className="al-modal-subid">
                ID: <span className="al-mono">{log.logId}</span>
              </p>
            )}
          </div>
          <button className="al-modal-close" onClick={onClose}>×</button>
        </div>

        {/* Body */}
        <div className="al-modal-body">
          {/* Meta strip */}
          <div className="al-meta-strip">
            {metaItems.map(({ label, value }) => (
              <div key={label} className="al-meta-cell">
                <span className="al-meta-label">{label}</span>
                <span className="al-meta-value">{value}</span>
              </div>
            ))}
          </div>

          {/* Diff panels */}
          <div className="al-diff-grid">
            <div className="al-diff-panel">
              <div className="al-diff-panel-header al-diff-old">
                <span className="al-diff-icon">−</span>
                <span>Dữ liệu cũ</span>
              </div>
              <div className="al-diff-body">
                {renderKV(oldObj, log.entityName) || (
                  <p className="al-diff-empty">Không có dữ liệu cũ</p>
                )}
              </div>
            </div>

            <div className="al-diff-panel">
              <div className="al-diff-panel-header al-diff-new">
                <span className="al-diff-icon">+</span>
                <span>Dữ liệu mới</span>
              </div>
              <div className="al-diff-body">
                {renderKV(newObj, log.entityName) || (
                  <p className="al-diff-empty">Không có dữ liệu mới</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="al-modal-footer">
          <button className="al-btn-close" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}
