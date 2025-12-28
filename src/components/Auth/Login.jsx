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
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    // Clear any previous user's data when login page loads
    clearUserData();
    
    // Handle OAuth callback - check for tokens in query params
    const success = searchParams.get('success');
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refresh_token');
    const error = searchParams.get('error');
    
    if (success === 'true' && token) {
      handleOAuthSuccess(token, refreshToken);
    } else if (error) {
      toast.error(decodeURIComponent(error));
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);

  const handleOAuthSuccess = async (token, refreshToken) => {
    try {
      // Clear any previous user data first
      clearUserData();
      
      // Initialize user session with proper isolation
      const userId = await initializeUserSession(token, {
        refreshToken: refreshToken,
        email: searchParams.get('email') || null
      });
      
      console.log('OAuth login successful for user:', userId);
      toast.success('Login successful!');
      
      // Clear URL params and redirect
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Check if user has linked accounts using /instagram endpoint
      try {
        const response = await axios.get('https://api.automation365.io/instagram', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // If we get an id, Instagram is linked
        if (response.data && response.data.id) {
          // Store in localStorage for user
          if (userId) {
            localStorage.setItem(`linkedAccounts_${userId}`, JSON.stringify({
              instagram: true,
              facebook: false,
              whatsapp: false,
              twitter: false
            }));
            localStorage.setItem(`instagram_profile_${userId}`, JSON.stringify({
              id: response.data.id,
              dp: response.data.dp
            }));
          }
          navigate('/Overview');
        } else {
          navigate('/Onboarding2');
        }
      } catch (err) {
        // No Instagram linked or error - go to onboarding
        console.log('No linked accounts found, redirecting to onboarding');
        navigate('/Onboarding2');
      }
    } catch (error) {
      console.error('OAuth session initialization failed:', error);
      toast.error('Login failed. Please try again.');
      clearUserData();
    }
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
      // Clear any previous user's data before login attempt
      clearUserData();
      
      const response = await axios.post('https://api.automation365.io/auth/login', {
        email: formData.email,
        password: formData.password
      });
      
      if (response.data.token) {
        // Initialize new user session with proper isolation
        const userId = await initializeUserSession(response.data.token, {
          userId: response.data.userId || response.data.user_id,
          email: response.data.email || formData.email,
          name: response.data.name || response.data.userName,
          refreshToken: response.data.refresh_token || response.data.refreshToken
        });
        
        console.log('User logged in:', userId);
        toast.success('Login successful!');
        
        // Check if user has linked accounts using /instagram endpoint
        try {
          const instaResponse = await axios.get('https://api.automation365.io/instagram', {
            headers: { Authorization: `Bearer ${response.data.token}` }
          });
          
          // If we get an id, Instagram is linked
          if (instaResponse.data && instaResponse.data.id) {
            // Store in localStorage
            if (userId) {
              localStorage.setItem(`linkedAccounts_${userId}`, JSON.stringify({
                instagram: true,
                facebook: false,
                whatsapp: false,
                twitter: false
              }));
              localStorage.setItem(`instagram_profile_${userId}`, JSON.stringify({
                id: instaResponse.data.id,
                dp: instaResponse.data.dp
              }));
            }
            navigate('/Overview');
          } else {
            navigate('/Onboarding2');
          }
        } catch (err) {
          // No Instagram linked - check localStorage as fallback
          const linkedAccounts = JSON.parse(
            localStorage.getItem(`linkedAccounts_${userId}`) || '{}'
          );
          const hasLinkedAccounts = Object.values(linkedAccounts).some(val => val === true);
          
          if (hasLinkedAccounts) {
            navigate('/Overview');
          } else {
            navigate('/Onboarding2');
          }
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        toast.error('User not found. Please sign up first.');
        navigate('/');
      } else if (error.response?.status === 401) {
        if (errorMessage === 'User used Google login flow' || errorMessage === 'Please use Google/Social login') {
          toast.error('This account uses Google Sign-In. Please use the Google login option.');
        } else {
          toast.error('Invalid email or password');
        }
      } else {
        toast.error(errorMessage);
      }
      
      // Clear any partial data on login failure
      clearUserData();
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Clear any existing user data before OAuth
    clearUserData();
    
    // Simply redirect to backend Google OAuth endpoint
    window.location.href = 'https://api.automation365.io/auth/google-login';
  };

  const handleAppleLogin = () => {
    toast.info('Apple Sign In coming soon!');
  };

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