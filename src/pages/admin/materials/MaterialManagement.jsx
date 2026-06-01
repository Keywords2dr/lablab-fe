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
    chemicals,
    inventory,
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

  // CẬP NHẬT LOGIC: Xử lý newCount và updatedCount từ Backend
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
      toast.error(`❌ Import thất bại: ${msg}`);
    }
  };

  const filteredCount = totalElements;
  const outOfStockCount = Object.values(inventory).filter(
    (inv) => inv.grandTotal === 0,
  ).length;
  const hasOutOfStock = outOfStockCount > 0;

  return (
    <div className="mm-root">
      {/* ── Page Header ── */}
      <div className="mm-header">
        <div className="mm-header-left">
          <div className="mm-header-icon">
            <InventoryIcon />
          </div>
          <div>
            <div className="mm-header-title">Quản lý Hóa chất &amp; Vật tư</div>
            <div className="mm-header-sub">
              Theo dõi và quản lý toàn bộ hóa chất trong phòng thí nghiệm
            </div>
          </div>
        </div>

        <div className="mm-stats">
          {/* Tổng số */}
          <div className="mm-stat-badge" title="Tổng số hóa chất">
            <div className="num">{totalElements}</div>
            <div className="lbl">Tổng số</div>
          </div>

          {/* Hết hàng — style giống "Ngừng HĐ" bên phòng Lab */}
          <div
            className="mm-stat-badge"
            title={
              hasOutOfStock
                ? "Xem hóa chất hết hàng"
                : "Không có hóa chất nào hết hàng"
            }
            style={
              hasOutOfStock
                ? {
                    cursor: "pointer",
                    background: "rgba(60, 20, 30, 0.55)",
                    border: "1.5px solid rgba(239, 68, 68, 0.55)",
                    color: "#f87171",
                  }
                : {
                    cursor: "default",
                    background: "rgba(20, 60, 30, 0.45)",
                    border: "1.5px solid rgba(34, 197, 94, 0.45)",
                    color: "#4ade80",
                  }
            }
            onClick={() => {
              if (hasOutOfStock)
                applyFilters({ outOfStock: !filters.outOfStock });
            }}
          >
            <div className="num" style={{ color: "inherit" }}>
              {outOfStockCount}
            </div>
            <div className="lbl" style={{ color: "inherit", opacity: 0.8 }}>
              Hết hàng
            </div>
          </div>
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
