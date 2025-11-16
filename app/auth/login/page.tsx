'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Loader2, Eye, EyeOff, Menu } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailBlur = () => {
    if (email && !validateEmail(email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
    } else {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { email?: string; password?: string; general?: string } = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await login(email, password, rememberMe);
      router.push('/dashboard');
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Login failed. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-dark">
      <header className="sticky top-0 z-50 flex items-center justify-center border-b border-solid border-white/10 bg-background-dark/80 px-6 py-5 backdrop-blur-md">
        <div className="flex w-full max-w-[1400px] items-center justify-between">
          <Link href="/" className="flex items-center">
            <img
              src="https://res.cloudinary.com/df2oollzg/image/upload/v1763258462/Untitled-2025-09-29-1243-Photoroom_zrs60z.png"
              alt="DataStory AI"
              className="h-14 w-auto"
            />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/auth/register"
              className="text-white text-base font-semibold leading-normal hover:text-primary transition-colors"
            >
              Sign Up
            </Link>
          </div>
          <div className="md:hidden">
            <button className="text-primary">
              <Menu className="w-7 h-7" />
            </button>
          </div>
        </div>
      </header>
      
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
        <div className="bg-gradient-to-br from-[#0A0A0A] to-[#111111] rounded-2xl shadow-2xl border border-white/10 p-10">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center justify-center mb-6">
              <img
                src="https://res.cloudinary.com/df2oollzg/image/upload/v1763258462/Untitled-2025-09-29-1243-Photoroom_zrs60z.png"
                alt="DataStory AI"
                className="h-16 w-auto"
              />
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-[#A0A0A0]">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
                <p className="text-sm">{errors.general}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleEmailBlur}
                className={`w-full px-4 py-3 bg-[#1A1A1A] border rounded-lg text-white placeholder-[#666] focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                  errors.email ? 'border-red-500' : 'border-white/10'
                }`}
                placeholder="you@example.com"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-white mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 pr-12 bg-[#1A1A1A] border rounded-lg text-white placeholder-[#666] focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                    errors.password ? 'border-red-500' : 'border-white/10'
                  }`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-white/20 rounded bg-[#1A1A1A]"
                  disabled={isLoading}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-[#A0A0A0]">
                  Remember me
                </label>
              </div>

              <Link
                href="/auth/reset-password"
                className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-background-dark py-3 px-4 rounded-lg font-bold hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#A0A0A0]">
              Don't have an account?{' '}
              <Link href="/auth/register" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
