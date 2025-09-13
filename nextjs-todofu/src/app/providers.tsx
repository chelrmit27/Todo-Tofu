'use client';

import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/stores/AuthProvider';
import { ThemeProvider } from '@/context/ThemeContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeProvider defaultTheme="system" storageKey="todofu-ui-theme">
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
      <Toaster position="top-right" />
    </>
  );
}
