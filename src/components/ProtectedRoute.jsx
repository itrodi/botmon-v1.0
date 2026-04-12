import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { processOAuthCallback } from '@/utils/authUtils';

const ProtectedRoute = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const result = processOAuthCallback();

    if (result.isOAuthCallback) {
      if (result.success) {
        sessionStorage.setItem('oauth_success', 'true');
        setIsAuthenticated(true);
      } else {
        if (result.error) {
          sessionStorage.setItem('oauth_error', result.error);
        }
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(!!localStorage.getItem('token'));
    }

    setIsChecking(false);
  }, [location.search, location.pathname]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/Login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
