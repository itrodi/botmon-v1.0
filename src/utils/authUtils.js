// authUtils.js - Authentication utility functions with security improvements

const API_BASE_URL = 'https://api.automation365.io';

/**
 * Clear all user-specific data from localStorage
 * Call this when a user logs out or before a new login
 */
export const clearUserData = () => {
  const userId = localStorage.getItem('userId');
  
  // Clear user-specific linked accounts data
  if (userId) {
    localStorage.removeItem(`linkedAccounts_${userId}`);
    localStorage.removeItem(`instagram_profile_${userId}`);
    localStorage.removeItem(`whatsapp_config_${userId}`);
    localStorage.removeItem(`facebook_pages_${userId}`);
    localStorage.removeItem(`twitter_profile_${userId}`);
  }
  
  // Clear any legacy non-user-specific data
  localStorage.removeItem('linkedAccounts');
  localStorage.removeItem('instagram_profile');
  localStorage.removeItem('whatsapp_config');
  localStorage.removeItem('facebook_pages');
  localStorage.removeItem('twitter_profile');
  
  // Clear user session data
  localStorage.removeItem('userId');
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
};

/**
 * Securely decode JWT token payload
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded payload or null
 */
const decodeTokenPayload = (token) => {
  try {
    if (!token || typeof token !== 'string') return null;
    
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) return null;
    
    // Base64url decode (handle URL-safe base64)
    let base64 = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
    
    // Add padding if needed
    while (base64.length % 4) {
      base64 += '=';
    }
    
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if expired or invalid
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  const payload = decodeTokenPayload(token);
  if (!payload) return true;
  
  // Check if exp claim exists
  if (!payload.exp) {
    // If no exp claim, assume token is valid (some tokens don't expire)
    return false;
  }
  
  // Add 60 second buffer to account for clock skew
  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();
  const buffer = 60 * 1000; // 60 seconds
  
  return currentTime >= (expirationTime - buffer);
};

/**
 * Get user ID from JWT token
 * @param {string} token - JWT token
 * @returns {Promise<string|null>} - User ID or null
 */
export const getUserIdFromToken = async (token) => {
  // First try to decode from token
  const payload = decodeTokenPayload(token);
  if (payload) {
    const userId = payload.user_id || payload.userId || payload.sub;
    if (userId) return userId;
  }
  
  // Fallback: API call to get user profile
  try {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.userId || data.id || null;
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
  }
  
  // Last resort: create a deterministic hash from token
  // This ensures the same token always produces the same ID
  let hash = 0;
  const str = token.substring(0, 100); // Use first 100 chars for performance
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `user_${Math.abs(hash).toString(36)}`;
};

/**
 * Initialize new user session
 * Call this when a user logs in
 * @param {string} token - JWT token
 * @param {object} userData - Additional user data
 * @returns {Promise<string>} - User ID
 */
export const initializeUserSession = async (token, userData = {}) => {
  if (!token) {
    throw new Error('Token is required');
  }
  
  // Basic token format validation
  if (typeof token !== 'string' || token.split('.').length !== 3) {
    throw new Error('Invalid token format');
  }
  
  // Check if token is expired
  if (isTokenExpired(token)) {
    console.warn('Token appears to be expired');
    // Don't throw - let the backend handle it
  }
  
  // Clear any previous user's data first
  clearUserData();
  
  // Extract user ID from token or userData
  const userId = await getUserIdFromToken(token) || userData.userId || userData.id;
  
  if (!userId) {
    throw new Error('Unable to determine user ID');
  }
  
  // Store new user session data
  localStorage.setItem('token', token);
  localStorage.setItem('userId', userId);
  
  if (userData.email) {
    localStorage.setItem('userEmail', userData.email);
  }
  
  if (userData.name) {
    localStorage.setItem('userName', userData.name);
  }
  
  if (userData.refreshToken) {
    localStorage.setItem('refreshToken', userData.refreshToken);
  }
  
  return userId;
};

/**
 * Get user-specific storage key
 * @param {string} key - Base key name
 * @returns {string} - User-specific key
 */
export const getUserStorageKey = (key) => {
  const userId = localStorage.getItem('userId');
  return userId ? `${key}_${userId}` : key;
};

