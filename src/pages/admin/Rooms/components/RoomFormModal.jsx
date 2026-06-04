import React, { useState, useEffect } from "react";
import { Close, Save, MeetingRoom } from "@mui/icons-material";
import { toast } from "react-toastify";

const EMPTY = { roomName: "", description: "" };

const RE_NAME = /^[\p{L}\p{N}\s]*$/u;
const filterName = (val) => [...val].filter((ch) => RE_NAME.test(ch)).join("");

export default function RoomFormModal({
  open, editingItem, onClose, onSaved, onCreateRoom, onUpdateRoom,
}) {
  const [form, setForm] = useState(EMPTY);
  const [nameErr, setNameErr] = useState("");
  const [saving, setSaving] = useState(false);
  const isEdit = !!editingItem;

  useEffect(() => {
    if (open) {
      setForm(
        editingItem
          ? {
              roomName: editingItem.roomName ?? "",
              description: editingItem.description ?? "",
            }
          : { ...EMPTY },
      );
      setNameErr("");
    }
  }, [open, editingItem]);

  if (!open) return null;

  const handleNameChange = (e) => {
    const raw = e.target.value;
    const filtered = filterName(raw);
    if (filtered !== raw) {
      setNameErr("Tên phòng không được chứa ký tự đặc biệt");
      setTimeout(() => setNameErr(""), 2000);
    } else {
      setNameErr("");
    }
    setForm((prev) => ({ ...prev, roomName: filtered }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.roomName.trim()) {
      toast.warning("Vui lòng nhập tên phòng!");
      return;
    }
    if (nameErr) {
      toast.warning("Vui lòng kiểm tra lại tên phòng!");
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await onUpdateRoom(editingItem.roomId, form);
        toast.success(" Cập nhật phòng thành công!");
      } else {
        await onCreateRoom(form);
        toast.success(" Thêm phòng mới thành công!");
      }
      onSaved();
    } catch (err) {
      toast.error(` ${err.response?.data?.message || err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rm-overlay">
      <div className="rm-modal">
        <div className="rm-modal-header">
          <div className="rm-modal-icon">
            <MeetingRoom />
          </div>
          <div>
            <div className="rm-modal-title">
              {isEdit ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
            </div>
            <div className="rm-modal-sub">
              {isEdit
                ? "Cập nhật tên và mô tả phòng"
                : "Phòng mới sẽ tự động ở trạng thái Hoạt động"}
            </div>
          </div>
          <button
            className="rm-modal-close"
            onClick={onClose}
            disabled={saving}
          >
            <Close />
          </button>
        </div>

        <form className="rm-modal-body" onSubmit={handleSubmit}>
          {/* Tên phòng */}
          <div className="rm-form-row">
            <label className="rm-form-label">
              Tên phòng <span className="required">*</span>
              <span className="rm-form-hint">Chỉ chữ, số và khoảng trắng</span>
            </label>
            <input
              className={`rm-form-input${nameErr ? " rm-input-error" : ""}`}
              placeholder="VD: Phòng Lab Hóa Hữu Cơ"
              value={form.roomName}
              onChange={handleNameChange}
              disabled={saving}
            />
            {nameErr && (
              <span className="rm-field-error rm-field-error-flash">
                ⚠ {nameErr}
              </span>
            )}
          </div>

          {/* Mô tả */}
          <div className="rm-form-row">
            <label className="rm-form-label">
              Mô tả
              <span className="rm-form-hint">Cho phép mọi ký tự</span>
            </label>
            <textarea
              className="rm-form-input rm-form-textarea"
              rows={3}
              placeholder="Mô tả ngắn về phòng thí nghiệm..."
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              disabled={saving}
            />
          </div>

          <div className="rm-modal-footer">
            <button
              type="button"
              className="rm-btn-cancel"
              onClick={onClose}
              disabled={saving}
            >
              Hủy bỏ
            </button>
            <button type="submit" className="rm-btn-save" disabled={saving}>
              <Save style={{ fontSize: 18 }} />
              {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm phòng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}