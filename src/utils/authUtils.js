import { API_BASE_URL } from '@/config/api';
// authUtils.js - Authentication utility functions

/**
 * Clear all user data from localStorage
 */
export const clearUserData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
  localStorage.removeItem('linkedAccounts');
  localStorage.removeItem('instagram_profile');
  localStorage.removeItem('whatsapp_config');
  localStorage.removeItem('facebook_pages');
};

/**
 * Check if user is authenticated (has a token)
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

/**
 * Get the authentication token
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Get user data from localStorage
 */
export const getUserData = () => {
  return {
    email: localStorage.getItem('userEmail'),
    name: localStorage.getItem('userName'),
    token: localStorage.getItem('token'),
    linkedAccounts: JSON.parse(localStorage.getItem('linkedAccounts') || '{}'),
    instagramProfile: JSON.parse(localStorage.getItem('instagram_profile') || '{}')
  };
};

/**
 * Get authentication headers for API calls
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Initialize user session (simplified - just stores token)
 */
export const initializeUserSession = async (token, userData = {}) => {
  if (!token) {
    throw new Error('Token is required');
  }
  
  localStorage.setItem('token', token);
  
  if (userData.email) {
    localStorage.setItem('userEmail', userData.email);
  }
  
  if (userData.name) {
    localStorage.setItem('userName', userData.name);
  }
  
  if (userData.refreshToken) {
    localStorage.setItem('refreshToken', userData.refreshToken);
  }
  
  return true;
};

/**
 * Handle logout
 */
export const logout = async () => {
  const token = localStorage.getItem('token');
  
  // Try to notify backend about logout
  if (token) {
    try {
      await fetch(API_BASE_URL + '/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      // Ignore logout errors
    }
  }
  
  clearUserData();
  window.location.href = '/login';
};

/**
 * Process OAuth callback from URL
 * Returns: { success: boolean, token?: string, error?: string, isOAuthCallback: boolean }
 */
export const processOAuthCallback = () => {
  // Check if we've already processed this OAuth callback
  const oauthKey = 'oauth_callback_processed';
  if (sessionStorage.getItem(oauthKey)) {
    // Already processed, clear the flag
    sessionStorage.removeItem(oauthKey);
    return { 
      success: true, 
      isOAuthCallback: false,
      alreadyProcessed: true 
    };
  }

  // Parse URL directly to avoid React hook timing issues
  const urlParams = new URLSearchParams(window.location.search);
  const success = urlParams.get('success');
  const token = urlParams.get('token');
  const refreshToken = urlParams.get('refresh_token');
  const error = urlParams.get('error');
  const platform = urlParams.get('platform');
  const username = urlParams.get('username');
  const pageName = urlParams.get('page_name');
  const profilePicture = urlParams.get('profile_picture');

  // Social-account-link callbacks (Instagram/Messenger/WhatsApp) come back to the
  // /Link settings page with ?success=...&platform=... and never carry a login
  // token. They are consumed by LinkAccount, not the login OAuth flow. The
  // Instagram callback in particular sometimes omits the platform param (the
  // LinkAccount handler defaults to Instagram), so relying on ?platform= alone
  // let those callbacks fall through to the "Invalid OAuth response" branch
  // below, which strips the params and reports auth failure -- bouncing the user
  // to /Login even though their token is still in localStorage. Detect the
  // social-link case by the /Link path or any social-specific param and bail out
  // so the URL params survive untouched.
  const path = (window.location.pathname || '').toLowerCase();
  const isSocialLinkCallback =
    path === '/link' ||
    !!platform ||
    !!username ||
    !!pageName ||
    !!profilePicture;

  if (isSocialLinkCallback) {
    return {
      success: false,
      isOAuthCallback: false
    };
  }

  // Check if this is an OAuth callback
  const hasOAuthParams = success !== null || token !== null || error !== null;

  if (!hasOAuthParams) {
    return {
      success: false,
      isOAuthCallback: false
    };
  }

  // Handle both "true" and "True" (Python sends capitalized)
  const isSuccess = success && (success.toLowerCase() === 'true');
  const isFailure = success && (success.toLowerCase() === 'false');

  if (isSuccess && token) {
    // Store tokens in localStorage
    localStorage.setItem('token', token);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    
    // Mark as processed to prevent re-processing on re-render
    sessionStorage.setItem(oauthKey, 'true');
    
    // Clear URL params for security
    window.history.replaceState({}, document.title, window.location.pathname);
    
    return { 
      success: true, 
      isOAuthCallback: true,
      token: token 
    };
  }

  if (isFailure || error) {
    // Mark as processed
    sessionStorage.setItem(oauthKey, 'true');
    
    // Clear URL params
    window.history.replaceState({}, document.title, window.location.pathname);
    
    const errorMessage = error 
      ? decodeURIComponent(error.replace(/\+/g, ' ')) 
      : 'Authentication failed';
    
    return { 
      success: false, 
      isOAuthCallback: true,
      error: errorMessage 
    };
  }

  // Had OAuth params but couldn't process them
  window.history.replaceState({}, document.title, window.location.pathname);
  
  return { 
    success: false, 
    isOAuthCallback: true,
    error: 'Invalid OAuth response' 
  };
};

/**
 * Check authentication status - for use in protected pages
 * Handles OAuth callback if present, otherwise checks for existing token
 */
export const checkAuthStatus = () => {
  // First, try to process OAuth callback if present
  const oauthResult = processOAuthCallback();
  
  if (oauthResult.isOAuthCallback) {
    return oauthResult;
  }
  
  // If OAuth was already processed in this session, user is authenticated
  if (oauthResult.alreadyProcessed) {
    const existingToken = localStorage.getItem('token');
    return {
      success: !!existingToken,
      isOAuthCallback: false,
      token: existingToken
    };
  }
  
  // No OAuth callback - check for existing token
  const existingToken = localStorage.getItem('token');
  
  return {
    success: !!existingToken,
    isOAuthCallback: false,
    token: existingToken
  };
};

export default {
  clearUserData,
  isAuthenticated,
  getToken,
  getUserData,
  getAuthHeaders,
  initializeUserSession,
  logout,
  processOAuthCallback,
  checkAuthStatus
};