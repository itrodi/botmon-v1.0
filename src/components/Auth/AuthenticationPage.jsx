import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { clearUserData } from '@/utils/authUtils';

const AuthenticationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    // Handle OAuth callback
    const success = searchParams.get('success');
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refresh_token');
    const error = searchParams.get('error');
    const status = searchParams.get('status');
    
    // Clear URL params immediately
    if (token || error || status || success !== null) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    const isSuccess = success && (success.toLowerCase() === 'true' || success === 'True');
    const isFailure = success && (success.toLowerCase() === 'false' || success === 'False');
    
    if (isSuccess && token) {
      setOauthLoading(true);
      handleOAuthSuccess(token, refreshToken);
    } else if (isFailure || status === 'false') {
      const errorMessage = error || status;
      if (errorMessage) {
        const decodedError = decodeURIComponent(errorMessage.replace(/\+/g, ' '));
        
        if (decodedError.toLowerCase().includes('already') || 
            decodedError.toLowerCase().includes('exists')) {
          toast.error('An account with this email already exists. Please login instead.');
          setTimeout(() => navigate('/Login'), 2000);
        } else {
          toast.error(decodedError || 'Registration failed.');
        }
      }
    } else if (error) {
      toast.error(decodeURIComponent(error.replace(/\+/g, ' ')));
    }
  }, [searchParams, navigate]);

  const handleOAuthSuccess = async (token, refreshToken) => {
    try {
      // Store token
      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      // Clear linked accounts for new user
      localStorage.setItem('linkedAccounts', JSON.stringify({
        facebook: false,
        twitter: false,
        instagram: false,
        whatsapp: false
      }));
      
      toast.success('Registration successful!');
      navigate('/Onboarding1');
      
    } catch (error) {
      console.error('OAuth registration failed:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setOauthLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post('https://api.automation365.io/auth/register', {
        email: formData.email,
        password: formData.password
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        if (response.data.refresh_token || response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refresh_token || response.data.refreshToken);
        }
        localStorage.setItem('userEmail', formData.email);
        
        // Clear linked accounts for new user
        localStorage.setItem('linkedAccounts', JSON.stringify({
          facebook: false,
          twitter: false,
          instagram: false,
          whatsapp: false
        }));
        
        toast.success('Registration successful!');
        navigate('/Onboarding1');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      
      if (error.response?.status === 409) {
        toast.error('Email already exists. Please login instead.');
        setTimeout(() => navigate('/Login'), 2000);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    clearUserData();
    setOauthLoading(true);
    window.location.href = 'https://api.automation365.io/auth/google-register';
  };

  const handleAppleSignUp = () => {
    toast.info('Apple Sign In coming soon!');
  };

  if (oauthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Creating your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Section */}
      <div className="hidden md:flex md:w-1/2 bg-gray-50 flex-col">
        <header className="p-6">
          <img src="/Images/botmon-logo.png" alt="Logo" />
        </header>

        <div className="flex-1 p-6">
          <div className="max-w-xl mx-auto w-full space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <img src="/Images/Rectangle1.png" alt="AI Communication" className="w-full rounded-lg" />
              <img src="/Images/Rectangle2.png" alt="Bot Interface" className="w-full rounded-lg" />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Get Started</h2>
              <p className="text-gray-600 max-w-md">
                Streamline Your Communication with BOTMON AI-Powered Vendor Message Replies
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full md:w-1/2 bg-white flex flex-col">
        <div className="hidden md:block p-6 text-right">
          <div className="text-sm">
            Already have an account?{" "}
            <a href="/Login" className="text-purple-600 font-medium">Login</a>
          </div>
        </div>

        <div className="flex-1 p-6 flex items-center">
          <div className="max-w-md mx-auto w-full space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Sign Up</h1>
              <p className="text-gray-600">
                Sign up in few steps and continue the onboarding process with ease
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
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password (min 6 characters)"
                  className="w-full p-3 rounded-lg border border-gray-200"
                  minLength={6}
                  required
                />
              </div>

              <Button 
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
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
                  onClick={handleGoogleSignUp}
                  className="w-full p-3 border border-gray-200 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50"
                >
                  <img src="/Images/google.png" alt="Google" className="w-6 h-6" />
                  Sign Up with Google
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAppleSignUp}
                  className="w-full p-3 border border-gray-200 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50"
                >
                  <img src="/Images/apple.png" alt="Apple" className="w-6 h-6" />
                  Sign Up with Apple
                </Button>
              </div>
              
              <div className="text-center md:hidden">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <a href="/Login" className="text-purple-600 font-medium">Login</a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthenticationPage;