import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import LoginPage from "./pages/auth/LoginPage";
import ProtectedRoute from "./components/common/ProtectedRoute";
import DashboardPage from "./pages/dashboard/DashboardPage";
import Profile from "./pages/profile/Profile";
import AdminDashboard from "./pages/dashboard/AdminDashboard";


import MainLayout from "./layouts/MainLayout";

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
          {/* PUBLIC */}
          <Route path="/login" element={<LoginPage />} />

          {/* PROTECTED */}
          <Route element={<ProtectedRoute />}>
            
            {/* 🔥 BỌC LAYOUT Ở ĐÂY */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>

          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;