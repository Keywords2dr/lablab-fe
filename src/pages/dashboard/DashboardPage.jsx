import AdminDashboard from "../admin/dashboard/AdminDashboard";
import UserDashboard from "./UserDashboard";
import { useAuthStore } from "../../store/authStore";


export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  //  xác định role
  const isAdmin = user?.role === "ADMIN";

  //  chỉ render nội dung (KHÔNG layout)
  return isAdmin ? <AdminDashboard /> : <UserDashboard />;
}