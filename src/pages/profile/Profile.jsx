import { useEffect, useState } from "react";
import { userApi } from "../../api/userApi";
import { toast } from "react-toastify";
import "./Profile.css";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await userApi.getProfile();
      const userData = res.data;
      setUser(userData);
      setFormData({
        fullName: userData.fullName || "",
        phoneNumber: userData.phoneNumber || "",
      });
    } catch (err) {
      console.error("Lỗi tải profile:", err);
      toast.error("Không thể tải hồ sơ!");
    }
  };

  // ── Chặn ký tự không phải số khi nhập số điện thoại ──────────
  const handlePhoneKeyDown = (e) => {
    const allowedKeys = [
      "Backspace", "Delete", "Tab", "Escape", "Enter",
      "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
      "Home", "End",
    ];
    // Cho phép Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (allowedKeys.includes(e.key) || (e.ctrlKey && ["a", "c", "v", "x"].includes(e.key.toLowerCase()))) {
      return;
    }
    // Chặn tất cả ký tự không phải số
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  // ── Chặn paste chứa ký tự không phải số vào ô SĐT ───────────
  const handlePhonePaste = (e) => {
    const pasted = e.clipboardData.getData("text");
    if (!/^\d+$/.test(pasted)) {
      e.preventDefault();
      toast.warning("Số điện thoại chỉ được chứa chữ số!");
    }
  };

  // ── Chặn ký tự số khi nhập Họ và tên ─────────────────────────
  const handleFullNameKeyDown = (e) => {
    const allowedKeys = [
      "Backspace", "Delete", "Tab", "Escape", "Enter",
      "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
      "Home", "End", " ",
    ];
    if (allowedKeys.includes(e.key) || (e.ctrlKey && ["a", "c", "v", "x"].includes(e.key.toLowerCase()))) {
      return;
    }
    // Chặn ký tự số và ký tự đặc biệt
    if (/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(e.key)) {
      e.preventDefault();
    }
  };

  // ── Chặn paste số/ký tự đặc biệt vào ô Họ tên ───────────────
  const handleFullNamePaste = (e) => {
    const pasted = e.clipboardData.getData("text");
    if (/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pasted)) {
      e.preventDefault();
      toast.warning("Họ và tên không được chứa số hoặc ký tự đặc biệt!");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Xoá lỗi của trường đó ngay khi người dùng bắt đầu nhập lại
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};

    // ── Họ và tên ──────────────────────────────────────────────
    const fullName = formData.fullName.trim();
    if (!fullName) {
      errs.fullName = "Họ và tên không được để trống!";
    } else if (fullName.length < 2 || fullName.length > 50) {
      errs.fullName = "Họ và tên phải từ 2 đến 50 ký tự!";
    } else if (/\s{2,}/.test(fullName)) {
      errs.fullName = "Họ và tên không được chứa nhiều khoảng trắng liên tiếp!";
    } else if (
      !/^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s]+$/.test(fullName)
    ) {
      errs.fullName = "Họ và tên chỉ được chứa chữ cái và khoảng trắng!";
    }

    // ── Số điện thoại ──────────────────────────────────────────
    const phone = formData.phoneNumber.trim();
    if (!phone) {
      errs.phoneNumber = "Số điện thoại không được để trống!";
    } else if (phone.length !== 10) {
      errs.phoneNumber = "Số điện thoại phải đúng 10 chữ số!";
    } else if (!/^(03|05|07|08|09)\d{8}$/.test(phone)) {
      errs.phoneNumber = "Số điện thoại không hợp lệ (đầu số phải là 03x, 05x, 07x, 08x, 09x)!";
    }

    return errs;
  };

  const handleSave = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        email: user.email,
        avatar: user.avatar || null,
      };

      const res = await userApi.updateProfile(payload);
      setUser((prev) => ({ ...prev, ...res.data }));
      toast.success("Cập nhật thông tin thành công! 🎉");
    } catch (err) {
      const data = err.response?.data;
      const errorMessage = data?.message || data?.error || "Cập nhật thất bại!";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="loading">Đang tải hồ sơ...</div>;

  return (
    <div className="profile-container">
      <h2 className="profile-title">Hồ sơ cá nhân</h2>

      <div className="profile-content">
        <div className="profile-card">
          <div className="avatar-circle">
            {user.username?.charAt(0).toUpperCase() || "?"}
          </div>
          <h3>{user.fullName}</h3>
          <p>{user.email}</p>
          <span className="role-badge">{user.role}</span>
        </div>

        <div className="profile-form">
          {/* Họ và tên */}
          <div className="form-group">
            <label>
              Họ và tên <span className="required">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              onKeyDown={handleFullNameKeyDown}
              onPaste={handleFullNamePaste}
              className={errors.fullName ? "input-error" : ""}
              placeholder="Nhập họ và tên"
              maxLength={50}
            />
            {errors.fullName && (
              <span className="error-msg">{errors.fullName}</span>
            )}
          </div>

          {/* Số điện thoại */}
          <div className="form-group">
            <label>
              Số điện thoại <span className="required">*</span>
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              onKeyDown={handlePhoneKeyDown}
              onPaste={handlePhonePaste}
              className={errors.phoneNumber ? "input-error" : ""}
              placeholder="Nhập số điện thoại "
              maxLength={10}
            />
            {errors.phoneNumber && (
              <span className="error-msg">{errors.phoneNumber}</span>
            )}
          </div>

          {/* Khoa */}
          <div className="form-group">
            <label>Khoa</label>
            <div className="readonly-text">{user.faculty || "Chưa có"}</div>
          </div>

          {/* Bộ môn */}
          <div className="form-group">
            <label>Bộ môn</label>
            <div className="readonly-text">{user.department || "Chưa có"}</div>
          </div>

          {/* Chuyên ngành */}
          <div className="form-group">
            <label>Chuyên ngành</label>
            <div className="readonly-text">{user.major || "Chưa có"}</div>
          </div>

          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}