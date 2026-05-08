// src/components/wiki/components/ChemicalDetailModal.jsx
import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
import "./ChemicalDetailModal.css";

export default function ChemicalDetailModal({ open, chemical, onClose }) {
  if (!chemical) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Chi tiết hóa chất
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <div className="detail-container">
          <h2>{chemical.name}</h2>
          <p className="item-code-big">Mã: {chemical.itemCode}</p>

          {chemical.casNumber && (
            <p><strong>CAS Number:</strong> {chemical.casNumber}</p>
          )}

          <div className="detail-grid">
            {chemical.category && (
              <div><strong>Loại:</strong> {chemical.category}</div>
            )}
            {chemical.supplier && (
              <div><strong>Nhà cung cấp:</strong> {chemical.supplier}</div>
            )}
            {chemical.unit && (
              <div><strong>Đơn vị:</strong> {chemical.unit}</div>
            )}
            {chemical.packaging && (
              <div><strong>Đóng gói:</strong> {chemical.packaging}</div>
            )}
          </div>

          {chemical.description && (
            <div className="description-section">
              <strong>Mô tả:</strong>
              <p>{chemical.description}</p>
            </div>
          )}

          {chemical.safetyInfo && (
            <div className="safety-section">
              <strong>Thông tin an toàn:</strong>
              <p>{chemical.safetyInfo}</p>
            </div>
          )}
        </div>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}