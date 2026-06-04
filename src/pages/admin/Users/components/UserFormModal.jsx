import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  TextField,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import {
  PersonAdd,
  Edit,
  Person,
  Lock,
  Close,
  CheckCircle,
  Visibility,
} from "@mui/icons-material";


const INITIAL_FORM = {
  username: "",
  password: "",
  role: "",
  fullName: "",
  email: "",
  phoneNumber: "",
  faculty: "",
  major: "",
  department: "",
};

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/;
const PHONE_REGEX = /^0[0-9]{9}$/;

/* ─── Sub‑components ─────────────────────────────────────────────────────── */
const FieldGroup = ({ title, icon, children }) => (
  <div className="ufm-section">
    <div className="ufm-section-header">
      <span className="ufm-section-icon">{icon}</span>
      <span className="ufm-section-title">{title}</span>
    </div>
    <div className="ufm-section-body">{children}</div>
  </div>
);

const FormField = ({ label, required, error, helper, children }) => (
  <div className={`ufm-field ${error ? "has-error" : ""}`}>
    <label className="ufm-label">
      {label}
      {required && <span className="ufm-required">*</span>}
    </label>
    <div className="ufm-input-wrap">
      <div className="ufm-input-inner">{children}</div>
    </div>
    {(error || helper) && (
      <p className={`ufm-hint ${error ? "ufm-error" : ""}`}>
        {error || helper}
      </p>
    )}
  </div>
);

const ReadonlyField = ({ label, value, placeholder = "—" }) => (
  <div className="ufm-field">
    <label className="ufm-label">{label}</label>
    <div className="ufm-readonly-value">{value || placeholder}</div>
  </div>
);

