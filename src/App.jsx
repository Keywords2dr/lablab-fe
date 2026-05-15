import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// --- AUTH & COMMON ---
import LoginPage from "./pages/auth/LoginPage";
import ProtectedRoute from "./components/common/ProtectedRoute";
import NotificationsPage from "./components/common/NotificationsPage";
import Profile from "./pages/profile/Profile";
import WikiPage from "./pages/wiki/ChemicalWiki";

// --- DASHBOARDS ---
import DashboardPage from "./pages/dashboard/DashboardPage";
import AdminDashboard from "./pages/admin/dashboard/AdminDashboard";

// --- ADMIN MANAGEMENT ---
import MaterialManagement from "./pages/admin/materials/MaterialManagement";
import AuditLogPage from "./pages/admin/AuditLog/AuditLogPage";
import RoomManagement from "./pages/admin/rooms/RoomManagement";
import RoomManagerAssignment from "./pages/admin/rooms/RoomManagerAssignment";
import RoomSupplyDistribution from "./pages/admin/rooms/RoomSupplyDistribution";
import UserManagementPage from "./pages/admin/users/UserManagementPage";
import RoomRentPage from "./pages/rentticket/RoomRentPage";
import ChemicalRentPage from "./pages/rentticket/ChemicalRentPage";

// ==================== MODULE TICKETS (MỚI) ====================
import AdminTicketManager from "./pages/admin/Tickets/AdminTicketManager";
import AdminTicketDetail from "./pages/admin/Tickets/AdminTicketDetail";

// --- LAYOUTS ---
import MainLayout from "./components/layouts/MainLayout";
import AdminLayout from "./components/layouts/AdminLayout";

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    background: { default: "#f4f6f8" },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Cấu hình thông báo toàn hệ thống */}
      <ToastContainer position="top-right" autoClose={3000} />

      <BrowserRouter>
        <Routes>
          {/* Route công khai */}
          <Route path="/login" element={<LoginPage />} />

          {/* ==================== USER ROUTES (Dùng chung) ==================== */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/wiki" element={<WikiPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/borrow/room" element={<RoomRentPage />} />
              <Route path="/borrow/chemical" element={<ChemicalRentPage />} />
            </Route>
          </Route>

<<<<<<< Updated upstream
=======
          {/* ==================== ADMIN ROUTES (Chỉ Admin) ==================== */}
>>>>>>> Stashed changes
          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route element={<AdminLayout />}>
              {/* Quản lý tổng quan */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagementPage />} />
              <Route path="/admin/audit-logs" element={<AuditLogPage />} />

              {/* Quản lý vật tư & hóa chất */}
              <Route path="/admin/materials" element={<MaterialManagement />} />
              
              {/* Quản lý phòng Lab & Nhân sự */}
              <Route path="/admin/rooms" element={<RoomManagement />} />
              <Route
                path="/admin/rooms/managers"
                element={<RoomManagerAssignment />}
              />
              <Route
                path="/admin/rooms/supplies"
                element={<RoomSupplyDistribution />}
              />
<<<<<<< Updated upstream
              <Route path="/admin/users" element={<UserManagementPage />} />
=======

              {/* ==================== QUẢN LÝ PHIẾU MƯỢN (TICKETS) ==================== */}
              {/* Trang danh sách và bộ lọc phiếu mượn */}
              <Route path="/admin/tickets" element={<AdminTicketManager />} />
              
              {/* Trang chi tiết, phê duyệt và lock kho hóa chất */}
              <Route path="/admin/tickets/:id" element={<AdminTicketDetail />} />
              
>>>>>>> Stashed changes
            </Route>
          </Route>

          {/* Bạn có thể thêm Route 404 ở đây nếu cần */}
          <Route path="*" element={<div style={{ padding: "20px" }}>Trang không tồn tại (404)</div>} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;