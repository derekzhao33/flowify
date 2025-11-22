import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Login functionality will go here
  };

  const handleSignUp = () => {
    // Navigate to sign up page
  };

  return (
    <div className="flex h-full w-full">
      {/* Left Side - Solid Color */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#181D27] items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-4">Schedu.ai</h1>
          <p className="text-gray-300 text-lg">Your intelligent scheduling assistant</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo for mobile */}
          <div className="lg:hidden space-y-2">
            <h1 className="text-2xl font-bold text-[#181D27]">Schedu.ai</h1>
          </div>

          {/* Login Form */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold text-gray-900">Log in</h2>
            </div>

            <div className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Login Button */}
              <Button 
                onClick={handleLogin}
                className="w-full bg-[#181D27] hover:bg-[#2a3142] text-white font-medium py-6 text-base hover:cursor-pointer"
              >
                Log in
              </Button>

              {/* Sign Up Link */}
              <div className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={handleSignUp}
                  className="font-medium text-[#181D27] hover:text-[#5b6ee1] underline hover:cursor-pointer"
                >
                  Sign up here
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;