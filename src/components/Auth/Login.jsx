import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { initializeUserSession, clearUserData } from '@/utils/authUtils';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    // Handle OAuth callback - check for tokens in query params
    const success = searchParams.get('success');
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refresh_token');
    const error = searchParams.get('error');
    const status = searchParams.get('status');
    
    // Clear URL params immediately to prevent token exposure in browser history
    if (token || error || status || success !== null) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Handle both "true" and "True" (Python sends capitalized)
    const isSuccess = success && (success.toLowerCase() === 'true' || success === 'True');
    const isFailure = success && (success.toLowerCase() === 'false' || success === 'False');
    
    if (isSuccess && token) {
      setOauthLoading(true);
      handleOAuthSuccess(token, refreshToken);
    } else if (isFailure || status === 'false') {
      // Handle specific OAuth errors from backend
      const errorMessage = error || status;
      if (errorMessage) {
        const decodedError = decodeURIComponent(errorMessage.replace(/\+/g, ' '));
        
        // Check for specific error messages from your backend
        if (decodedError.toLowerCase().includes('without using') || 
            decodedError.toLowerCase().includes('oauth flow') ||
            decodedError.toLowerCase().includes('google oauth')) {
          toast.error('This email was registered with password. Please use email and password to login, or sign up with a different Google account.');
        } else if (decodedError.toLowerCase().includes('already logged in') ||
                   decodedError.toLowerCase().includes('already exists')) {
          toast.error('This account already exists. Please login instead.');
        } else {
          toast.error(decodedError || 'Login failed. Please try again.');
        }
      }
      clearUserData();
    } else if (error) {
      toast.error(decodeURIComponent(error.replace(/\+/g, ' ')));
      clearUserData();
    }
  }, [searchParams]);

  const handleOAuthSuccess = async (token, refreshToken) => {
    try {
      // Get the old userId before clearing (if any)
      const oldUserId = localStorage.getItem('userId');
      
      // Extract new userId from token first (don't clear yet)
      let newUserId = null;
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          newUserId = payload.user_id || payload.userId || payload.sub || null;
        }
      } catch (e) {
        console.log('Could not decode token:', e);
      }
      
      console.log('Old userId:', oldUserId, 'New userId:', newUserId);
      
      // Only clear data if it's a different user
      if (oldUserId && newUserId && oldUserId !== newUserId) {
        console.log('Different user logging in, clearing old data');
        clearUserData();
      } else if (!oldUserId) {
        // No previous user, safe to clear
        clearUserData();
      }
      // If same user, don't clear - keep their linked accounts data
      
      // Initialize user session
      const userId = await initializeUserSession(token, {
        refreshToken: refreshToken,
        email: searchParams.get('email') || null
      });
      
      console.log('OAuth login successful for user:', userId);
      toast.success('Login successful!');
      
      // Check if user has linked accounts
      await checkLinkedAccountsAndRedirect(token, userId);
      
    } catch (error) {
      console.error('OAuth session initialization failed:', error);
      toast.error('Login failed. Please try again.');
      clearUserData();
      setOauthLoading(false);
    }
  };

  const checkLinkedAccountsAndRedirect = async (token, userId) => {
    let hasLinkedAccounts = false;
    
    try {
      // First, try to get Instagram status from API
      console.log('Checking Instagram API for user:', userId);
      
      const response = await axios.get('https://api.automation365.io/instagram', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      
      console.log('Instagram API response:', response.data);
      
      // If we get an id, Instagram is linked
      if (response.data && response.data.id) {
        hasLinkedAccounts = true;
        
        // Store in localStorage for user
        if (userId) {
          // Get existing profile data to preserve username
          const existingProfile = JSON.parse(
            localStorage.getItem(`instagram_profile_${userId}`) || '{}'
          );
          
          localStorage.setItem(`linkedAccounts_${userId}`, JSON.stringify({
            instagram: true,
            facebook: false,
            whatsapp: false,
            twitter: false
          }));
          
          localStorage.setItem(`instagram_profile_${userId}`, JSON.stringify({
            id: response.data.id,
            dp: response.data.dp,
            username: response.data.username || existingProfile.username || null,
            profilePicture: response.data.dp || existingProfile.profilePicture || null
          }));
        }
        
        console.log('Instagram is linked, redirecting to Overview');
        navigate('/Overview');
        return;
      }
    } catch (err) {
      console.log('Instagram API error:', err.message);
      // API failed - check localStorage as fallback
    }
    
    // Fallback: Check localStorage for any linked accounts
    if (!hasLinkedAccounts && userId) {
      try {
        const linkedAccounts = JSON.parse(
          localStorage.getItem(`linkedAccounts_${userId}`) || '{}'
        );
        
        console.log('Checking localStorage for linked accounts:', linkedAccounts);
        
        // Check if any account is linked
        hasLinkedAccounts = Object.values(linkedAccounts).some(val => val === true);
        
        if (hasLinkedAccounts) {
          console.log('Found linked accounts in localStorage, redirecting to Overview');
          navigate('/Overview');
          return;
        }
      } catch (e) {
        console.log('Error checking localStorage:', e);
      }
    }
    
    // No linked accounts found - go to onboarding
    console.log('No linked accounts found, redirecting to Onboarding2');
    navigate('/Onboarding2');
    
    setOauthLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post('https://api.automation365.io/auth/login', {
        email: formData.email,
        password: formData.password
      });
      
      if (response.data.token) {
        // Get the old userId before potentially clearing
        const oldUserId = localStorage.getItem('userId');
        
        // Extract new userId from response or token
        let newUserId = response.data.userId || response.data.user_id;
        if (!newUserId) {
          try {
            const tokenParts = response.data.token.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              newUserId = payload.user_id || payload.userId || payload.sub || null;
            }
          } catch (e) {
            console.log('Could not decode token:', e);
          }
        }
        
        console.log('Email login - Old userId:', oldUserId, 'New userId:', newUserId);
        
        // Only clear data if it's a different user
        if (oldUserId && newUserId && oldUserId !== newUserId) {
          console.log('Different user logging in, clearing old data');
          clearUserData();
        } else if (!oldUserId) {
          // No previous user
          clearUserData();
        }
        // If same user, preserve their linked accounts data
        
        // Initialize new user session
        const userId = await initializeUserSession(response.data.token, {
          userId: newUserId,
          email: response.data.email || formData.email,
          name: response.data.name || response.data.userName,
          refreshToken: response.data.refresh_token || response.data.refreshToken
        });
        
        console.log('User logged in:', userId);
        toast.success('Login successful!');
        
        // Check if user has linked accounts
        await checkLinkedAccountsAndRedirect(response.data.token, userId);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        toast.error('User not found. Please sign up first.');
        setTimeout(() => navigate('/'), 1500);
      } else if (error.response?.status === 401) {
        if (errorMessage.includes('Google') || errorMessage.includes('Social')) {
          toast.error('This account uses Google Sign-In. Please click "Sign In with Google" below.');
        } else {
          toast.error('Invalid email or password');
        }
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Clear any existing user data before OAuth
    clearUserData();
    setOauthLoading(true);
    
    // Redirect to backend Google OAuth login endpoint
    window.location.href = 'https://api.automation365.io/auth/google-login';
  };

  const handleAppleLogin = () => {
    toast.info('Apple Sign In coming soon!');
  };

  // Show loading screen during OAuth processing
  if (oauthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Completing login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Section with Logo, Images and Text */}
      <div className="hidden md:flex md:w-1/2 bg-gray-50 flex-col">
        <header className="p-6">
          <div className="font-bold text-xl">
            <img src="/Images/botmon-logo.png" alt="Logo" />
          </div>
        </header>

        <div className="flex-1 p-6">
          <div className="max-w-xl mx-auto w-full space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <img 
                src="/Images/Rectangle1.png" 
                alt="AI Communication"
                className="w-full rounded-lg"
              />
              <img 
                src="/Images/Rectangle2.png" 
                alt="Bot Interface"
                className="w-full rounded-lg"
              />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Welcome Back</h2>
              <p className="text-gray-600 max-w-md">
                Streamline Your Communication with BOTMON AI-Powered Vendor Message Replies
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section with Form */}
      <div className="w-full md:w-1/2 bg-white flex flex-col">
        <div className="hidden md:block p-6 text-right">
          <div className="text-sm">
            Don't have an account?{" "}
            <a href="/" className="text-purple-600 font-medium">
              Sign up
            </a>
          </div>
        </div>

        <div className="flex-1 p-6 flex items-center">
          <div className="max-w-md mx-auto w-full space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Login</h1>
              <p className="text-gray-600">
                Login to access your business dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter Email"
                  className="w-full p-3 rounded-lg border border-gray-200"
                  required
                />
                <div className="relative">
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Password"
                    className="w-full p-3 rounded-lg border border-gray-200"
                    required
                  />
                  <Link to="/forgot-password" className="absolute right-0 -bottom-6 text-sm text-purple-400">
                    Forgotten Password?
                  </Link>
                </div>
              </div>

              <Button 
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">OR</span>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleLogin}
                  className="w-full p-3 border border-gray-200 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50"
                >
                  <img 
                    src="/Images/google.png" 
                    alt="Google"
                    className="w-6 h-6"
                  />
                  Sign In with Google
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAppleLogin}
                  className="w-full p-3 border border-gray-200 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50"
                >
                  <img 
                    src="/Images/apple.png" 
                    alt="Apple"
                    className="w-6 h-6"
                  />
                  Sign In with Apple
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;