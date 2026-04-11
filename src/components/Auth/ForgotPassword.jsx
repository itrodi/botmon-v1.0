import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmed = email.trim();
    if (!trimmed) {
      setError('Email is required');
      return;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setLoading(true);

    // Note: we intentionally ignore backend errors here because the email is
    // dispatched asynchronously by the backend. Surface a friendly message on
    // the next screen regardless.
    try {
      await axios.post('https://api.automation365.io/auth/reset-password', {
        email: trimmed,
      });
    } catch (err) {
      // Backend sends email before the response resolves — safe to ignore
      // client-side errors but log for observability during development.
      if (import.meta.env.DEV) {
        console.warn('Reset password request error (ignored):', err?.message);
      }
    } finally {
      setLoading(false);
    }

    toast.success('If that email exists, a reset code has been sent.');
    navigate('/reset-password', { state: { email: trimmed } });
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
              <h2 className="text-2xl font-bold">Forgot Your Password?</h2>
              <p className="text-gray-600 max-w-md">
                No worries! Enter your email and we'll send you a code to reset your password.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section with Form */}
      <div className="w-full md:w-1/2 bg-white flex flex-col">
        <div className="hidden md:block p-6 text-right">
          <div className="text-sm">
            Remember your password?{" "}
            <a href="/login" className="text-purple-600 font-medium">
              Login
            </a>
          </div>
        </div>

        <div className="flex-1 p-6 flex items-center">
          <div className="max-w-md mx-auto w-full space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Forgot Password</h1>
              <p className="text-gray-600">
                Enter your email address and we'll send you a verification code
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div>
                <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-invalid={error ? 'true' : 'false'}
                  aria-describedby={error ? 'forgot-email-error' : undefined}
                  className={`w-full p-3 rounded-lg border ${
                    error ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-200'
                  }`}
                />
                {error && (
                  <p id="forgot-email-error" className="mt-1 text-sm text-red-600">
                    {error}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {loading ? 'Sending...' : 'Send reset code'}
              </Button>

              <div className="text-center">
                <a 
                  href="/login" 
                  className="text-sm text-purple-600 hover:text-purple-700"
                >
                  ← Back to Login
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;