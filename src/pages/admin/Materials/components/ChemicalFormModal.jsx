import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Close, Save, Inventory } from "@mui/icons-material";
import { chemicalApi } from "../../../../api/chemicalApi";
import { roomApi } from "../../../../api/roomApi";


const emptyForm = {
  itemCode: "",
  name: "",
  formula: "",
  unit: "",
  packaging: "",
  amountPerPackage: "",
  supplier: "",
  roomName: "",
  packageCount: "",
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
  (e.ctrlKey && ["a", "c", "v", "x", "y", "z"].includes(e.key.toLowerCase()));

const handleCodeKeyDown = (e) => {
  if (isNavKey(e)) return;
  if (!/^[a-zA-Z0-9_-]$/.test(e.key)) e.preventDefault();
};

const handleTextKeyDown = (e) => {
  if (isNavKey(e)) return;
  if (e.key === "Process" || e.key === "Unidentified" || e.key === "Dead")
    return;
  if (/^[a-zA-ZÀ-ỹ0-9\s\-()/.,;'%+#]$/.test(e.key)) return;
  e.preventDefault();
};

const handleFormulaKeyDown = (e) => {
  if (isNavKey(e)) return;
  if (!/^[a-zA-Z0-9()+\-.]+$/.test(e.key)) e.preventDefault();
};

const handleNumberKeyDown = (e) => {
  if (isNavKey(e)) return;
  if (!/^[0-9.]$/.test(e.key)) e.preventDefault();
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
  const [roomOptions, setRoomOptions] = useState([]);

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
        roomName: "",
        packageCount: "",
      });
    } else {
      setFormData(emptyForm);

      const fetchRooms = async () => {
        try {
          const res = await roomApi.getRooms({ size: 500 });
          const roomList = res.data?.content || res.data || [];
          setRoomOptions(roomList);
        } catch (error) {
          console.error("Không tải được danh sách phòng", error);
        }
      };
      fetchRooms();
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

    const unit = formData.unit.trim();
    if (!unit) errs.unit = "Đơn vị tính không được để trống!";

    const amt = formData.amountPerPackage.trim();
    if (!amt) {
      errs.amountPerPackage = "Lượng/Dung tích 1 gói không được để trống!";
    } else if (isNaN(Number(amt)) || Number(amt) <= 0) {
      errs.amountPerPackage = "Phải là số dương > 0!";
    }

    if (!editingItem) {
      const pCount = formData.packageCount.trim();
      const rName = formData.roomName.trim();

      if (pCount && !rName) {
        errs.roomName = "Vui lòng nhập Phòng lưu chứa nếu có nhập số lượng!";
      }
      if (rName && !pCount) {
        errs.packageCount = "Vui lòng nhập Số lượng nếu đã chọn Phòng!";
      }
      if (
        pCount &&
        (isNaN(Number(pCount)) ||
          Number(pCount) <= 0 ||
          !Number.isInteger(Number(pCount)))
      ) {
        errs.packageCount = "Số lượng phải là số nguyên dương!";
      }
    }

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
      amountPerPackage: Number(formData.amountPerPackage),
      supplier: formData.supplier.trim() || null,
      roomName: formData.roomName.trim() || null,
      packageCount: formData.packageCount.trim()
        ? Number(formData.packageCount)
        : null,
    };

    setSaving(true);
    try {
      if (editingItem) {
        await chemicalApi.updateChemical(editingItem.itemId, payload);
        toast.success("Cập nhật hóa chất thành công!");
      } else {
        await chemicalApi.createChemical(payload);
        toast.success("Thêm hóa chất mới thành công!");
        if (payload.packageCount) {
          toast.info(
            `📦 Đã tự động nhập ${payload.packageCount} gói vào phòng ${payload.roomName}`,
          );
        }
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
      <div className="mm-modal" style={{ maxWidth: 650 }}>
        <div className="mm-modal-header">
          <div className="mm-modal-title">
            {editingItem ? "Chỉnh sửa Danh mục Hóa chất" : "Thêm mới Hóa chất"}
            <span>
              {editingItem
                ? "Cập nhật thông tin gốc của hóa chất"
                : "Điền thông tin định danh cho hóa chất mới"}
            </span>
          </div>
          <button className="mm-modal-close" onClick={onClose}>
            <Close />
          </button>
        </div>

        <div
          className="mm-modal-body"
          style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: "10px" }}
        >
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
                className={errors.itemCode ? "error" : ""}
                maxLength={30}
              />
              {errors.itemCode && (
                <div className="mm-field-error">{errors.itemCode}</div>
              )}
            </div>

            <div className="mm-field full">
              <label>
                Tên hóa chất <span className="req">*</span>
              </label>
              <input
                name="name"
                placeholder="VD: 1-(2-Pyridylazo)-2-naphthol (PAN)"
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
                maxLength={50}
              />
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
              <label>
                Lượng mỗi gói/chai <span className="req">*</span>
              </label>
              <input
                type="number"
                name="amountPerPackage"
                min="0.01"
                step="0.01"
                placeholder="VD: 500"
                value={formData.amountPerPackage}
                onChange={handleChange}
                onKeyDown={handleNumberKeyDown}
                className={errors.amountPerPackage ? "error" : ""}
              />
              {errors.amountPerPackage && (
                <div className="mm-field-error">{errors.amountPerPackage}</div>
              )}
            </div>

            <div className="mm-field">
              <label>
                Đơn vị tính <span className="req">*</span>
              </label>
              <input
                list="dl-unit"
                name="unit"
                placeholder="VD: ml, g..."
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
          </div>

          {!editingItem && (
            <div
              style={{
                marginTop: "20px",
                padding: "15px",
                background: "#f8fafc",
                border: "1px dashed #cbd5e1",
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "12px",
                  color: "#334155",
                  fontWeight: 600,
                }}
              >
                <Inventory style={{ fontSize: 18, color: "#0ea5e9" }} />
                Nhập kho ban đầu (Tùy chọn)
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#64748b",
                  marginBottom: "15px",
                }}
              >
                Nếu bạn có sẵn hàng thực tế, hãy điền phòng và số lượng để hệ
                thống tự động cộng vào kho. Bỏ trống nếu chỉ muốn tạo danh mục.
              </div>

              <div className="mm-form-grid">
                <div className="mm-field">
                  <label>Phòng lưu chứa (Chọn hoặc nhập)</label>
                  <input
                    list="dl-rooms"
                    name="roomName"
                    placeholder="VD: 310"
                    value={formData.roomName}
                    onChange={handleChange}
                    className={errors.roomName ? "error" : ""}
                  />
                  <datalist id="dl-rooms">
                    {roomOptions.map((r) => (
                      <option key={r.roomId} value={r.roomName} />
                    ))}
                  </datalist>
                  {errors.roomName && (
                    <div className="mm-field-error">{errors.roomName}</div>
                  )}
                </div>

                <div className="mm-field">
                  <label>Số lượng (Chai/Hộp)</label>
                  <input
                    type="number"
                    name="packageCount"
                    min="1"
                    placeholder="VD: 5"
                    value={formData.packageCount}
                    onChange={handleChange}
                    onKeyDown={handleNumberKeyDown}
                    className={errors.packageCount ? "error" : ""}
                  />
                  {errors.packageCount && (
                    <div className="mm-field-error">{errors.packageCount}</div>
                  )}
                </div>
              </div>
            </div>
          )}
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
            {saving
              ? "Đang xử lý..."
              : editingItem
                ? "Cập nhật danh mục"
                : "Lưu hệ thống"}
          </button>
        </div>
      </div>
    </div>
  );
}
