'use client';

import { CategoryProvider } from '@/context/CategoryContext';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <CategoryProvider>
        {children}
      </CategoryProvider>
    </ProtectedRoute>
  );
}
