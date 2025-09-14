'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/stores/useAuth';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { PublicOnlyRoute } from '@/features/auth/ProtectedRoute';
import { useTheme } from '@/context/ThemeContext';

interface LoginData {
  username: string;
  password: string;
}

export interface LoggedInUser {
  id: string;
  username: string;
}

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginData>({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const router = useRouter();
  const { setUserSession } = useAuth();
  const { theme, setTheme } = useTheme();

  // Force light mode on login page
  useEffect(() => {
    if (!setTheme) return;
    const originalTheme = theme;
    setTheme('light');
    return () => {
      setTheme(originalTheme);
    };
  }, [theme, setTheme]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login...');
      console.log('Form data:', formData);
      
      // Use fetch instead of axios for debugging
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      console.log('Fetch response status:', response.status);
      console.log('Fetch response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Parsed response data:', data);
      console.log('Response data structure:', JSON.stringify(data, null, 2));
      console.log('User data:', data.user);
      console.log('Token data:', data.token);

      if (response.status === 200) {
        console.log('Login successful:', data);
        console.log('Response data structure:', JSON.stringify(data, null, 2));
        console.log('User data:', data.user);
        console.log('Token data:', data.token);

        try {
          // Store token first (needed by AuthProvider)
          localStorage.setItem('token', data.token);
          
          // Validate user data before passing to setUserSession
          if (!data.user) {
            throw new Error('No user data in response');
          }
          
          if (!data.user.id || !data.user.username || !data.user.email) {
            throw new Error('Incomplete user data: ' + JSON.stringify(data.user));
          }
          
          console.log('About to call setUserSession with:', data.user);
          
          // Use AuthProvider to set user session
          await setUserSession(data.user);
          
          console.log('About to navigate to /app/wallet');
          router.push('/app/wallet');
          toast.success('Login successful!');
        } catch (error) {
          console.error('Error during login success handling:', error);
          setError('Login succeeded but session setup failed');
        }
      } else {
        setError(data.message || 'Login failed');
        console.error('Login failed:', data);
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicOnlyRoute>
      <div className="light min-h-screen flex">
      {/* Left Panel - Image */}
      <div className="hidden bg-background md:w-1/2  md:flex md:items-center md:justify-center relative">
        <Image 
          src="/login/login.png" 
          alt="Login illustration"
          fill
          className="object-cover"
        />
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-card">
        <div className="w-full max-w-md p-8">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-gray-600 hover:text-[#7453AB] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8 ">
            <h1 className="text-4xl font-semibold mb-2 text-foreground">
              Welcome Back
            </h1>
            <p className="text-muted-foreground text-base font-light">
              Please enter your account details
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="px-4 py-3 rounded-lg text-sm bg-destructive/10 text-destructive border border-destructive/20">
                {error}
              </div>
            )}

            {/* Username Field */}
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-sm font-medium text-gray-700"
              >
                Username
              </Label>
              <Input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
                disabled={loading}
                className="w-full"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </Label>
              <Input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                disabled={loading}
                className="w-full"
                required
              />
            </div>

            {/* Forgot Password
            <div className="text-right">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Forgot password
              </Link>
            </div> */}

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-medium bg-[#7453AB] text-white hover:bg-[#5e4291]"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>

            {/* Sign Up Link */}
            <div className="text-center mt-2">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link
                  href="/auth/register"
                  className="font-medium text-[#7453AB] hover:text-[#5e4291]"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
    </PublicOnlyRoute>
  );
}
