import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    await axios.post('https://api.automation365.io/auth/reset-password', {
      email: email.trim()
    }).catch(() => {}); // Ignore error since email sends before backend error
    
    setLoading(false);
    toast.success('OTP sent to your email!');
    navigate('/reset-password', { state: { email: email.trim() } });
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full p-3 rounded-lg border border-gray-200"
                  required
                />
              </div>

              <Button 
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Code'}
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