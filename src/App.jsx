import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import LoginPage from "./pages/auth/LoginPage";
import ProtectedRoute from "./components/common/ProtectedRoute";
import DashboardPage from "./pages/dashboard/DashboardPage";
import Profile from "./pages/profile/Profile";
import AdminDashboard from "./pages/admin/dashboard/AdminDashboard";
import MaterialManagement from "./pages/admin/materials/MaterialManagement";
import AuditLogPage from "./pages/admin/AuditLog/AuditLogPage";
import RoomManagement from "./pages/admin/rooms/RoomManagement";
import RoomManagerAssignment from "./pages/admin/rooms/RoomManagerAssignment";
import RoomSupplyDistribution from "./pages/admin/rooms/RoomSupplyDistribution";
import UserManagementPage from "./pages/admin/users/UserManagementPage";
import RoomRentPage from "./pages/rentticket/RoomRentPage";
import ChemicalRentPage from "./pages/rentticket/ChemicalRentPage";
import TeacherRoomManagePage from "./pages/teacher/TeacherRoomManagePage";

import MainLayout from "./components/layouts/MainLayout";
import AdminLayout from "./components/layouts/AdminLayout";
import WikiPage from "./pages/wiki/ChemicalWiki";
import NotificationsPage from "./components/common/NotificationsPage";

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
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/wiki" element={<WikiPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/borrow/room" element={<RoomRentPage />} />
              <Route path="/borrow/chemical" element={<ChemicalRentPage />} />
              <Route path="/manage/assigned-rooms" element={<TeacherRoomManagePage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/materials" element={<MaterialManagement />} />
              <Route path="/admin/audit-logs" element={<AuditLogPage />} />
              <Route path="/admin/rooms" element={<RoomManagement />} />
              <Route
                path="/admin/rooms/managers"
                element={<RoomManagerAssignment />}
              />
              <Route
                path="/admin/rooms/supplies"
                element={<RoomSupplyDistribution />}
              />
              <Route path="/admin/users" element={<UserManagementPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;