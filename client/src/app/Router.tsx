import { Routes, Route, Navigate } from 'react-router-dom';

import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import Home from './pages/wallet/Home';
import Layout from './Layout';
import {
  ProtectedRoute,
  PublicOnlyRoute,
} from '@/features/auth/ProtectedRoute';
import { Logout } from './pages/auth/Logout';
import Wallet from './pages/wallet/wallet/Wallet';
import Today from './pages/wallet/today/Today';
import Yesterday from './pages/wallet/yesterday/Yesterday';
import Calendar from './pages/calendar/Calendar';
import Analytics from './pages/analytics/Analytics';
import EditTags from './pages/wallet/management/EditTags';
import Landing from './pages/landing/Landing';
import { CategoryProvider } from '../context/CategoryContext';

export default function AppRouter() {
  return (
    <Routes>
      {/* Public Routes - No authentication required */}
      <Route path="/" element={<Landing />} />
      <Route path="/landing" element={<Landing />} />

      {/* Auth Routes - Only for non-authenticated users */}
      <Route
        path="/auth/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/auth/register"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />

      {/* Protected App Routes - Authentication required */}
      <Route
        path="/app/*"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="wallet" replace />} />

        {/* Wallet-related routes with TaskTab */}
        <Route path="wallet" element={<Home />}>
          <Route index element={<Wallet />} />
        </Route>
        <Route path="today" element={<Home />}>
          <Route index element={<Today />} />
        </Route>
        <Route path="yesterday" element={<Home />}>
          <Route index element={<Yesterday />} />
        </Route>
        <Route path="edit-tags" element={<Home />}>
          <Route index element={<EditTags />} />
        </Route>

        {/* Standalone routes (no TaskTab) */}
        <Route path="calendar" element={<Calendar />} />
        <Route
          path="analytics"
          element={
            <CategoryProvider>
              <Analytics />
            </CategoryProvider>
          }
        />
        <Route path="logout" element={<Logout />} />
      </Route>

      {/* Catch-all route for undefined paths - only catch truly invalid routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
