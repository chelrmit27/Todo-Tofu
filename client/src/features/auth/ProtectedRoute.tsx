import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../stores/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('CUSTOMER' | 'VENDOR' | 'SHIPPER')[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  redirectTo = '/auth/login',
}: ProtectedRouteProps) {
  const { isAuth, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuth || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// Component for routes that should only be accessible when NOT logged in (like login, register)
export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuth, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If user is authenticated, redirect to app
  if (isAuth) {
    return <Navigate to="/app/wallet" replace />;
  }

  return <>{children}</>;
}
