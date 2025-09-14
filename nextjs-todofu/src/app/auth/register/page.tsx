'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import { PublicOnlyRoute } from '@/features/auth/ProtectedRoute';
import { useTheme } from '@/context/ThemeContext';

const userRegistrationSchema = z.object({
  username: z
    .string()
    .min(8, 'Username must be at least 8 characters')
    .max(15, 'Username must not exceed 15 characters')
    .regex(/^[a-zA-Z0-9]+$/, 'Username can only contain letters and digits'),
  email: z
    .string()
    .email('Invalid email format')
    .min(5, 'Email must be at least 5 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(20, 'Password must not exceed 20 characters')
    .regex(
      /^(?=.*[a-z])/,
      'Password must contain at least one lowercase letter',
    )
    .regex(
      /^(?=.*[A-Z])/,
      'Password must contain at least one uppercase letter',
    )
    .regex(/^(?=.*\d)/, 'Password must contain at least one digit')
    .regex(
      /^(?=.*[!@#$%^&*])/,
      'Password must contain at least one special character (!@#$%^&*)',
    )
    .regex(
      /^[a-zA-Z0-9!@#$%^&*]+$/,
      'Password can only contain letters, digits, and special characters (!@#$%^&*)',
    ),
  name: z.string().min(5, 'Name must be at least 5 characters').trim(),
  profilePicture: z.string().optional().default(''),
});

type UserRegistrationData = z.infer<typeof userRegistrationSchema>;

export default function RegisterPage() {
  const [formData, setFormData] = useState<UserRegistrationData>({
    username: '',
    email: '',
    password: '',
    name: '',
    profilePicture: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Force light mode on register page
  useEffect(() => {
    const originalTheme = theme;
    setTheme('light');
    return () => {
      setTheme(originalTheme);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    try {
      setFieldErrors({});
      userRegistrationSchema.parse(formData);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newFieldErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          const path = issue.path[0]?.toString();
          if (path) {
            newFieldErrors[path] = issue.message;
          }
        });
        setFieldErrors(newFieldErrors);
        setError(
          error.issues[0]?.message || 'Please fix the validation errors',
        );
      } else {
        setError('An unexpected error occurred.');
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Attempting registration...');
      const response = await api.post('/auth/register', formData);
      const data = response.data;

      if (response.status === 200 || response.status === 201) {
        console.log('Registration successful:', data);
        toast.success('Registration successful!');
        router.push('/auth/login');
      } else {
        console.error('Registration error response:', {
          status: response.status,
          statusText: response.statusText,
          data: data,
        });

        setFieldErrors({});

        // Handle structured validation errors from server
        if (data.errors && Array.isArray(data.errors)) {
          const newFieldErrors: Record<string, string> = {};
          data.errors.forEach((error: { field: string; message: string }) => {
            const fieldName = error.field;
            newFieldErrors[fieldName] = error.message;
          });

          setFieldErrors(newFieldErrors);
          setError('Please fix the validation errors below');
          return;
        }

        // Handle specific error cases
        const errorMessage = data.message || data.error || '';

        if (errorMessage.toLowerCase().includes('username')) {
          if (
            errorMessage.toLowerCase().includes('already') ||
            errorMessage.toLowerCase().includes('exists')
          ) {
            setFieldErrors({
              username:
                'This username is already taken. Please choose a different one.',
            });
            setError('Username is already taken');
          } else {
            setFieldErrors({ username: 'Invalid username format' });
            setError('Invalid username format');
          }
        } else if (errorMessage.toLowerCase().includes('email')) {
          if (
            errorMessage.toLowerCase().includes('already') ||
            errorMessage.toLowerCase().includes('exists')
          ) {
            setFieldErrors({
              email:
                'This email is already registered. Try logging in instead.',
            });
            setError('Email is already registered');
          } else {
            setFieldErrors({ email: 'Please enter a valid email address.' });
            setError('Invalid email format');
          }
        } else {
          setError(
            errorMessage ||
              'Registration failed. Please check your information and try again.',
          );
        }
      }
    } catch (error) {
      console.error('Network error:', error);
      setError('Network error. Please check your connection and try again.');
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
          alt="Register illustration"
          fill
          className="object-cover"
        />
      </div>

      {/* Right Panel - Register Form */}
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
          <div className="mb-8">
            <h1 className="text-4xl font-semibold mb-2 text-foreground">
              Create Account
            </h1>
            <p className="text-muted-foreground text-base font-light">
              Please fill in your details to get started
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
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
                disabled={loading}
                className="w-full"
                required
              />
              {fieldErrors.username && (
                <p className="text-destructive text-sm">
                  {fieldErrors.username}
                </p>
              )}
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-gray-700"
              >
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                disabled={loading}
                className="w-full"
                required
              />
              {fieldErrors.name && (
                <p className="text-destructive text-sm">{fieldErrors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                disabled={loading}
                className="w-full"
                required
              />
              {fieldErrors.email && (
                <p className="text-destructive text-sm">{fieldErrors.email}</p>
              )}
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
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                disabled={loading}
                className="w-full"
                required
              />
              {fieldErrors.password && (
                <p className="text-destructive text-sm">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Register Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-medium bg-[#7453AB] text-white hover:bg-[#5e4291]"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>

            {/* Sign In Link */}
            <div className="text-center mt-2">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  className="font-medium text-[#7453AB] hover:text-[#5e4291]"
                >
                  Sign in
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
