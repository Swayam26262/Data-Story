'use client';

import React from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';

interface DashboardHeaderProps {
  onMenuClick?: () => void;
  profileDropdown?: React.ReactNode;
}

export default function DashboardHeader({
  onMenuClick,
  profileDropdown,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-center border-b border-solid border-white/10 bg-background-dark/80 px-6 py-5 backdrop-blur-md">
      <div className="flex w-full max-w-[1400px] items-center justify-between">
        {/* Left: Logo and Mobile Menu */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-primary hover:bg-white/5 rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/50 touch-manipulation"
            aria-label="Toggle menu"
          >
            <Menu className="w-7 h-7" />
          </button>
          
          <Link href="/" className="flex items-center">
            <img
              src="https://res.cloudinary.com/df2oollzg/image/upload/v1763258462/Untitled-2025-09-29-1243-Photoroom_zrs60z.png"
              alt="DataStory AI"
              className="h-14 w-auto"
            />
          </Link>
        </div>

        {/* Right: Profile Dropdown */}
        <div className="flex items-center">
          {profileDropdown}
        </div>
      </div>
    </header>
  );
}
