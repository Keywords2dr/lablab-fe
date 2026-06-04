import React, { useState } from "react";
import { toast } from "react-toastify";

import { useChemicals } from "./hooks/useChemicals";
import { chemicalApi } from "../../../api/chemicalApi";

import MaterialHeader from "./components/MaterialHeader";
import ChemicalTable from "./components/ChemicalTable";
import ChemicalFormModal from "./components/ChemicalFormModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import ImportExportSection from "./components/ImportExportSection";
import PreviewModal from "./components/PreviewModal";
import TrashModal from "./components/TrashModal";

import "./styles/index.css";

export default function MaterialManagement() {
  const {
    chemicals,
    inventory,
    thresholds,
    loading,
    serverPage,
    totalPages,
    totalElements,
    filters,
    applyFilters,
    resetFilters,
    fetchData,
    formOptions,
  } = useChemicals();
  
  const [editingItem, setEditingItem] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [trashOpen, setTrashOpen] = useState(false);

  // Preview modal state
  const [previewData, setPreviewData] = useState(null);
  const [previewFileName, setPreviewFileName] = useState("");
  const [previewFileObj, setPreviewFileObj] = useState(null);
  const [previewMode, setPreviewMode] = useState("preview");
  const [previewResult, setPreviewResult] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // ── Handlers ────────────────────────────────
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormOpen(true);
  };
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormOpen(true);
  };
  const handleFormClose = () => {
    setFormOpen(false);
    setEditingItem(null);
  };
  const handleSaved = () => {
    handleFormClose();
    fetchData(serverPage);
  };
  const handleRestored = () => fetchData(serverPage);

  const handleDeleteClose = () => setDeleteTarget(null);
  const handleDeleteConfirm = () => {
    handleDeleteClose();
    fetchData(serverPage);
  };

  const handleOpenPreview = (data, fileName, fileObj) => {
    setPreviewData(data);
    setPreviewFileName(fileName);
    setPreviewFileObj(fileObj ?? null);
    setPreviewMode("preview");
    setPreviewResult(null);
    setPreviewOpen(true);
  };

  const handlePreviewClose = () => setPreviewOpen(false);

  const handlePreviewConfirm = async (file) => {
    if (!file) {
      handlePreviewClose();
      fetchData(serverPage);
      return;
    }
    try {
      const res = await chemicalApi.importChemicals(file);
      const d = res.data;

      const newCount = d?.newCount || 0;
      const updatedCount = d?.updatedCount || 0;
      const ok = newCount + updatedCount;
      const fails = Array.isArray(d?.failures) ? d.failures : [];

      setPreviewResult({
        successCount: ok,
        newCount: newCount,
        updatedCount: updatedCount,
        failures: fails,
        message: d?.message,
      });
      setPreviewMode("result");
      fetchData(serverPage);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error(` Import thất bại: ${msg}`);
    }
  };

  const filteredCount = totalElements;
  const outOfStockCount = Object.values(inventory).filter(
    (inv) => inv.grandTotal === 0,
  ).length;
  const hasOutOfStock = outOfStockCount > 0;

  return (
    <div className="mm-root">
      <MaterialHeader
        totalElements={totalElements}
        hasOutOfStock={hasOutOfStock}
        outOfStockCount={outOfStockCount}
        filters={filters}
        applyFilters={applyFilters}
      />

      <ImportExportSection
        totalFiltered={filteredCount}
        sampleRows={chemicals}
        onOpenPreview={handleOpenPreview}
      />

      <ChemicalTable
        chemicals={chemicals}
        inventory={inventory}
        thresholds={thresholds}
        loading={loading}
        filters={filters}
        onFilterChange={applyFilters}
        onResetFilters={resetFilters}
        formOptions={formOptions}
        serverPage={serverPage}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={fetchData}
        onEdit={handleOpenEdit}
        onDelete={setDeleteTarget}
        onAdd={handleOpenAdd}
        onOpenTrash={() => setTrashOpen(true)}
      />

      {/* ── Modals ── */}
      <ChemicalFormModal
        open={formOpen}
        editingItem={editingItem}
        onClose={handleFormClose}
        onSaved={handleSaved}
        formOptions={formOptions}
      />

      <DeleteConfirmModal
        target={deleteTarget}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
      />

      <PreviewModal
        open={previewOpen}
        data={previewData}
        fileName={previewFileName}
        mode={previewMode}
        result={previewResult}
        onClose={handlePreviewClose}
        onConfirm={() => handlePreviewConfirm(previewFileObj)}
      />

      <TrashModal
        open={trashOpen}
        onClose={() => setTrashOpen(false)}
        onRestored={handleRestored}
      />
    </div>
  );
}
