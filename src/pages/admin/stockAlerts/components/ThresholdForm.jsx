import React from "react";
import { Save } from "@mui/icons-material";

export default function ThresholdForm({
  chemicals,
  loadingChemicals,
  selectedItemId,
  setSelectedItemId,
  minQuantity,
  setMinQuantity,
  submitting,
  selectedChemical,
  onSubmit,
}) {
  return (
    <div className="sa-card">
      <div className="sa-card-header">
        <div className="sa-card-title">
          <Save />
          Thiết lập Ngưỡng Cảnh Báo
        </div>
      </div>
      <div className="sa-card-body">
        <form className="sa-form" onSubmit={onSubmit}>
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
  );
}
