import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

/**
 * Sends an authenticated user to their role-specific panel.
 * Used for /erp legacy entry and post-login redirects.
 */
const PanelRedirect = () => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={isAdmin ? "/admin" : "/staff"} replace />;
};

export default PanelRedirect;
