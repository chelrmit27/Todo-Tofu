import { useEffect } from 'react';
import { useAuth } from '@/stores/useAuth';
import { useNavigate } from 'react-router-dom';

export const Logout = () => {
  const { logout, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically logout when component mounts
    const performLogout = async () => {
      await logout();
      navigate('/');
    };

    performLogout();
  }, [logout, navigate]);

  // Show loading spinner while logout is in progress
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">
            Logging you out...
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Please wait while we securely log you out
          </p>
        </div>
      </div>
    );
  }

  // This should rarely be seen since logout redirects immediately
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-green-600 mb-4">
          <svg
            className="w-16 h-16 mx-auto"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Logged Out Successfully
        </h2>
        <p className="text-gray-600">
          You have been securely logged out. Redirecting to login page...
        </p>
      </div>
    </div>
  );
};

export default Logout;
