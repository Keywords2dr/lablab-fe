import React, { useState } from "react";
import { Inventory as InventoryIcon } from "@mui/icons-material";
import { toast } from "react-toastify";

import { useChemicals } from "./hooks/useChemicals";
import { chemicalApi } from "../../../api/chemicalApi";
import ChemicalTable from "./components/ChemicalTable";
import ChemicalFormModal from "./components/ChemicalFormModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import ImportExportSection from "./components/ImportExportSection";
import PreviewModal from "./components/PreviewModal";
import TrashModal from "./components/TrashModal";

import "./MaterialManagement.css";

export default function MaterialManagement() {
  const {
    chemicals, inventory, loading,
    serverPage, totalPages, totalElements,
    filters, applyFilters, resetFilters,
    fetchData, formOptions,
  } = useChemicals();
  const [editingItem, setEditingItem] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [trashOpen, setTrashOpen] = useState(false);

  // Preview modal state
  const [previewData, setPreviewData] = useState(null);
  const [previewFileName, setPreviewFileName] = useState("");
  const [previewFileObj, setPreviewFileObj] = useState(null);
  const [previewMode, setPreviewMode] = useState("preview"); // "preview" | "result"
  const [previewResult, setPreviewResult] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // ── Handlers ────────────────────────────────
  const handleOpenAdd = () => { setEditingItem(null); setFormOpen(true); };
  const handleOpenEdit = (item) => { setEditingItem(item); setFormOpen(true); };
  const handleFormClose = () => { setFormOpen(false); setEditingItem(null); };
  const handleSaved = () => { handleFormClose(); fetchData(serverPage); };
  const handleRestored = () => fetchData(serverPage);

  const handleDeleteClose = () => setDeleteTarget(null);
  const handleDeleteConfirm = () => { handleDeleteClose(); fetchData(serverPage); };

  // Nhận dữ liệu preview từ FE — chưa import
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
    if (!file) { handlePreviewClose(); fetchData(serverPage); return; }
    try {
      const res = await chemicalApi.importChemicals(file);
      const d = res.data;
      const ok = d?.successCount ?? 0;
      const fails = Array.isArray(d?.failures) ? d.failures : [];
      setPreviewResult({ successCount: ok, failures: fails, message: d?.message });
      setPreviewMode("result");
      fetchData(serverPage);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error(`❌ Import thất bại: ${msg}`);
    }
  };

  const filteredCount = totalElements;

  return (
    <div className="mm-root">

      {/* ── Page Header ── */}
      <div className="mm-header">
        <div className="mm-header-left">
          <div className="mm-header-icon"><InventoryIcon /></div>
          <div>
            <div className="mm-header-title">Quản lý Hóa chất &amp; Vật tư</div>
            <div className="mm-header-sub">
              Theo dõi và quản lý toàn bộ hóa chất trong phòng thí nghiệm
            </div>
          </div>
        </div>
        <div className="mm-stats">
          <div className="mm-stat-badge">
            <div className="num">{totalElements}</div>
            <div className="lbl">Tổng số</div>
          </div>
          {(() => {
            const outOfStock = chemicals.filter((c) => {
              const inv = inventory[c.itemId];
              return (inv?.grandTotal ?? -1) === 0;
            }).length;
            return outOfStock > 0 ? (
              <div className="mm-stat-badge" style={{ background: "#fef2f2", borderColor: "#fecaca" }}>
                <div className="num" style={{ color: "#dc2626" }}>{outOfStock}</div>
                <div className="lbl" style={{ color: "#dc2626" }}>Hết hàng</div>
              </div>
            ) : null;
          })()}
        </div>
      </div>

      {/* ── Import / Export ── */}
      <ImportExportSection
        totalFiltered={filteredCount}
        sampleRows={chemicals}
        onOpenPreview={handleOpenPreview}
      />

      {/* ── Bảng dữ liệu ── */}
      <ChemicalTable
        chemicals={chemicals}
        inventory={inventory}
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