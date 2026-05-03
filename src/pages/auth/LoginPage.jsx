import { useState, useEffect } from "react";
import {
  Typography,
  TextField,
  Button,
  Link,
  Box,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  Person,
  Lock,
  Email,
  VpnKey,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthStore } from "../../store/authStore";
import { authApi } from "../../api/authApi";
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const loginAction = useAuthStore((state) => state.login);

  const [view, setView] = useState("login");

  // Dữ liệu form
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState(""); // Thêm state xác nhận MK

  // Trạng thái UI
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.warning('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await authApi.login({ username, password });
  
      const { accessToken, username: responseUsername, role } = response.data; 

      const userData = {
        username: responseUsername,
        role: role
      };
      
      // Lưu vào Zustand Store
      loginAction(userData, accessToken);
      
      toast.success('Đăng nhập thành công!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Sai tài khoản hoặc mật khẩu!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendCode = async (e) => {
    if (e) e.preventDefault();
    if (!email) {
      toast.warning("Vui lòng nhập email hợp lệ!");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.forgotPassword(email);
      toast.success(response.data?.message || "Mã xác nhận đã được gửi!");
      setView("forgot-code");
      setCountdown(60);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Không thể gửi email. Vui lòng thử lại!",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^[0-9\b]+$/.test(value)) {
      if (value.length <= 6) setCode(value);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.warning("Vui lòng nhập đủ 6 số xác nhận!");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.verifyResetCode(email, code);
      toast.success(response.data?.message || "Xác nhận thành công!");
      setView("forgot-reset");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Mã xác nhận không hợp lệ hoặc đã hết hạn!",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      toast.warning("Mật khẩu mới phải từ 6 ký tự!");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.warning("Mật khẩu xác nhận không khớp!");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.resetPassword(
        email,
        code,
        newPassword,
        confirmNewPassword,
      );
      toast.success(
        response.data?.message ||
          "Đổi mật khẩu thành công! Vui lòng đăng nhập lại.",
      );

      setView("login");
      setPassword("");
      setCode("");
      setNewPassword("");
      setConfirmNewPassword("");
      setShowPassword(false);
      setCountdown(0);
    } catch (error) {
      toast.error(error.response?.data?.message || "Đổi mật khẩu thất bại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-banner">
        <div className="banner-content">
          <div className="banner-title">LABLAB</div>
          <div className="banner-divider"></div>
          <div className="banner-subtitle">
            Hệ thống Quản lý Thiết bị & Hóa chất Phòng thí nghiệm toàn diện.
          </div>
          <ul className="banner-features">
            <li>✓ Quản lý kho chính xác</li>
            <li>✓ Theo dõi phiếu mượn/trả</li>
            <li>✓ Hỗ trợ phân quyền đa dạng</li>
          </ul>
        </div>
      </div>

      <div className="login-form-section">
        <div className="form-wrapper">
          {/* VIEW 1: ĐĂNG NHẬP */}
          {view === "login" && (
            <Box component="form" onSubmit={handleLogin} className="fade-in">
              <Typography
                variant="h4"
                fontWeight="800"
                gutterBottom
                color="text.primary"
              >
                Chào mừng trở lại!
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={4}>
                Vui lòng đăng nhập để tiếp tục.
              </Typography>

              <TextField
                fullWidth
                label="Tên đăng nhập"
                variant="outlined"
                margin="normal"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Mật khẩu"
                type={showPassword ? "text" : "password"}
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box display="flex" justifyContent="flex-end" mt={1}>
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={() => setView("forgot-email")}
                  fontWeight="500"
                >
                  Quên mật khẩu?
                </Link>
              </Box>

              <Button
                disabled={isLoading}
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                sx={{ mt: 4, mb: 2, py: 1.5, borderRadius: 2 }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Đăng Nhập"
                )}
              </Button>
            </Box>
          )}

          {/* VIEW 2: QUÊN MẬT KHẨU (GỬI EMAIL) */}
          {view === "forgot-email" && (
            <Box component="form" onSubmit={handleSendCode} className="fade-in">
              <Typography
                variant="h5"
                fontWeight="800"
                gutterBottom
                color="text.primary"
              >
                Khôi Phục Mật Khẩu
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={4}>
                Nhập email liên kết với tài khoản của bạn để nhận mã OTP.
              </Typography>

              <TextField
                fullWidth
                label="Địa chỉ Email"
                type="email"
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                disabled={isLoading}
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                sx={{ mt: 3, py: 1.5, borderRadius: 2 }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Gửi Mã Xác Nhận"
                )}
              </Button>
              <Button
                fullWidth
                variant="text"
                sx={{ mt: 2 }}
                onClick={() => setView("login")}
              >
                Quay Lại Đăng Nhập
              </Button>
            </Box>
          )}

          {/* VIEW 3: QUÊN MẬT KHẨU (NHẬP CODE) */}
          {view === "forgot-code" && (
            <Box
              component="form"
              onSubmit={handleVerifyCode}
              className="fade-in"
            >
              <Typography
                variant="h5"
                fontWeight="800"
                gutterBottom
                color="text.primary"
              >
                Nhập Mã OTP
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={4}>
                Mã 6 số đã được gửi đến <b>{email}</b>
              </Typography>

              <TextField
                fullWidth
                placeholder="• • • • • •"
                margin="normal"
                value={code}
                onChange={handleCodeChange}
                inputProps={{
                  maxLength: 6,
                  style: {
                    textAlign: "center",
                    fontSize: "2rem",
                    letterSpacing: "0.5rem",
                    fontWeight: "bold",
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VpnKey color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                disabled={isLoading}
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                sx={{ mt: 3, py: 1.5, borderRadius: 2 }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Xác Nhận"
                )}
              </Button>

              <Button
                fullWidth
                variant="text"
                sx={{ mt: 2 }}
                onClick={handleSendCode}
                disabled={countdown > 0 || isLoading}
              >
                {countdown > 0 ? `Gửi Lại Mã (${countdown}s)` : "Gửi Lại Mã"}
              </Button>
            </Box>
          )}

          {/* VIEW 4: QUÊN MẬT KHẨU (ĐẶT LẠI) */}
          {view === "forgot-reset" && (
            <Box
              component="form"
              onSubmit={handleResetPassword}
              className="fade-in"
            >
              <Typography
                variant="h5"
                fontWeight="800"
                gutterBottom
                color="text.primary"
              >
                Đặt Mật Khẩu Mới
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={4}>
                Tạo mật khẩu mới an toàn cho tài khoản của bạn.
              </Typography>

              <TextField
                fullWidth
                label="Mật khẩu mới"
                type={showPassword ? "text" : "password"}
                margin="normal"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Xác nhận mật khẩu mới"
                type={showPassword ? "text" : "password"}
                margin="normal"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                error={
                  confirmNewPassword.length > 0 &&
                  newPassword !== confirmNewPassword
                }
                helperText={
                  confirmNewPassword.length > 0 &&
                  newPassword !== confirmNewPassword
                    ? "Mật khẩu không khớp!"
                    : ""
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                disabled={isLoading}
                fullWidth
                type="submit"
                variant="contained"
                color="success"
                size="large"
                sx={{ mt: 3, py: 1.5, borderRadius: 2 }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Cập Nhật & Đăng Nhập"
                )}
              </Button>
            </Box>
          )}
        </div>
      </div>
    </div>
  );
}
