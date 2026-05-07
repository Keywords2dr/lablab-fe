import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import UserDashboard from "./UserDashboard";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  if (user?.role === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  return <UserDashboard />;
}