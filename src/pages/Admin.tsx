
import { AdminGuard } from "@/components/AdminGuard";
import { AdminDashboard } from "@/components/AdminDashboard";

const Admin = () => {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-transparent">
        <div className="container mx-auto px-4 py-8">
          <AdminDashboard />
        </div>
      </div>
    </AdminGuard>
  );
};

export default Admin;
