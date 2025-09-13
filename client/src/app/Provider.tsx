import React from 'react';
import { AuthProvider } from '@/stores/AuthProvider';
import { ThemeProvider } from '../context/ThemeContext';

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="todofu-ui-theme">
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
