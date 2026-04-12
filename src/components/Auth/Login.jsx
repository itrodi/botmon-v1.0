import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { processOAuthCallback } from '@/utils/authUtils';
import { API_BASE_URL } from '@/config/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const validate = ({ email, password }) => {
    const nextErrors = {};
    if (!email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      nextErrors.email = 'Please enter a valid email address';
    }
    if (!password) {
      nextErrors.password = 'Password is required';
    } else if (password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
    }
    return nextErrors;
  };

  useEffect(() => {
    const result = processOAuthCallback();

    if (!result.isOAuthCallback) return;

    if (result.success && result.token) {
      setOauthLoading(true);
      toast.success('Login successful!');
      navigate('/Overview');
    } else if (result.error) {
      const err = result.error;
      if (err.toLowerCase().includes('without using') ||
          err.toLowerCase().includes('oauth flow') ||
          err.toLowerCase().includes('google oauth')) {
        toast.error('This email was registered with password. Please use email and password to login.');
      } else if (err.toLowerCase().includes('already logged in') ||
                 err.toLowerCase().includes('already exists')) {
        toast.error('This account already exists. Please login instead.');
      } else {
        toast.error(err || 'Login failed. Please try again.');
      }
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = validate(formData);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: formData.email,
        password: formData.password
      });
      
      if (response.data.token) {
        // Store token
        localStorage.setItem('token', response.data.token);
        if (response.data.refresh_token || response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refresh_token || response.data.refreshToken);
        }
        if (response.data.email || formData.email) {
          localStorage.setItem('userEmail', response.data.email || formData.email);
        }
        
        toast.success('Login successful!');
        
        // Go directly to Overview - no need to check linked accounts
        navigate('/Overview');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      
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
    setOauthLoading(true);
    // Backend redirects to /Overview which handles the token
    window.location.href = `${API_BASE_URL}/auth/google-login`;
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

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="space-y-5">
                <div>
                  <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    id="login-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    aria-invalid={errors.email ? 'true' : 'false'}
                    aria-describedby={errors.email ? 'login-email-error' : undefined}
                    className={`w-full p-3 rounded-lg border ${
                      errors.email ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.email && (
                    <p id="login-email-error" className="mt-1 text-sm text-red-600">
                      {errors.email}
                    </p>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <Link to="/forgot-password" className="text-sm text-purple-600 hover:text-purple-700">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      aria-invalid={errors.password ? 'true' : 'false'}
                      aria-describedby={errors.password ? 'login-password-error' : undefined}
                      className={`w-full p-3 pr-10 rounded-lg border ${
                        errors.password ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <Eye className="h-5 w-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p id="login-password-error" className="mt-1 text-sm text-red-600">
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
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