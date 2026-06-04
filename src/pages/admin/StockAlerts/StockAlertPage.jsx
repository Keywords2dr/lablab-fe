import React from "react";

import { useStockAlerts } from "./hooks/useStockAlerts";
import StockAlertHeader from "./components/StockAlertHeader";
import ThresholdForm from "./components/ThresholdForm";
import AlertList from "./components/AlertList";
import ThresholdTable from "./components/ThresholdTable";
import DeleteConfirmModal from "./components/DeleteConfirmModal";

import "./styles/index.css";

export default function StockAlertPage() {
  const {
    thresholds, loadingThresholds, fetchThresholds,
    alerts, loadingAlerts, fetchAlerts,
    chemicals, loadingChemicals,
    selectedItemId, setSelectedItemId,
    minQuantity, setMinQuantity,
    submitting, handleSubmit,
    deleteTarget, setDeleteTarget,
    deleting, handleDeleteConfirm,
    selectedChemical,
  } = useStockAlerts();

  return (
    <div className="sa-root">
      <StockAlertHeader thresholds={thresholds} alerts={alerts} />

      <div className="sa-layout">
        <ThresholdForm
          chemicals={chemicals}
          loadingChemicals={loadingChemicals}
          selectedItemId={selectedItemId}
          setSelectedItemId={setSelectedItemId}
          minQuantity={minQuantity}
          setMinQuantity={setMinQuantity}
          submitting={submitting}
          selectedChemical={selectedChemical}
          onSubmit={handleSubmit}
        />

        <AlertList
          alerts={alerts}
          loadingAlerts={loadingAlerts}
          onRefresh={fetchAlerts}
        />

        <ThresholdTable
          thresholds={thresholds}
          loadingThresholds={loadingThresholds}
          onDelete={setDeleteTarget}
          onRefresh={fetchThresholds}
        />
      </div>

      <DeleteConfirmModal
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
      />
    </div>
  );
}