/**
 * Store user-specific data
 * @param {string} key - Key name
 * @param {any} value - Value to store
 */
export const setUserData = (key, value) => {
  const storageKey = getUserStorageKey(key);
  try {
    if (typeof value === 'object' && value !== null) {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } else {
      localStorage.setItem(storageKey, String(value));
    }
  } catch (error) {
    console.error('Error storing user data:', error);
  }
};

/**
 * Get user-specific data
 * @param {string} key - Key name
 * @param {any} defaultValue - Default value if not found
 * @returns {any} - Stored value or default
 */
export const getUserData = (key, defaultValue = null) => {
  const storageKey = getUserStorageKey(key);
  try {
    const data = localStorage.getItem(storageKey);
    if (data === null) return defaultValue;
    
    // Try to parse as JSON
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  } catch (error) {
    console.error('Error getting user data:', error);
    return defaultValue;
  }
};

/**
 * Check if current user has linked a specific platform
 * @param {string} platform - Platform name
 * @returns {boolean} - True if linked
 */
export const isPlatformLinked = (platform) => {
  const linkedAccounts = getUserData('linkedAccounts', {});
  return linkedAccounts[platform] === true;
};

/**
 * Update linked accounts status
 * @param {string} platform - Platform name
 * @param {boolean} isLinked - Linked status
 * @returns {object} - Updated linked accounts
 */
export const updateLinkedAccount = (platform, isLinked) => {
  const linkedAccounts = getUserData('linkedAccounts', {});
  linkedAccounts[platform] = isLinked;
  setUserData('linkedAccounts', linkedAccounts);
  return linkedAccounts;
};

/**
 * Migrate old localStorage data to user-specific keys
 */
export const migrateOldDataToUserSpecific = () => {
  const userId = localStorage.getItem('userId');
  if (!userId) return;
  
  const keysToMigrate = [
    'linkedAccounts',
    'instagram_profile',
    'whatsapp_config',
    'facebook_pages',
    'twitter_profile'
  ];
  
  keysToMigrate.forEach(key => {
    const oldData = localStorage.getItem(key);
    const newKey = `${key}_${userId}`;
    
    if (oldData && !localStorage.getItem(newKey)) {
      localStorage.setItem(newKey, oldData);
      localStorage.removeItem(key);
    }
  });
};

/**
 * Refresh access token using refresh token
 * @returns {Promise<string|null>} - New access token or null
 */
export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh_token: refreshToken })
    });
    
    if (response.ok) {
      const data = await response.json();
      const newToken = data.access_token || data.token;
      
      if (newToken) {
        localStorage.setItem('token', newToken);
        if (data.refresh_token) {
          localStorage.setItem('refreshToken', data.refresh_token);
        }
        return newToken;
      }
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
  }
  
  return null;
};

/**
 * Handle logout
 */
export const logout = async () => {
  const token = localStorage.getItem('token');
  
  // Try to notify backend about logout (fire and forget)
  if (token) {
    try {
      fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).catch(() => {}); // Ignore errors
    } catch (error) {
      // Ignore logout errors
    }
  }
  
  // Clear all user data
  clearUserData();
  
  // Redirect to login page
  window.location.href = '/login';
};

/**
 * Check if user is authenticated
 * @returns {boolean} - True if authenticated
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  
  if (!token || !userId) return false;
  
  // Optionally check if token is expired
  // Note: Even if expired, backend should handle it
  return true;
};

/**
 * Get authentication headers for API calls
 * @returns {object} - Headers object
 * @throws {Error} - If no token found
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
 * Get current user's token
 * @returns {string|null} - Token or null
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Get current user's ID
 * @returns {string|null} - User ID or null
 */
export const getCurrentUserId = () => {
  return localStorage.getItem('userId');
};

export default {
  clearUserData,
  initializeUserSession,
  getUserIdFromToken,
  getUserStorageKey,
  setUserData,
  getUserData,
  isPlatformLinked,
  updateLinkedAccount,
  migrateOldDataToUserSpecific,
  logout,
  isAuthenticated,
  getAuthHeaders,
  isTokenExpired,
  refreshAccessToken,
  getToken,
  getCurrentUserId
};