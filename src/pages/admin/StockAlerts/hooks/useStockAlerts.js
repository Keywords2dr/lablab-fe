import { useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { stockAlertApi } from "../../../../api/stockAlertApi";
import { chemicalApi } from "../../../../api/chemicalApi";

export function useStockAlerts() {
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
      await stockAlertApi.setThreshold({ itemId: selectedItemId, minQuantity: qty });
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
      toast.success(" Đã xóa ngưỡng cảnh báo!");
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

  // ── Derived ───────────────────────────────────────────────────────────────
  const selectedChemical = chemicals.find((c) => c.itemId === selectedItemId);
  const criticalCount = alerts.filter((a) => a.alertLevel === "OUT_OF_STOCK").length;

  return {
    thresholds, loadingThresholds, fetchThresholds,
    alerts, loadingAlerts, fetchAlerts,
    chemicals, loadingChemicals,
    selectedItemId, setSelectedItemId,
    minQuantity, setMinQuantity,
    submitting, handleSubmit,
    deleteTarget, setDeleteTarget,
    deleting, handleDeleteConfirm,
    selectedChemical,
    criticalCount,
  };
}
