import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from 'axios';

export function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const urlEncodedData = new URLSearchParams();
    urlEncodedData.append('email', formData.email);
    urlEncodedData.append('password', formData.password);

    try {
      console.log('Submitting login form with data:', formData);

      const response = await axios.post('https://f5eb-172-212-98-191.ngrok-free.app/login', urlEncodedData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      console.log('Login response:', response);

      if (response.status === 200 || response.status === 201) {
        setMessage({ text: 'Login successful! Redirecting...', type: 'success' });

        // Extract userId from response and save it to localStorage
        const userId = response.data.userid;
        localStorage.setItem('userId', userId);

        // Optionally save other user data if needed
        localStorage.setItem('user', JSON.stringify(response.data));

        // Set onboarding statuses to true upon successful login
        localStorage.setItem('onboarding1Completed', 'true');
        localStorage.setItem('onboarding2Completed', 'true');

        setTimeout(() => {
          navigate('/Overview');
        }, 2000);
      } else {
        throw new Error('Login failed: ' + response.statusText);
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage({
        text: 'Login unsuccessful: ' + (error.response ? error.response.data.message : error.message),
        type: 'error',
      });
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-balance text-muted-foreground">
              Welcome back, login into your account
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  name="email"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="ml-auto inline-block text-sm underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  name="password"
                />
              </div>
              {message.text && (
                <div className={`p-2 text-center text-sm ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                  {message.text}
                </div>
              )}
              <Button type="submit" className="w-full">
                Login
              </Button>
              <Button variant="outline" className="w-full">
                Login with Google
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <Link to="/">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          Botmon
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Create an Account to start selling and offering your products and services and manage your business more efficiently.&rdquo;
            </p>
            <footer className="text-sm">Botmon</footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}

export default Login;
