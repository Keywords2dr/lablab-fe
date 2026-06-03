import React, { useEffect, useState, useCallback } from "react";
import {
  NotificationsActive,
  Delete,
  Save,
  Science,
  WarningAmber,
  CheckCircle,
  Refresh,
} from "@mui/icons-material";
import { toast } from "react-toastify";

import { stockAlertApi } from "../../../api/stockAlertApi";
import { chemicalApi } from "../../../api/chemicalApi";
import "./StockAlertPage.css";

// ── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteConfirmModal({ target, onClose, onConfirm, loading }) {
  if (!target) return null;
  return (
    <div className="sa-overlay" onClick={onClose}>
      <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sa-modal-icon">
          <Delete />
        </div>
        <h3>Xóa ngưỡng cảnh báo?</h3>
        <p>
          Bạn có chắc muốn xóa ngưỡng cảnh báo cho hóa chất{" "}
          <strong>{target.itemName || target.itemCode}</strong>? Hành động này
          không thể hoàn tác.
        </p>
        <div className="sa-modal-actions">
          <button className="sa-btn-cancel" onClick={onClose} disabled={loading}>
            Hủy
          </button>
          <button
            className="sa-btn-danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Đang xóa..." : "Xóa"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function StockAlertPage() {
  // ── Thresholds state ──────────────────────────────────────────────────────
  const [thresholds, setThresholds] = useState([]);
  const [loadingThresholds, setLoadingThresholds] = useState(false);

  // ── Stock alerts state ────────────────────────────────────────────────────
  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);

  // ── Chemicals list (for dropdown) ─────────────────────────────────────────
  const [chemicals, setChemicals] = useState([]);
  const [loadingChemicals, setLoadingChemicals] = useState(false);

  // ── Form state ────────────────────────────────────────────────────────────
  const [selectedItemId, setSelectedItemId] = useState("");
  const [minQuantity, setMinQuantity] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ── Delete modal ──────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch functions ───────────────────────────────────────────────────────
  const fetchThresholds = useCallback(async () => {
    setLoadingThresholds(true);
    try {
      const res = await stockAlertApi.getAllThresholds();
      setThresholds(res.data || []);
    } catch {
      toast.error("Không thể tải danh sách ngưỡng cảnh báo!");
    } finally {
      setLoadingThresholds(false);
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    setLoadingAlerts(true);
    try {
      const res = await stockAlertApi.getStockAlerts();
      setAlerts(res.data || []);
    } catch {
      toast.error("Không thể tải danh sách cảnh báo tồn kho!");
    } finally {
      setLoadingAlerts(false);
    }
  }, []);

  const fetchChemicals = useCallback(async () => {
    setLoadingChemicals(true);
    try {
      // Lấy tất cả hóa chất (size lớn để có đủ lựa chọn)
      const res = await chemicalApi.getChemicals({ size: 500 });
      const items = res.data?.content || res.data || [];
      setChemicals(items);
    } catch {
      toast.error("Không thể tải danh sách hóa chất!");
    } finally {
      setLoadingChemicals(false);
    }
  }, []);

  useEffect(() => {
    fetchThresholds();
    fetchAlerts();
    fetchChemicals();
  }, [fetchThresholds, fetchAlerts, fetchChemicals]);

  // ── Selected chemical info ────────────────────────────────────────────────
  const selectedChemical = chemicals.find((c) => c.itemId === selectedItemId);

  // ── Submit form ───────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItemId) {
      toast.warning("Vui lòng chọn hóa chất!");
      return;
    }
    const qty = parseFloat(minQuantity);
    if (isNaN(qty) || qty < 0) {
      toast.warning("Mức cảnh báo phải là số không âm!");
      return;
    }

    setSubmitting(true);
    try {
      await stockAlertApi.setThreshold({
        itemId: selectedItemId,
        minQuantity: qty,
      });
      toast.success(" Đã lưu ngưỡng cảnh báo thành công!");
      setSelectedItemId("");
      setMinQuantity("");
      fetchThresholds();
      fetchAlerts();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error(` Lưu thất bại: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await stockAlertApi.deleteThreshold(deleteTarget.itemId);
      toast.success("🗑️ Đã xóa ngưỡng cảnh báo!");
      setDeleteTarget(null);
      fetchThresholds();
      fetchAlerts();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error(` Xóa thất bại: ${msg}`);
    } finally {
      setDeleting(false);
    }
  };

  // ── Derived stats ─────────────────────────────────────────────────────────
  const criticalCount = alerts.filter(
    (a) => a.alertLevel === "OUT_OF_STOCK"
  ).length;
  const warningCount = alerts.length - criticalCount;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="sa-root">
      {/* ── Header ── */}
      <div className="sa-header">
        <div className="sa-header-left">
          <div className="sa-header-icon">
            <NotificationsActive />
          </div>
          <div>
            <div className="sa-header-title">Ngưỡng Cảnh Báo Tồn Kho</div>
            <div className="sa-header-sub">
              Thiết lập mức tối thiểu để nhận cảnh báo khi hóa chất sắp hết
            </div>
          </div>
        </div>

        <div className="sa-stats">
          <div className="sa-stat-badge" title="Số ngưỡng đã cài đặt">
            <div className="num">{thresholds.length}</div>
            <div className="lbl">Đã cài đặt</div>
          </div>
          <div
            className="sa-stat-badge alert-badge"
            title="Đang cảnh báo"
          >
            <div className="num">{alerts.length}</div>
            <div className="lbl">Đang cảnh báo</div>
          </div>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="sa-layout">
        {/* ── Left: Set threshold form ── */}
        <div className="sa-card">
          <div className="sa-card-header">
            <div className="sa-card-title">
              <Save />
              Thiết lập Ngưỡng Cảnh Báo
            </div>
          </div>
          <div className="sa-card-body">
            <form className="sa-form" onSubmit={handleSubmit}>
              {/* Chemical select */}
              <div className="sa-form-group">
                <label className="sa-form-label">
                  Hóa chất <span>*</span>
                </label>
                <select
                  className="sa-form-select"
                  value={selectedItemId}
                  onChange={(e) => {
                    setSelectedItemId(e.target.value);
                    setMinQuantity("");
                  }}
                  disabled={loadingChemicals || submitting}
                  required
                >
                  <option value="">
                    {loadingChemicals ? "Đang tải..." : "-- Chọn hóa chất --"}
                  </option>
                  {chemicals.map((c) => (
                    <option key={c.itemId} value={c.itemId}>
                      [{c.itemCode}] {c.name}
                    </option>
                  ))}
                </select>
                <div className="sa-form-hint">
                  Nếu hóa chất đã có ngưỡng, giá trị sẽ được cập nhật.
                </div>
              </div>

              {/* Min quantity */}
              <div className="sa-form-group">
                <label className="sa-form-label">
                  Mức cảnh báo tối thiểu <span>*</span>
                </label>
                <div className="sa-form-row">
                  <input
                    type="number"
                    className="sa-form-input"
                    placeholder="Nhập số lượng..."
                    value={minQuantity}
                    min={0}
                    step="any"
                    onChange={(e) => setMinQuantity(e.target.value)}
                    disabled={submitting}
                    required
                  />
                  <input
                    type="text"
                    className="sa-form-input"
                    value={selectedChemical?.unit || "—"}
                    disabled
                    placeholder="Đơn vị"
                    title="Đơn vị tự động lấy theo hóa chất đã chọn"
                  />
                </div>
                <div className="sa-form-hint">
                  Hệ thống sẽ cảnh báo khi tồn kho thực tế thấp hơn mức này.
                </div>
              </div>

              <button
                type="submit"
                className="sa-btn-submit"
                disabled={submitting || !selectedItemId || minQuantity === ""}
              >
                <Save fontSize="small" />
                {submitting ? "Đang lưu..." : "Lưu ngưỡng cảnh báo"}
              </button>
            </form>
          </div>
        </div>

        {/* ── Right: Current alerts ── */}
        <div className="sa-card">
          <div className="sa-card-header">
            <div className="sa-card-title">
              <WarningAmber style={{ color: "#f97316" }} />
              Hóa chất đang cảnh báo
            </div>
            <button
              className="sa-btn-del"
              style={{
                width: 32,
                height: 32,
                background: "#f8fafc",
                border: "1.5px solid #e2e8f0",
                color: "#64748b",
              }}
              onClick={fetchAlerts}
              title="Làm mới"
            >
              <Refresh fontSize="small" />
            </button>
          </div>
          <div className="sa-card-body">
            {loadingAlerts ? (
              <div className="sa-spinner">
                <div className="sa-spinner-ring" />
              </div>
            ) : alerts.length === 0 ? (
              <div className="sa-empty">
                <CheckCircle style={{ color: "#22c55e" }} />
                <p>Không có hóa chất nào đang cảnh báo 🎉</p>
              </div>
            ) : (
              <div className="sa-alert-list">
                {alerts.map((alert) => {
                  const isCritical = alert.alertLevel === "OUT_OF_STOCK";
                  return (
                    <div
                      key={alert.itemId}
                      className={`sa-alert-item ${isCritical ? "critical" : "warning"}`}
                    >
                      <span className="sa-alert-icon">
                        {isCritical ? "🚨" : "⚠️"}
                      </span>
                      <div className="sa-alert-content">
                        <div className="sa-alert-name">
                          {alert.itemName || alert.itemCode}
                        </div>
                        <div className="sa-alert-detail">
                          Tồn kho:{" "}
                          <strong>
                            {alert.totalQuantity ?? 0} {alert.unit}
                          </strong>{" "}
                          / Ngưỡng:{" "}
                          <strong>
                            {alert.minQuantity} {alert.unit}
                          </strong>
                        </div>
                      </div>
                      <span
                        className={`sa-alert-badge ${isCritical ? "critical" : "warning"}`}
                      >
                        {isCritical ? "Hết hàng" : "Sắp hết"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Full-width: Threshold table ── */}
        <div className="sa-card" style={{ gridColumn: "1 / -1" }}>
          <div className="sa-card-header">
            <div className="sa-card-title">
              <Science />
              Danh sách Ngưỡng đã cài đặt ({thresholds.length})
            </div>
            <button
              className="sa-btn-del"
              style={{
                width: 32,
                height: 32,
                background: "#f8fafc",
                border: "1.5px solid #e2e8f0",
                color: "#64748b",
              }}
              onClick={fetchThresholds}
              title="Làm mới"
            >
              <Refresh fontSize="small" />
            </button>
          </div>
          <div className="sa-card-body" style={{ paddingTop: 8 }}>
            {loadingThresholds ? (
              <div className="sa-spinner">
                <div className="sa-spinner-ring" />
              </div>
            ) : thresholds.length === 0 ? (
              <div className="sa-empty">
                <Science />
                <p>Chưa có ngưỡng cảnh báo nào được cài đặt</p>
              </div>
            ) : (
              <div className="sa-table-wrap">
                <table className="sa-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Mã hóa chất</th>
                      <th>Tên hóa chất</th>
                      <th className="right">Mức cảnh báo</th>
                      <th className="center">Đơn vị</th>
                      <th className="center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {thresholds.map((t, idx) => (
                      <tr key={t.itemId}>
                        <td style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                          {idx + 1}
                        </td>
                        <td>
                          <span className="sa-chemical-code">
                            {t.itemCode || "—"}
                          </span>
                        </td>
                        <td>
                          <span className="sa-chemical-name">
                            {t.itemName || "—"}
                          </span>
                        </td>
                        <td className="right">
                          <span className="sa-threshold-value">
                            {t.minQuantity}
                          </span>
                        </td>
                        <td className="center">
                          <span className="sa-unit-badge">
                            {t.unit || "—"}
                          </span>
                        </td>
                        <td className="center">
                          <button
                            className="sa-btn-del"
                            title="Xóa ngưỡng"
                            onClick={() => setDeleteTarget(t)}
                          >
                            <Delete />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Delete Modal ── */}
      <DeleteConfirmModal
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
      />
    </div>
  );
}
