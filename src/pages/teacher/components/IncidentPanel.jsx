import React from "react";
import {
  CheckCircle,
  ReportProblem,
  Build,
  Person,
  CalendarToday,
} from "@mui/icons-material";
import "../styles/IncidentPanel.css";

export default function IncidentPanel({
  newIncident,
  setNewIncident,
  incidentSent,
  handleIncidentSubmit,
  incidents = [],
}) {
  return (
    <div className="trm-panel">
      <div className="trm-incident-layout">
        {/* Form báo cáo mới */}
        <div className="trm-incident-form-wrap">
          <div className="trm-panel-title" style={{ marginBottom: 16 }}>
            Tạo báo cáo mới
          </div>
          {incidentSent && (
            <div className="trm-alert-success">
              <CheckCircle fontSize="small" /> Báo cáo đã được gửi thành công!
            </div>
          )}
          <div className="trm-form-group">
            <label>Thiết bị / Vị trí xảy ra sự cố</label>
            <input
              className="trm-input"
              placeholder="VD: Tủ hút khí độc #2, Vòi nước bồn rửa..."
              value={newIncident.device}
              onChange={(e) =>
                setNewIncident((p) => ({ ...p, device: e.target.value }))
              }
            />
          </div>
          <div className="trm-form-group">
            <label>Mô tả sự cố</label>
            <textarea
              className="trm-textarea"
              rows={4}
              placeholder="Mô tả chi tiết tình trạng hư hỏng..."
              value={newIncident.desc}
              onChange={(e) =>
                setNewIncident((p) => ({ ...p, desc: e.target.value }))
              }
            />
          </div>
          <button
            className="trm-btn primary trm-btn-full"
            onClick={handleIncidentSubmit}
          >
            <ReportProblem sx={{ fontSize: 15 }} /> Gửi báo cáo
          </button>
        </div>

        {/* Danh sách sự cố đã báo */}
        <div className="trm-incident-list-wrap">
          <div className="trm-panel-title" style={{ marginBottom: 16 }}>
            Sự cố đã báo cáo
          </div>

          {incidents.length === 0 ? (
            <div className="trm-empty">Chưa có sự cố nào được báo cáo.</div>
          ) : (
            incidents.map((inc) => (
              <div key={inc.id} className="trm-incident-item">
                <div className="trm-incident-top">
                  <div className="trm-incident-device">
                    <Build sx={{ fontSize: 15, color: "#64748b" }} />
                    <strong>{inc.device}</strong>
                  </div>
                  <span
                    className={`trm-status-chip ${inc.statusCls || "waiting"}`}
                  >
                    {inc.statusLabel || inc.status}
                  </span>
                </div>
                <p className="trm-incident-desc">{inc.desc}</p>
                <div className="trm-incident-meta">
                  <span>
                    <Person sx={{ fontSize: 12 }} /> {inc.reporter}
                  </span>
                  <span>
                    <CalendarToday sx={{ fontSize: 12 }} /> {inc.date}
                  </span>
                  <span className="trm-req-id">{inc.id}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
