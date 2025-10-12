// authUtils.js - Authentication utility functions

/**
 * Clear all user-specific data from localStorage
 * Call this when a user logs out
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
   * Initialize new user session
   * Call this when a user logs in
   */
  export const initializeUserSession = async (token, userData = {}) => {
    // Clear any previous user's data first
    clearUserData();
    
    // Extract user ID from token or userData
    const userId = await getUserIdFromToken(token) || userData.userId || userData.id;
    
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
   * Get user ID from JWT token
   */
  export const getUserIdFromToken = async (token) => {
    try {
      // Check if it's a JWT token
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        return payload.user_id || payload.userId || payload.sub || null;
      }
    } catch (error) {
      console.error('Error parsing token:', error);
    }
    
    // If not a JWT or parsing failed, try to get from backend
    try {
      const response = await fetch('https://api.automation365.io/user/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.userId || data.id || null;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
    
    // Fallback: create a hash from the token
    return btoa(token).substring(0, 16);
  };
  
  /**
   * Get user-specific storage key
   */
  export const getUserStorageKey = (key) => {
    const userId = localStorage.getItem('userId');
    return userId ? `${key}_${userId}` : key;
  };
  
  /**
   * Store user-specific data
   */
  export const setUserData = (key, value) => {
    const storageKey = getUserStorageKey(key);
    if (typeof value === 'object') {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } else {
      localStorage.setItem(storageKey, value);
    }
  };
  
  /**
   * Get user-specific data
   */
  export const getUserData = (key, defaultValue = null) => {
    const storageKey = getUserStorageKey(key);
    try {
      const data = localStorage.getItem(storageKey);
      if (data) {
        // Try to parse as JSON, if it fails return as string
        try {
          return JSON.parse(data);
        } catch {
          return data;
        }
      }
    } catch (error) {
      console.error('Error getting user data:', error);
    }
    return defaultValue;
  };
  
  /**
   * Check if current user has linked a specific platform
   */
  export const isPlatformLinked = (platform) => {
    const linkedAccounts = getUserData('linkedAccounts', {});
    return linkedAccounts[platform] === true;
  };
  
  /**
   * Update linked accounts status
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
    
    // List of keys to migrate
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
      
      // If old data exists and new key doesn't exist, migrate
      if (oldData && !localStorage.getItem(newKey)) {
        localStorage.setItem(newKey, oldData);
        localStorage.removeItem(key); // Remove old key after migration
      }
    });
  };
  
  /**
   * Handle logout
   */
  export const logout = () => {
    // Clear all user data
    clearUserData();
    
    // Redirect to login page
    window.location.href = '/login';
  };
  
  /**
   * Check if user is authenticated
   */
  export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    return !!(token && userId);
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
    getAuthHeaders
  };