/* ─── Main Component ──────────────────────────────────────────────────────── */
const UserFormModal = ({ open, user, onClose, onCreate, onUpdate }) => {
  const isEditMode = !!user;

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (isEditMode) {
      setFormData({
        username: user.username ?? "",
        password: "",
        role: user.role ?? "",
        fullName: user.fullName ?? "",
        email: user.email ?? "",
        phoneNumber: user.phoneNumber ?? "",
        faculty: user.faculty ?? "",
        major: user.major ?? "",
        department: user.department ?? "",
      });
      setIsEditing(false);
    } else {
      setFormData(INITIAL_FORM);
      setIsEditing(true);
    }
    setErrors({});
  }, [open, user, isEditMode]);

  const handleCancelEdit = () => {
    setFormData({
      username: user.username ?? "",
      password: "",
      role: user.role ?? "",
      fullName: user.fullName ?? "",
      email: user.email ?? "",
      phoneNumber: user.phoneNumber ?? "",
      faculty: user.faculty ?? "",
      major: user.major ?? "",
      department: user.department ?? "",
    });
    setErrors({});
    setIsEditing(false);
  };

  /* ── Validation ──────────────────────────────────────────────────────────── */
  const validate = () => {
    const e = {};
    if (!isEditMode && !formData.username?.trim())
      e.username = "Username không được để trống!";
    if (!isEditMode && (!formData.password || formData.password.length < 6))
      e.password = "Mật khẩu phải có ít nhất 6 ký tự!";
    if (!formData.fullName?.trim())
      e.fullName = "Họ và tên không được để trống!";
    if (!formData.role) e.role = "Vui lòng chọn vai trò!";
    if (!isEditMode) {
      if (!formData.email?.trim()) e.email = "Email không được để trống!";
      else if (!EMAIL_REGEX.test(formData.email))
        e.email = "Email không hợp lệ (VD: name@domain.com)";
    } else {
      if (formData.email && !EMAIL_REGEX.test(formData.email))
        e.email = "Email không hợp lệ (VD: name@domain.com)";
    }
    if (formData.phoneNumber && !PHONE_REGEX.test(formData.phoneNumber))
      e.phoneNumber = "Số điện thoại phải đúng 10 chữ số, bắt đầu bằng 0!";
    if (!formData.faculty?.trim()) e.faculty = "Khoa không được để trống!";
    if (!formData.department?.trim())
      e.department = "Bộ môn không được để trống!";
    if (!formData.major?.trim()) e.major = "Chuyên ngành không được để trống!";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Submit ──────────────────────────────────────────────────────────────── */
  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      let success;
      if (isEditMode) {
        const { username: _username, password: _password, ...rest } = formData;
        // Chuyển các trường rỗng "" thành undefined để BE bỏ qua (@Pattern không validate null/undefined)
        const payload = Object.fromEntries(
          Object.entries(rest).map(([k, v]) => [k, v === "" ? undefined : v]),
        );
        success = await onUpdate(user.userId, payload);
      } else {
        success = await onCreate(formData);
      }
      if (success) onClose();
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Change handler ──────────────────────────────────────────────────────── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  /* ── Render helpers ──────────────────────────────────────────────────────── */
  const canEdit = !isEditMode || isEditing;

  const ROLE_LABEL = {
    TEACHER: "TEACHER — Giảng viên",
    STUDENT: "STUDENT — Sinh viên",
  };

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason !== "backdropClick") onClose();
      }}
      maxWidth="md"
      fullWidth
      disableRestoreFocus
      slotProps={{ paper: { className: "ufm-paper" } }}
    >
      {/* ── Header ── */}
      <div className="ufm-header">
        <div className="ufm-header-icon">
          {isEditMode ? (
            <Edit sx={{ fontSize: 22, color: "white" }} />
          ) : (
            <PersonAdd sx={{ fontSize: 22, color: "white" }} />
          )}
        </div>
        <div className="ufm-header-text">
          <h2 className="ufm-title">
            {isEditMode
              ? isEditing
                ? "Chỉnh sửa người dùng"
                : "Chi tiết người dùng"
              : "Tạo tài khoản mới"}
          </h2>
          <p className="ufm-subtitle">
            {isEditMode
              ? isEditing
                ? `Đang chỉnh sửa thông tin @${user?.username}`
                : `Xem thông tin của @${user?.username}`
              : "Điền đầy đủ thông tin để tạo tài khoản"}
          </p>
        </div>
        <button
          className="ufm-close-btn"
          onClick={onClose}
          disabled={submitting}
        >
          <Close sx={{ fontSize: 20 }} />
        </button>
      </div>

      <DialogContent className="ufm-content">
        {/* ── Section 1: Thông tin hệ thống ── */}
        <FieldGroup
          title="Thông tin hệ thống"
          icon={<Lock sx={{ fontSize: 16 }} />}
        >
          <div className="ufm-row">
            {/* Username */}
            {isEditMode ? (
              <ReadonlyField label="Username" value={formData.username} />
            ) : (
              <FormField label="Username" required error={errors.username}>
                <TextField
                  autoFocus
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Nhập username..."
                  fullWidth
                  variant="outlined"
                  size="small"
                  error={!!errors.username}
                  className="ufm-textfield"
                />
              </FormField>
            )}

            {/* Password — chỉ khi tạo mới */}
            {!isEditMode && (
              <FormField label="Mật khẩu" required error={errors.password}>
                <TextField
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Tối thiểu 6 ký tự..."
                  fullWidth
                  variant="outlined"
                  size="small"
                  error={!!errors.password}
                  className="ufm-textfield"
                />
              </FormField>
            )}

            {/* Email — readonly khi edit xem, editable khi edit chỉnh sửa */}
            {isEditMode ? (
              canEdit ? (
                <FormField label="Email" error={errors.email}>
                  <TextField
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@domain.com"
                    fullWidth
                    variant="outlined"
                    size="small"
                    error={!!errors.email}
                    className="ufm-textfield"
                  />
                </FormField>
              ) : (
                <ReadonlyField label="Email" value={formData.email} />
              )
            ) : null}
          </div>

          <div className="ufm-row">
            {/* Vai trò */}
            {canEdit ? (
              <FormField
                label="Vai trò"
                required={!isEditMode}
                error={errors.role}
              >
                <FormControl fullWidth size="small" error={!!errors.role}>
                  <Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    displayEmpty
                    className="ufm-select"
                    disabled={!canEdit}
                  >
                    <MenuItem value="" disabled>
                      <span style={{ color: "#94a3b8" }}>
                        -- Chọn vai trò --
                      </span>
                    </MenuItem>
                    <MenuItem value="TEACHER">
                      <span className="role-option teacher">
                        TEACHER — Giảng viên
                      </span>
                    </MenuItem>
                    <MenuItem value="STUDENT">
                      <span className="role-option student">
                        STUDENT — Sinh viên
                      </span>
                    </MenuItem>
                  </Select>
                </FormControl>
              </FormField>
            ) : (
              <ReadonlyField
                label="Vai trò"
                value={ROLE_LABEL[formData.role] ?? formData.role}
              />
            )}
          </div>
        </FieldGroup>

        <FieldGroup
          title="Thông tin cá nhân & Chuyên môn"
          icon={<Person sx={{ fontSize: 16 }} />}
        >
          <div className="ufm-row">
            {/* Họ và tên */}
            {canEdit ? (
              <FormField label="Họ và tên" required error={errors.fullName}>
                <TextField
                  autoFocus={isEditMode && isEditing}
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A..."
                  fullWidth
                  variant="outlined"
                  size="small"
                  error={!!errors.fullName}
                  className="ufm-textfield"
                />
              </FormField>
            ) : (
              <ReadonlyField label="Họ và tên" value={formData.fullName} />
            )}

            {!isEditMode ? (
              <FormField label="Email" required error={errors.email}>
                <TextField
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@domain.com"
                  fullWidth
                  variant="outlined"
                  size="small"
                  error={!!errors.email}
                  className="ufm-textfield"
                />
              </FormField>
            ) : null}
          </div>

          <div className="ufm-row">
            {/* Số điện thoại */}
            {canEdit ? (
              <FormField
                label="Số điện thoại"
                error={errors.phoneNumber}
                helper={!errors.phoneNumber ? "VD: 0912345678" : undefined}
              >
                <TextField
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                    handleChange({
                      target: { name: "phoneNumber", value: val },
                    });
                  }}
                  placeholder="0912345678"
                  fullWidth
                  variant="outlined"
                  size="small"
                  inputMode="numeric"
                  error={!!errors.phoneNumber}
                  className="ufm-textfield"
                />
              </FormField>
            ) : (
              <ReadonlyField
                label="Số điện thoại"
                value={formData.phoneNumber}
                placeholder="Chưa có"
              />
            )}

            {/* Khoa */}
            {canEdit ? (
              <FormField label="Khoa" required error={errors.faculty}>
                <TextField
                  name="faculty"
                  value={formData.faculty}
                  onChange={handleChange}
                  placeholder="VD: Khoa CNTT..."
                  fullWidth
                  variant="outlined"
                  size="small"
                  error={!!errors.faculty}
                  className="ufm-textfield"
                />
              </FormField>
            ) : (
              <ReadonlyField label="Khoa" value={formData.faculty} />
            )}
          </div>

          <div className="ufm-row">
            {/* Bộ môn */}
            {canEdit ? (
              <FormField label="Bộ môn" required error={errors.department}>
                <TextField
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="VD: Bộ môn HTTT..."
                  fullWidth
                  variant="outlined"
                  size="small"
                  error={!!errors.department}
                  className="ufm-textfield"
                />
              </FormField>
            ) : (
              <ReadonlyField label="Bộ môn" value={formData.department} />
            )}

            {/* Chuyên ngành */}
            {canEdit ? (
              <FormField label="Chuyên ngành" required error={errors.major}>
                <TextField
                  name="major"
                  value={formData.major}
                  onChange={handleChange}
                  placeholder="VD: Kỹ thuật phần mềm..."
                  fullWidth
                  variant="outlined"
                  size="small"
                  error={!!errors.major}
                  className="ufm-textfield"
                />
              </FormField>
            ) : (
              <ReadonlyField label="Chuyên ngành" value={formData.major} />
            )}
          </div>
        </FieldGroup>
      </DialogContent>

      {/* ── Footer ── */}
      <div className="ufm-footer">
        {isEditMode && !isEditing ? (
          <>
            <button className="ufm-btn-cancel" onClick={onClose}>
              Đóng
            </button>
            <button className="ufm-btn-edit" onClick={() => setIsEditing(true)}>
              <Edit sx={{ fontSize: 16 }} />
              Chỉnh sửa
            </button>
          </>
        ) : isEditMode && isEditing ? (
          <>
            <button
              className="ufm-btn-cancel"
              onClick={handleCancelEdit}
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              className="ufm-btn-submit"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <CircularProgress
                    size={14}
                    thickness={5}
                    sx={{ color: "white" }}
                  />
                  Đang lưu...
                </>
              ) : (
                <>
                  <CheckCircle sx={{ fontSize: 17 }} />
                  Xác nhận
                </>
              )}
            </button>
          </>
        ) : (
          /* Chế độ TẠO MỚI */
          <>
            <button
              className="ufm-btn-cancel"
              onClick={onClose}
              disabled={submitting}
            >
              Hủy bỏ
            </button>
            <button
              className="ufm-btn-submit"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <CircularProgress
                    size={14}
                    thickness={5}
                    sx={{ color: "white" }}
                  />
                  Đang lưu...
                </>
              ) : (
                <>
                  <CheckCircle sx={{ fontSize: 17 }} />
                  Tạo tài khoản
                </>
              )}
            </button>
          </>
        )}
      </div>
    </Dialog>
  );
};

export default UserFormModal;
