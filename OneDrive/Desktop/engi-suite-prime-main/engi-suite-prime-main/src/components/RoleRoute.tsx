import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

interface Props {
  children: React.ReactNode;
  allow: "admin" | "staff";
}

/**
 * Strict role gate. Sends users to their own panel if they hit the wrong one.
 */
const RoleRoute = ({ children, allow }: Props) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allow === "admin" && !isAdmin) {
    return <Navigate to="/staff" replace />;
  }

  if (allow === "staff" && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

export default RoleRoute;
