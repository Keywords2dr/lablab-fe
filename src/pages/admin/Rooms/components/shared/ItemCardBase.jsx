import React from "react";
import { CheckCircleOutlined, RemoveOutlined, AddOutlined } from "@mui/icons-material";

export default function ItemCardBase({
  selected,
  error,
  onToggle,
  children,
  packageCount,
  onChangeCount,
  minPackages = 1,
  maxPackages = Infinity,
  inputAriaLabel = "Số lượng",
}) {
  const handleCardClick = (e) => {
    if (e.target.closest(".stp-inline-qty")) return;
    if (onToggle) onToggle();
  };

  const handleDecrease = () => {
    if (onChangeCount) {
      onChangeCount(Math.max(minPackages, (Number(packageCount) || minPackages) - 1));
    }
  };

  const handleIncrease = () => {
    if (onChangeCount) {
      onChangeCount(Math.min(maxPackages, (Number(packageCount) || 0) + 1));
    }
  };

  const handleInputChange = (e) => {
    if (onChangeCount) {
      let val = e.target.value.replace(/[^0-9]/g, "");
      if (val && maxPackages !== Infinity) {
        const num = Number(val);
        if (num > maxPackages) val = String(maxPackages);
      }
      onChangeCount(val);
    }
  };

  return (
    <div
      className={`stp-item-card ${selected ? "stp-item-card--selected" : ""} ${
        selected && error ? "stp-item-card--error" : ""
      }`}
      onClick={handleCardClick}
      role="button"
      aria-pressed={selected}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleCardClick(e)}
    >
      {selected && (
        <div className="stp-item-card__check">
          <CheckCircleOutlined style={{ fontSize: 14 }} />
        </div>
      )}

      {children}

      {selected && (
        <div className="stp-inline-qty" onClick={(e) => e.stopPropagation()}>
          <button
            className="stp-qty-btn"
            onClick={handleDecrease}
            disabled={Number(packageCount) <= minPackages}
            aria-label="Giảm"
          >
            <RemoveOutlined style={{ fontSize: 12 }} />
          </button>

          <input
            type="text"
            inputMode="numeric"
            className={`stp-qty-input stp-qty-input--inline ${error ? "stp-qty-input--error" : ""}`}
            style={{ minWidth: "30px", flexGrow: 1, textAlign: "center" }}
            value={packageCount !== undefined ? packageCount : ""}
            onClick={(e) => e.stopPropagation()}
            onChange={handleInputChange}
            aria-label={inputAriaLabel}
          />

          <button
            className="stp-qty-btn"
            onClick={handleIncrease}
            disabled={Number(packageCount) >= maxPackages}
            aria-label="Tăng"
          >
            <AddOutlined style={{ fontSize: 12 }} />
          </button>
        </div>
      )}

      {selected && error && (
        <div className="stp-item-card__errmsg">{error}</div>
      )}
    </div>
  );
}
