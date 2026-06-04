import { useState } from "react";
import { userApi } from "../../../api/userApi";
import { toast } from "react-toastify";

export function useChangePassword() {
  const [open, setOpen]             = useState(false);
  const [loading, setLoading]       = useState(false);
  const [passData, setPassData]     = useState({ old: "", new: "", confirm: "" });
  const [showPass, setShowPass]     = useState({ old: false, new: false, confirm: false });

  const openDialog  = () => setOpen(true);

  const closeDialog = () => {
    setOpen(false);
    setPassData({ old: "", new: "", confirm: "" });
    setShowPass({ old: false, new: false, confirm: false });
  };

  const toggleShow = (field) =>
    setShowPass((prev) => ({ ...prev, [field]: !prev[field] }));

  const setField = (field, value) =>
    setPassData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    const { old, new: newPass, confirm } = passData;

    if (!old || !newPass || !confirm)
      return toast.warning("Vui lòng nhập đầy đủ!");
    if (newPass === old)
      return toast.warning("Mật khẩu mới không được trùng với mật khẩu cũ!");
    if (newPass !== confirm)
      return toast.warning("Mật khẩu xác nhận không khớp!");

    setLoading(true);
    try {
      await userApi.changePassword({
        oldPassword:     old,
        newPassword:     newPass,
        confirmPassword: confirm,
      });
      toast.success("Đổi mật khẩu thành công!");
      closeDialog();
    } catch (err) {
      toast.error(err.response?.data?.message || "Đổi mật khẩu thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return {
    open,
    loading,
    passData,
    showPass,
    openDialog,
    closeDialog,
    toggleShow,
    setField,
    handleSubmit,
  };
}
