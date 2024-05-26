import { Link } from 'react-router-dom';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function AuthenticationPage() {
  return (
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Sign Up</h1>
            <p className="text-balance text-muted-foreground">
              Sign Up with a few steps and start automating and manage your business with ease
            </p>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="Name">First Name</Label>
              <Input
                id="Name"
                type="text"
                placeholder="Enter your name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="Name">Last Name</Label>
              <Input
                id="Name"
                type="text"
                placeholder="Enter your name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Phone Number</Label>
              <Input
                id="PhoneNumber"
                type="Phone"
                placeholder="+234"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input id="password" type="password" required />
            </div>
            <Link to="/Onboarding1">
            <Button type="submit" className="w-full">
              Sign Up
            </Button>
            </Link>
            <Button variant="outline" className="w-full">
              Sign Up with Google
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
             Have an account?{" "}
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
                &ldquo;Create an Account to start selling and offering your products and services  and manage your business more efficiently  .&rdquo;
              </p>
              <footer className="text-sm">Botmon</footer>
            </blockquote>
          </div>
        </div>
    </div>
  )
}

export default AuthenticationPage;