import React from "react";
import { Info, Science } from "@mui/icons-material";
import "./ChemicalCard.css";

export default function ChemicalCard({ chemical, onViewDetail }) {
  if (!chemical) return null;

  return (
    <div className="chemical-card">
      <div className="card-header">
        <div className="item-code">{chemical.itemCode || "N/A"}</div>
        <Science className="chemical-icon" />
      </div>

      <div className="card-body">
        <h3 className="chemical-name">{chemical.name}</h3>
        
        {chemical.casNumber && (
          <p className="cas-number">
            CAS: <strong>{chemical.casNumber}</strong>
          </p>
        )}

        <div className="chemical-info">
          {chemical.category && (
            <div className="info-row">
              <span className="label">Loại:</span>
              <span className="value">{chemical.category}</span>
            </div>
          )}

          {chemical.supplier && (
            <div className="info-row">
              <span className="label">Nhà cung cấp:</span>
              <span className="value">{chemical.supplier}</span>
            </div>
          )}

          {chemical.unit && (
            <div className="info-row">
              <span className="label">Đơn vị:</span>
              <span className="value">{chemical.unit}</span>
            </div>
          )}
        </div>

        {chemical.description && (
          <p className="chemical-description">
            {chemical.description.length > 120
              ? chemical.description.substring(0, 117) + "..."
              : chemical.description}
          </p>
        )}
      </div>

      <div className="card-footer">
        <button
          className="btn-detail"
          onClick={() => onViewDetail(chemical)}
        >
          <Info /> Xem chi tiết
        </button>
      </div>
    </div>
  );
}