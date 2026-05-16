import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const ResetPasswordModal = ({ open, onClose, onConfirm }) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setPassword("");
      setShowPassword(false);
      setError("");
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!password.trim()) {
      setError("Vui lòng nhập mật khẩu mới!");
      return;
    }
    if (password.trim().length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }
    setLoading(true);
    await onConfirm(password.trim());
    setLoading(false);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      disableRestoreFocus
    >
      <DialogTitle sx={{ fontWeight: "bold" }}>Reset mật khẩu</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label="Mật khẩu mới"
          margin="normal"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (error) setError("");
          }}
          error={!!error}
          helperText={error}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((p) => !p)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading} color="inherit">
          Hủy
        </Button>
        <Button variant="contained" onClick={handleConfirm} disabled={loading}>
          {loading ? "Đang xử lý..." : "Xác nhận"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResetPasswordModal;
