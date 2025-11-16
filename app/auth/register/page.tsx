'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Loader2, Eye, EyeOff, Menu } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ 
    email?: string; 
    password?: string; 
    confirmPassword?: string;
    terms?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthLabel = (strength: number) => {
    if (strength === 0) return { label: '', color: '' };
    if (strength <= 2) return { label: 'Weak', color: 'bg-red-500' };
    if (strength === 3) return { label: 'Fair', color: 'bg-yellow-500' };
    if (strength === 4) return { label: 'Good', color: 'bg-blue-500' };
    return { label: 'Strong', color: 'bg-primary' };
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleEmailBlur = () => {
    if (email && !validateEmail(email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
    } else {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordBlur = () => {
    if (password) {
      const error = validatePassword(password);
      setErrors(prev => ({ ...prev, password: error || undefined }));
    }
  };

  const handleConfirmPasswordBlur = () => {
    if (confirmPassword && confirmPassword !== password) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
    } else {
      setErrors(prev => ({ ...prev, confirmPassword: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: typeof errors = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordError = validatePassword(password);
      if (passwordError) {
        newErrors.password = passwordError;
      }
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!acceptTerms) {
      newErrors.terms = 'You must accept the terms of service';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await register(email, password);
      router.push('/dashboard');
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Registration failed. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthInfo = getPasswordStrengthLabel(passwordStrength);

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
              href="/auth/login"
              className="text-white text-base font-semibold leading-normal hover:text-primary transition-colors"
            >
              Sign In
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
            <h1 className="text-3xl font-bold text-white mb-2">Create your account</h1>
            <p className="text-[#A0A0A0]">Start transforming data into stories</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  onBlur={handlePasswordBlur}
                  className={`w-full px-4 py-3 pr-12 bg-[#1A1A1A] border rounded-lg text-white placeholder-[#666] focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                    errors.password ? 'border-red-500' : 'border-white/10'
                  }`}
                  placeholder="Create a strong password"
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
              
              {password && !errors.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#A0A0A0]">Password strength:</span>
                    <span className={`text-xs font-semibold ${
                      strengthInfo.label === 'Weak' ? 'text-red-400' :
                      strengthInfo.label === 'Fair' ? 'text-yellow-400' :
                      strengthInfo.label === 'Good' ? 'text-blue-400' :
                      'text-primary'
                    }`}>
                      {strengthInfo.label}
                    </span>
                  </div>
                  <div className="w-full bg-[#1A1A1A] rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${strengthInfo.color}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-white mb-2">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={handleConfirmPasswordBlur}
                  className={`w-full px-4 py-3 pr-12 bg-[#1A1A1A] border rounded-lg text-white placeholder-[#666] focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                    errors.confirmPassword ? 'border-red-500' : 'border-white/10'
                  }`}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            <div>
              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => {
                    setAcceptTerms(e.target.checked);
                    if (e.target.checked) {
                      setErrors(prev => ({ ...prev, terms: undefined }));
                    }
                  }}
                  className="h-4 w-4 mt-1 text-primary focus:ring-primary border-white/20 rounded bg-[#1A1A1A]"
                  disabled={isLoading}
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-[#A0A0A0]">
                  I agree to the{' '}
                  <a href="#" className="text-primary hover:text-primary/80 font-semibold">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary hover:text-primary/80 font-semibold">
                    Privacy Policy
                  </a>
                </label>
              </div>
              {errors.terms && (
                <p className="mt-2 text-sm text-red-400">{errors.terms}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-background-dark py-3 px-4 rounded-lg font-bold hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#A0A0A0]">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
