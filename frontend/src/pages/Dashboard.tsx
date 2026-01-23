import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { authService, User } from "@/services/authService";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate("/thesalonadmin");
      return;
    }
    setUser(currentUser);
  }, [navigate]);

  if (!user) return null;

  return (
    <DashboardLayout user={user}>
      <Outlet context={{ setUser }} />
    </DashboardLayout>
  );
};

export default Dashboard;
