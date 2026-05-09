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
import AuditLogPage from "./pages/admin/dashboard/AuditLogPage";
import MainLayout from "./components/layouts/MainLayout";
import AdminLayout from "./components/layouts/AdminLayout";
import WikiPage from "./pages/wiki/ChemicalWiki";

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
              <Route path="/wiki"element={<WikiPage />}/>

            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/materials" element={<MaterialManagement />} />
              <Route path="/admin/audit-logs" element={<AuditLogPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;