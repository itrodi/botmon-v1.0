// components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      // Check for OAuth callback tokens in URL params FIRST
      const searchParams = new URLSearchParams(location.search);
      const urlToken = searchParams.get('token');
      const urlRefreshToken = searchParams.get('refresh_token');
      const success = searchParams.get('success');

      console.log('[ProtectedRoute] Checking auth...');
      console.log('[ProtectedRoute] URL params - success:', success, 'hasToken:', !!urlToken);

      // Handle both "true" and "True" (Python sends capitalized)
      const isSuccess = success && success.toLowerCase() === 'true';

      if (isSuccess && urlToken) {
        console.log('[ProtectedRoute] OAuth callback detected - storing tokens');
        
        // Handle OAuth callback - store tokens
        localStorage.setItem('token', urlToken);
        if (urlRefreshToken) {
          localStorage.setItem('refreshToken', urlRefreshToken);
        }
        
        // Mark that OAuth just succeeded (for showing toast in component)
        sessionStorage.setItem('oauth_success', 'true');
        
        // Clean URL params for security
        window.history.replaceState({}, document.title, location.pathname);
        
        console.log('[ProtectedRoute] Tokens stored, user authenticated');
        setIsAuthenticated(true);
        setIsChecking(false);
        return;
      }

      // Check for OAuth error
      const error = searchParams.get('error');
      const isFailure = success && success.toLowerCase() === 'false';
      
      if (isFailure || error) {
        console.log('[ProtectedRoute] OAuth failed:', error);
        const errorMessage = error 
          ? decodeURIComponent(error.replace(/\+/g, ' ')) 
          : 'Authentication failed';
        sessionStorage.setItem('oauth_error', errorMessage);
        
        // Clean URL
        window.history.replaceState({}, document.title, location.pathname);
        
        setIsAuthenticated(false);
        setIsChecking(false);
        return;
      }

      // No OAuth callback - check for existing token in localStorage
      const existingToken = localStorage.getItem('token');
      console.log('[ProtectedRoute] Existing token:', !!existingToken);
      
      if (existingToken) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      
      setIsChecking(false);
    };

    checkAuth();
  }, [location.search, location.pathname]);

  if (isChecking) {
    // Show loading spinner while checking auth
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/Login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;