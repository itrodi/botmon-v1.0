import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from 'axios';

export function AuthenticationPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fname: '',
    lname: '',
    phone: '',
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });
    
    const form = new FormData();
    for (const key in formData) {
      form.append(key, formData[key]);
    }

    fetch('https://f5eb-172-212-98-191.ngrok-free.app/register', {
      method: 'POST',
      body: form,
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        setIsLoading(false);
        if (data.token) {
          localStorage.setItem('token', data.token);
          setMessage({ text: 'Registration successful!', type: 'success' });
          setTimeout(() => {
            navigate('/Onboarding1');
          }, 2000);
        } else {
          setMessage({ text: 'Registration failed.', type: 'error' });
        }
      })
      .catch((error) => {
        setIsLoading(false);
        console.error('Error:', error);
        setMessage({ text: 'An error occurred. Please try again.', type: 'error' });
      });
  };

  return (
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Sign Up</h1>
            <p className="text-balance text-muted-foreground">
              Sign up with a few steps and start automating and managing your business with ease.
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fname">First Name</Label>
                <Input
                  id="fname"
                  type="text"
                  placeholder="Enter your first name"
                  required
                  value={formData.fname}
                  onChange={handleChange}
                  name="fname"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lname">Last Name</Label>
                <Input
                  id="lname"
                  type="text"
                  placeholder="Enter your last name"
                  required
                  value={formData.lname}
                  onChange={handleChange}
                  name="lname"
                />
              </div>
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
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="text"
                  placeholder="+234"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  name="phone"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
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
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing Up...' : 'Sign Up'}
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            Have an account?{' '}
            <Link to="/Login">
              Login
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
              &ldquo;Create an account to start selling and offering your products and services and manage your business more efficiently.&rdquo;
            </p>
            <footer className="text-sm">Botmon</footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}

export default AuthenticationPage;