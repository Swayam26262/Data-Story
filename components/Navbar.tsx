'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  variant?: 'landing' | 'app';
}

export default function Navbar({ variant = 'landing' }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-center border-b border-solid border-white/10 bg-background-dark/80 px-6 py-5 backdrop-blur-md">
      <div className="flex w-full max-w-[1400px] items-center justify-between">
        <Link href="/" className="flex items-center">
          <img
            src="https://res.cloudinary.com/df2oollzg/image/upload/v1763258462/Untitled-2025-09-29-1243-Photoroom_zrs60z.png"
            alt="DataStory AI"
            className="h-14 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-1 justify-end gap-8">
          <div className="flex items-center gap-8">
            {variant === 'landing' ? (
              <>
                <a
                  className="text-white text-base font-semibold leading-normal hover:text-primary transition-colors"
                  href="#features"
                >
                  Features
                </a>
                <a
                  className="text-white text-base font-semibold leading-normal hover:text-primary transition-colors"
                  href="#pricing"
                >
                  Pricing
                </a>
                <a
                  className="text-white text-base font-semibold leading-normal hover:text-primary transition-colors"
                  href="#testimonials"
                >
                  Testimonials
                </a>
                <a
                  className="text-white text-base font-semibold leading-normal hover:text-primary transition-colors"
                  href="#faq"
                >
                  FAQ
                </a>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="text-white text-base font-semibold leading-normal hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
              </>
            )}
          </div>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-4">
              <span className="text-white text-sm">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-6 bg-secondary/20 border border-secondary text-white text-base font-bold leading-normal hover:bg-secondary/30 transition-opacity"
              >
                <span className="truncate">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/auth/register"
              className="flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-6 bg-primary text-background-dark text-base font-bold leading-normal hover:bg-opacity-80 transition-opacity"
            >
              <span className="truncate">Sign Up Free</span>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-primary"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-7 h-7" />
            ) : (
              <Menu className="w-7 h-7" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-background-dark border-b border-white/10 md:hidden">
          <div className="flex flex-col gap-4 p-6">
            {variant === 'landing' ? (
              <>
                <a
                  className="text-white text-base font-semibold leading-normal hover:text-primary transition-colors"
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a
                  className="text-white text-base font-semibold leading-normal hover:text-primary transition-colors"
                  href="#pricing"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </a>
                <a
                  className="text-white text-base font-semibold leading-normal hover:text-primary transition-colors"
                  href="#testimonials"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Testimonials
                </a>
                <a
                  className="text-white text-base font-semibold leading-normal hover:text-primary transition-colors"
                  href="#faq"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  FAQ
                </a>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="text-white text-base font-semibold leading-normal hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </>
            )}

            {isAuthenticated && user ? (
              <>
                <div className="text-white text-sm pt-2 border-t border-white/10">
                  {user.email}
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-6 bg-secondary/20 border border-secondary text-white text-base font-bold leading-normal hover:bg-secondary/30 transition-opacity"
                >
                  <span className="truncate">Logout</span>
                </button>
              </>
            ) : (
              <Link
                href="/auth/register"
                className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-6 bg-primary text-background-dark text-base font-bold leading-normal hover:bg-opacity-80 transition-opacity"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="truncate">Sign Up Free</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
