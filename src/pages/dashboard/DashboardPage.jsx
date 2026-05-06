import AdminDashboard from "../admin/dashboard/AdminDashboard";
import UserDashboard from "./UserDashboard";
import { useAuthStore } from "../../store/authStore";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";

  return isAdmin ? <AdminDashboard /> : <UserDashboard />;
}