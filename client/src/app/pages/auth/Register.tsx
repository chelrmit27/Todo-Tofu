import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/context/ThemeContext';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

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

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

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

  // Force light mode on register page
  useEffect(() => {
    const originalTheme = theme;
    setTheme('light');

    // Cleanup: restore original theme when component unmounts
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
      const response = await fetch(
        'http://localhost:5001/api/auth/register/user',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();

      if (response.ok) {
        toast.success('Registration successful!');
        navigate('/auth/login');
      } else {
        // Show detailed error message from server
        console.error('Registration error response:', {
          status: response.status,
          statusText: response.statusText,
          data: data,
        });
        console.log('Error data structure:', JSON.stringify(data, null, 2));

        // Clear previous field errors
        setFieldErrors({});

        // First priority: Handle structured validation errors from server (Zod validation)
        if (data.errors && Array.isArray(data.errors)) {
          const newFieldErrors: Record<string, string> = {};
          data.errors.forEach((error: { field: string; message: string }) => {
            const fieldName = error.field;
            newFieldErrors[fieldName] = error.message;
          });

          setFieldErrors(newFieldErrors);
          setError('Please fix the validation errors below');
          return; // Exit early to avoid other error handling
        }

        // Handle specific error cases with helpful messages
        const errorMessage = data.message || data.error || '';

        // Check for specific field-related errors and provide helpful messages
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
          } else if (
            errorMessage.toLowerCase().includes('invalid') ||
            errorMessage.toLowerCase().includes('format')
          ) {
            setFieldErrors({
              username:
                'Username must be 3-50 characters and contain only letters, numbers, and underscores.',
            });
            setError('Invalid username format');
          } else {
            setFieldErrors({ username: 'Username error: ' + errorMessage });
            setError('Username issue');
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
          } else if (
            errorMessage.toLowerCase().includes('invalid') ||
            errorMessage.toLowerCase().includes('format')
          ) {
            setFieldErrors({ email: 'Please enter a valid email address.' });
            setError('Invalid email format');
          } else {
            setFieldErrors({ email: 'Email error: ' + errorMessage });
            setError('Email issue');
          }
        } else if (errorMessage.toLowerCase().includes('password')) {
          if (
            errorMessage.toLowerCase().includes('weak') ||
            errorMessage.toLowerCase().includes('strength')
          ) {
            setFieldErrors({
              password:
                'Password must contain at least 8 characters with uppercase, lowercase, number, and special character.',
            });
            setError('Password too weak');
          } else if (
            errorMessage.toLowerCase().includes('invalid') ||
            errorMessage.toLowerCase().includes('format')
          ) {
            setFieldErrors({
              password:
                'Password must be 8-100 characters with uppercase, lowercase, number, and special character.',
            });
            setError('Invalid password format');
          } else {
            setFieldErrors({ password: 'Password error: ' + errorMessage });
            setError('Password issue');
          }
        } else if (errorMessage.toLowerCase().includes('name')) {
          setFieldErrors({ name: 'Name must be at least 5 characters.' });
          setError('Invalid name format');
        } else {
          // Generic server error
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
    <div className="min-h-screen flex">
      {/* Left Panel - Image */}
      <div className="hidden bg-background md:w-1/2  md:flex md:items-center md:justify-center">
        <img src="/login/login.png" className="w-full h-full object-cover" />
      </div>

      {/* Right Panel - Register Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-card">
        <div className="w-full max-w-md p-8">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              to="/"
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
                  to="/auth/login"
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
  );
};
