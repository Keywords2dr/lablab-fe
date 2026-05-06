import { useAuthStore } from "../../store/authStore";
import AdminDashboard from "./AdminDashboard";
import UserDashboard from "./UserDashboard";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  //  xác định role
  const isAdmin = user?.role === "ADMIN";

  //  chỉ render nội dung (KHÔNG layout)
  return isAdmin ? <AdminDashboard /> : <UserDashboard />;
}