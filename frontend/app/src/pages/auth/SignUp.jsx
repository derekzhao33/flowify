import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SignUp = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = () => {
    // Sign up functionality will go here
  };

  const handleLogin = () => {
    // Navigate to login page
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    if (date) {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      setDateOfBirth(`${month}/${day}/${year}`);
    }
  };

  const handleDateInputChange = (e) => {
    const value = e.target.value;
    setDateOfBirth(value);
    
    // Try to parse the date if it's in a valid format
    const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = value.match(dateRegex);
    if (match) {
      const [_, month, day, year] = match;
      const parsedDate = new Date(year, month - 1, day);
      if (!isNaN(parsedDate.getTime())) {
        setSelectedDate(parsedDate);
      }
    }
  };

  return (
    <div className="flex h-[100vh] w-full">
      {/* Left Side - Solid Color */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#181D27] items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-4">Schedu.ai</h1>
          <p className="text-gray-300 text-lg">Your intelligent scheduling assistant</p>
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 py-8">
          {/* Logo for mobile */}
          <div className="lg:hidden space-y-2">
            <h1 className="text-2xl font-bold text-[#181D27]">Schedu.ai</h1>
          </div>

          {/* Sign Up Form */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold text-gray-900">Create account</h2>
            </div>

            <div className="space-y-4">
              {/* First Name and Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Email */}
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

              {/* Password */}
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

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full ${
                    confirmPassword && password && confirmPassword !== password
                      ? 'border-red-500 focus-visible:ring-red-500'
                      : confirmPassword && password && confirmPassword === password
                      ? 'border-green-500 focus-visible:ring-green-500'
                      : ''
                  }`}
                />
                {confirmPassword && password && confirmPassword !== password && (
                  <p className="text-sm text-red-500">Passwords do not match</p>
                )}
                {confirmPassword && password && confirmPassword === password && (
                  <p className="text-sm text-green-600">Passwords match</p>
                )}
              </div>

              {/* Sign Up Button */}
              <Button 
                onClick={handleSignUp}
                className="w-full bg-[#181D27] hover:bg-[#2a3142] text-white font-medium py-6 text-base hover:cursor-pointer"
              >
                Sign up
              </Button>

              {/* Login Link */}
              <div className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={handleLogin}
                  className="font-medium text-[#181D27] hover:text-[#5b6ee1] underline hover:cursor-pointer"
                >
                  Log in here
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;