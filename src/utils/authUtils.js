// authUtils.js - Simple authentication utility functions

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
 * Handle logout
 */
export const logout = async () => {
  const token = localStorage.getItem('token');
  
  // Try to notify backend about logout
  if (token) {
    try {
      await fetch('https://api.automation365.io/auth/logout', {
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

export default {
  clearUserData,
  isAuthenticated,
  getToken,
  getAuthHeaders,
  logout
};