'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/stores/useAuth';
import { useEffect } from 'react';

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
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuth || !user)) {
      router.push(redirectTo);
    }
  }, [isAuth, isLoading, user, router, redirectTo]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Don't render children if not authenticated (will redirect above)
  if (!isAuth || !user) {
    return null;
  }

  return <>{children}</>;
}

// Component for routes that should only be accessible when NOT logged in (like login, register)
export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuth, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuth) {
      router.push('/app/wallet');
    }
  }, [isAuth, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Don't render children if authenticated (will redirect above)  
  if (isAuth) {
    return null;
  }

  return <>{children}</>;
}
