import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const FIELDS = [
  { key: "old",     label: "Mật khẩu cũ" },
  { key: "new",     label: "Mật khẩu mới" },
  { key: "confirm", label: "Xác nhận mật khẩu" },
];

/**
 * Dialog đổi mật khẩu — UI thuần, nhận toàn bộ state và handlers từ useChangePassword hook.
 */
export default function ChangePasswordDialog({
  open,
  loading,
  passData,
  showPass,
  onClose,
  onSubmit,
  onToggleShow,
  onSetField,
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Đổi mật khẩu</DialogTitle>

      <DialogContent>
        {FIELDS.map(({ key, label }) => (
          <TextField
            key={key}
            fullWidth
            label={label}
            margin="normal"
            type={showPass[key] ? "text" : "password"}
            value={passData[key]}
            onChange={(e) => onSetField(key, e.target.value)}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => onToggleShow(key)} edge="end">
                      {showPass[key] ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        ))}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={onSubmit} disabled={loading}>
          {loading ? "Đang xử lý..." : "Xác nhận"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
