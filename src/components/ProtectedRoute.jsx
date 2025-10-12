// components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check for token in localStorage
    const token = localStorage.getItem('token');
    
    // Check for OAuth callback tokens in URL params
    const searchParams = new URLSearchParams(location.search);
    const urlToken = searchParams.get('token');
    const urlRefreshToken = searchParams.get('refresh_token');
    const success = searchParams.get('success');

    if (success === 'true' && urlToken) {
      // Handle OAuth callback - store tokens
      localStorage.setItem('token', urlToken);
      if (urlRefreshToken) {
        localStorage.setItem('refresh_token', urlRefreshToken);
      }
      
      // Clean URL
      window.history.replaceState({}, document.title, location.pathname);
      setIsAuthenticated(true);
    } else if (token) {
      setIsAuthenticated(true);
    }

    setIsChecking(false);
  }, [location]);

  if (isChecking) {
    // Show loading spinner while checking auth
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login if there's no token (case-insensitive)
    return <Navigate to="/Login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;