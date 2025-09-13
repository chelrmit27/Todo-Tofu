import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/stores/useAuth';
import { useTheme } from '@/context/ThemeContext';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
interface LoginData {
  username: string;
  password: string;
}

export interface LoggedInUser {
  id: string;
  username: string;
}

interface LoginProps {
  onLoginSuccess?: (user: LoggedInUser) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState<LoginData>({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const { setUserSession } = useAuth();
  const { theme, setTheme } = useTheme();

  // Force light mode on login page
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
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log(1);
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });
      console.log(2);

      const data = await response.json();

      if (response.ok) {
        console.log('Login successful:', data);
        console.log('User data received:', data.user);
        console.log('Token received:', data.token);

        try {
          // Store token first (needed by AuthProvider)
          localStorage.setItem('token', data.token);
          console.log(
            'Token stored in localStorage:',
            localStorage.getItem('token'),
          );

          // Verify token is actually there
          const storedToken = localStorage.getItem('token');
          console.log(
            'Verification - token in localStorage:',
            storedToken ? 'EXISTS' : 'MISSING',
          );

          // Use AuthProvider to set user session
          console.log('About to call setUserSession with:', data.user);
          await setUserSession(data.user);
          console.log('User session set via AuthProvider');

          // Check if token is still there after setUserSession
          const tokenAfterSetUser = localStorage.getItem('token');
          console.log(
            'Token after setUserSession:',
            tokenAfterSetUser ? 'EXISTS' : 'MISSING',
          );

          onLoginSuccess?.(data.user);

          console.log('About to navigate to /app/wallet');
          navigate('/app/wallet');
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
    <div className="min-h-screen flex">
      {/* Left Panel - Image */}
      <div className="hidden bg-background md:w-1/2  md:flex md:items-center md:justify-center">
        <img src="/login/login.png" className="w-full h-full object-cover" />
      </div>

      {/* Right Panel - Login Form */}
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

            {/* Forgot Password */}
            <div className="text-right">
              <Link
                to="/auth/forgot-password"
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Forgot password
              </Link>
            </div>

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
                  to="/auth/register"
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
  );
};
