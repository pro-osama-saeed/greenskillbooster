import { useEffect, useState, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles: AppRole[];
}

export const ProtectedRoute = ({ children, requiredRoles }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuthorization = async () => {
      if (!user) {
        setIsAuthorized(false);
        return;
      }

      try {
        const { data: roles, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching user roles:', error);
          setIsAuthorized(false);
          return;
        }

        const userRoles = roles?.map(r => r.role) || [];
        const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
        
        setIsAuthorized(hasRequiredRole);
        
        if (!hasRequiredRole) {
          toast.error('Access denied. You do not have permission to view this page.');
        }
      } catch (error) {
        console.error('Authorization check failed:', error);
        setIsAuthorized(false);
      }
    };

    if (!authLoading) {
      checkAuthorization();
    }
  }, [user, authLoading, requiredRoles]);

  // Show loading state while checking auth and authorization
  if (authLoading || isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect to home if logged in but not authorized
  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  // Render children if authorized
  return <>{children}</>;
};
