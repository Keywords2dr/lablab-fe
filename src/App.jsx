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

// --- TICKETS (ADMIN) ---
import AdminTicketManager from "./pages/admin/Tickets/AdminTicketManager";
import AdminTicketDetail from "./pages/admin/Tickets/AdminTicketDetail";

// --- USER BORROW ---
import RoomRentPage from "./pages/rentticket/RoomRentPage";
import ChemicalRentPage from "./pages/rentticket/ChemicalRentPage";
import TeacherRoomManagePage from "./pages/teacher/TeacherRoomManagePage";

// --- MY TICKETS (THEO DÕI PHIẾU & LỊCH SỬ) ---
import TicketTrackingPage from "./pages/mytickets/TicketTrackingPage";
import BorrowHistoryPage from "./pages/mytickets/BorrowHistoryPage";

// --- LAYOUTS ---
import MainLayout from "./components/layouts/MainLayout";
import AdminLayout from "./components/layouts/AdminLayout";

// --- 404 ---
import NotFoundPage from "./pages/notfound/NotFoundPage";

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
      <ToastContainer position="top-right" autoClose={3000} />

      <BrowserRouter>
        <Routes>
          {/* ==================== PUBLIC ==================== */}
          <Route path="/login" element={<LoginPage />} />

          {/* ==================== USER ROUTES ==================== */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/wiki" element={<WikiPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />

              {/* Phiếu mượn */}
              <Route path="/borrow/room" element={<RoomRentPage />} />
              <Route path="/borrow/chemical" element={<ChemicalRentPage />} />
              <Route
                path="/manage/assigned-rooms"
                element={<TeacherRoomManagePage />}
              />

              {/* Phiếu của tôi */}
              <Route path="/my-tickets" element={<TicketTrackingPage />} />
              <Route path="/borrow-history" element={<BorrowHistoryPage />} />
            </Route>
          </Route>

          {/* ==================== ADMIN ROUTES ==================== */}
          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagementPage />} />
              <Route path="/admin/audit-logs" element={<AuditLogPage />} />
              <Route path="/admin/materials" element={<MaterialManagement />} />
              <Route path="/admin/rooms" element={<RoomManagement />} />
              <Route
                path="/admin/rooms/managers"
                element={<RoomManagerAssignment />}
              />
              <Route
                path="/admin/rooms/supplies"
                element={<RoomSupplyDistribution />}
              />
              <Route path="/admin/tickets" element={<AdminTicketManager />} />
              <Route
                path="/admin/tickets/:id"
                element={<AdminTicketDetail />}
              />
            </Route>
          </Route>

          {/* 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
