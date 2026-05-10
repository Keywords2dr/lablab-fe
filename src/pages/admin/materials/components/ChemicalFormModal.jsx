import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Close, Save } from "@mui/icons-material";
import { chemicalApi } from "../../../../api/chemicalApi";
import "./ChemicalFormModal.css";

const emptyForm = {
  itemCode: "",
  name: "",
  formula: "",
  unit: "",
  packaging: "",
  amountPerPackage: "",
  supplier: "",
};

const NAV_KEYS = [
  "Backspace",
  "Delete",
  "Tab",
  "Escape",
  "Enter",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
];
const isNavKey = (e) =>
  NAV_KEYS.includes(e.key) ||
  (e.ctrlKey && ["a", "c", "v", "x", "z"].includes(e.key.toLowerCase()));

// FIX: removed unnecessary escapes \-, \[, \.
const handleCodeKeyDown = (e) => {
  if (isNavKey(e)) return;
  if (!/^[a-zA-Z0-9_-]$/.test(e.key)) e.preventDefault();
};

// Cho phép số vì tên hóa chất có thể chứa số, VD: "3-Aminopropyl", "2-Propanol"
const handleTextKeyDown = (e) => {
  if (isNavKey(e)) return;
  if (e.key === "Process" || e.key === "Unidentified") return;
  if (/^[!@#$%^&*+=[\]{};:"\\|<>?`~]$/.test(e.key)) e.preventDefault();
};

const handleFormulaKeyDown = (e) => {
  if (isNavKey(e)) return;
  if (!/^[a-zA-Z0-9()+\-.]+$/.test(e.key)) e.preventDefault();
};

const handleNumberKeyDown = (e) => {
  if (isNavKey(e)) return;
  if (!/^[0-9.]$/.test(e.key)) e.preventDefault();
};

const handleCodePaste = (e) => {
  const pasted = e.clipboardData.getData("text");
  if (!/^[a-zA-Z0-9_-]+$/.test(pasted)) {
    e.preventDefault();
    toast.warning("Mã chỉ được chứa chữ cái, số, dấu gạch dưới và gạch ngang!");
  }
};

const handleFormulaPaste = (e) => {
  const pasted = e.clipboardData.getData("text");
  if (!/^[a-zA-Z0-9()+\-.]+$/.test(pasted)) {
    e.preventDefault();
    toast.warning("Công thức chỉ được chứa chữ cái, số và ký hiệu hóa học!");
  }
};

const handleNumberPaste = (e) => {
  const pasted = e.clipboardData.getData("text");
  if (!/^\d+(\.\d+)?$/.test(pasted)) {
    e.preventDefault();
    toast.warning("Lượng mỗi gói phải là số dương!");
  }
};

export default function ChemicalFormModal({
  open,
  editingItem,
  onClose,
  onSaved,
  formOptions,
}) {
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editingItem) {
      setFormData({
        itemCode: editingItem.itemCode || "",
        name: editingItem.name || "",
        formula: editingItem.formula || "",
        unit: editingItem.unit || "",
        packaging: editingItem.packaging || "",
        amountPerPackage:
          editingItem.amountPerPackage != null
            ? String(editingItem.amountPerPackage)
            : "",
        supplier: editingItem.supplier || "",
      });
    } else {
      setFormData(emptyForm);
    }
    setErrors({});
  }, [open, editingItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: "" }));
  };

  const validate = () => {
    const errs = {};

    const itemCode = formData.itemCode.trim();
    if (!itemCode) errs.itemCode = "Mã hóa chất không được để trống!";
    else if (!/^[a-zA-Z0-9_-]+$/.test(itemCode))
      errs.itemCode = "Mã chỉ được chứa chữ cái, số, dấu _ và -!";

    const name = formData.name.trim();
    if (!name) errs.name = "Tên hóa chất không được để trống!";
    else if (name.length < 2 || name.length > 100)
      errs.name = "Tên phải từ 2 đến 100 ký tự!";

    const unit = formData.unit.trim();
    if (!unit) errs.unit = "Đơn vị tính không được để trống!";

    const amt = formData.amountPerPackage.trim();
    if (amt !== "" && (isNaN(Number(amt)) || Number(amt) < 0))
      errs.amountPerPackage = "Lượng mỗi gói phải là số dương!";

    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload = {
      itemCode: formData.itemCode.trim().toUpperCase(),
      name: formData.name.trim(),
      unit: formData.unit.trim(),
      formula: formData.formula.trim() || null,
      packaging: formData.packaging.trim() || null,
      amountPerPackage:
        formData.amountPerPackage.trim() !== ""
          ? Number(formData.amountPerPackage)
          : null,
      supplier: formData.supplier.trim() || null,
    };

    setSaving(true);
    try {
      if (editingItem) {
        await chemicalApi.updateChemical(editingItem.itemId, payload);
        toast.success("Cập nhật hóa chất thành công!");
      } else {
        await chemicalApi.createChemical(payload);
        toast.success("Thêm hóa chất mới thành công!");
      }
      onSaved();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      const status = err.response?.status;
      if (status === 409) {
        setErrors({ itemCode: "Mã hóa chất đã tồn tại!" });
        toast.error("❌ Mã hóa chất đã tồn tại!");
      } else if (status === 403 || status === 401) {
        toast.error("🔒 Không có quyền thực hiện thao tác này.");
      } else {
        toast.error("❌ Lỗi: " + msg);
      }
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="mm-overlay">
      <div className="mm-modal">
        <div className="mm-modal-header">
          <div className="mm-modal-title">
            {editingItem ? "Chỉnh sửa hóa chất" : "Thêm hóa chất mới"}
            <span>
              {editingItem
                ? "Cập nhật thông tin"
                : "Điền đầy đủ thông tin bên dưới"}
            </span>
          </div>
          <button className="mm-modal-close" onClick={onClose}>
            <Close />
          </button>
        </div>

        <div className="mm-modal-body">
          <div className="mm-form-grid">
            <div className="mm-field">
              <label>
                Mã hóa chất <span className="req">*</span>
              </label>
              <input
                name="itemCode"
                placeholder="VD: HC_001"
                value={formData.itemCode}
                onChange={handleChange}
                onKeyDown={handleCodeKeyDown}
                onPaste={handleCodePaste}
                className={errors.itemCode ? "error" : ""}
                maxLength={30}
              />
              {errors.itemCode && (
                <div className="mm-field-error">{errors.itemCode}</div>
              )}
            </div>

            <div className="mm-field">
              <label>
                Đơn vị tính <span className="req">*</span>
              </label>
              <input
                list="dl-unit"
                name="unit"
                placeholder="Chọn hoặc nhập..."
                value={formData.unit}
                onChange={handleChange}
                onKeyDown={handleTextKeyDown}
                className={errors.unit ? "error" : ""}
                maxLength={20}
              />
              <datalist id="dl-unit">
                {(formOptions?.units || []).map((u) => (
                  <option key={u} value={u} />
                ))}
              </datalist>
              {errors.unit && (
                <div className="mm-field-error">{errors.unit}</div>
              )}
            </div>

            <div className="mm-field full">
              <label>
                Tên hóa chất <span className="req">*</span>
              </label>
              <input
                name="name"
                placeholder="VD: Axit iodic"
                value={formData.name}
                onChange={handleChange}
                onKeyDown={handleTextKeyDown}
                className={errors.name ? "error" : ""}
                maxLength={100}
              />
              {errors.name && (
                <div className="mm-field-error">{errors.name}</div>
              )}
            </div>

            <div className="mm-field">
              <label>Công thức hóa học</label>
              <input
                name="formula"
                placeholder="VD: HIO3"
                value={formData.formula}
                onChange={handleChange}
                onKeyDown={handleFormulaKeyDown}
                onPaste={handleFormulaPaste}
                maxLength={50}
              />
            </div>

            <div className="mm-field">
              <label>Loại đóng gói</label>
              <input
                list="dl-packaging"
                name="packaging"
                placeholder="Chọn hoặc nhập..."
                value={formData.packaging}
                onChange={handleChange}
                onKeyDown={handleTextKeyDown}
                maxLength={50}
              />
              <datalist id="dl-packaging">
                {(formOptions?.packagings || []).map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </div>

            <div className="mm-field">
              <label>Lượng mỗi gói</label>
              <input
                type="number"
                name="amountPerPackage"
                min="0"
                placeholder="0"
                value={formData.amountPerPackage}
                onChange={handleChange}
                onKeyDown={handleNumberKeyDown}
                onPaste={handleNumberPaste}
                className={errors.amountPerPackage ? "error" : ""}
              />
              {errors.amountPerPackage && (
                <div className="mm-field-error">{errors.amountPerPackage}</div>
              )}
            </div>

            <div className="mm-field">
              <label>Nhà cung cấp</label>
              <input
                list="dl-supplier"
                name="supplier"
                placeholder="Chọn hoặc nhập..."
                value={formData.supplier}
                onChange={handleChange}
                onKeyDown={handleTextKeyDown}
                maxLength={100}
              />
              <datalist id="dl-supplier">
                {(formOptions?.suppliers || []).map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
          </div>
        </div>

        <div className="mm-divider" />
        <div className="mm-modal-footer">
          <button className="mm-btn-cancel" onClick={onClose} disabled={saving}>
            Hủy
          </button>
          <button
            className="mm-btn-save"
            onClick={handleSave}
            disabled={saving}
          >
            <Save
              style={{ fontSize: 16, marginRight: 6, verticalAlign: "middle" }}
            />
            {saving ? "Đang lưu..." : editingItem ? "Cập nhật" : "Thêm mới"}
          </button>
        </div>
      </div>
    </div>
  );
}
