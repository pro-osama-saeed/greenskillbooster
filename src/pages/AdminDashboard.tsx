import { FileText, Shield, Users, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Platform management and analytics tools
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Link to="/admin/suggestions">
            <Button variant="outline" className="w-full h-24 gap-2 flex-col">
              <FileText className="h-8 w-8" />
              <span>Lesson Suggestions</span>
            </Button>
          </Link>
          <Link to="/admin/moderation">
            <Button variant="outline" className="w-full h-24 gap-2 flex-col">
              <Shield className="h-8 w-8" />
              <span>Content Moderation</span>
            </Button>
          </Link>
          <Link to="/admin/users">
            <Button variant="outline" className="w-full h-24 gap-2 flex-col">
              <Users className="h-8 w-8" />
              <span>User Management</span>
            </Button>
          </Link>
          <Link to="/admin/analytics">
            <Button variant="outline" className="w-full h-24 gap-2 flex-col">
              <BarChart3 className="h-8 w-8" />
              <span>Analytics</span>
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
