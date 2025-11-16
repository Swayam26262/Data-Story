'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useUser } from '@/lib/hooks/useUser';

interface ProfileDropdownProps {
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onLogoutClick?: () => void;
}

export default function ProfileDropdown({
  onProfileClick,
  onSettingsClick,
  onLogoutClick,
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const { logout } = useAuth();

  // Get user initials for avatar fallback
  const getInitials = (email: string): string => {
    if (!email) return '?';
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setIsOpen(false);
    if (onLogoutClick) {
      onLogoutClick();
    } else {
      await logout();
    }
  };

  const handleProfileClick = () => {
    setIsOpen(false);
    if (onProfileClick) {
      onProfileClick();
    }
  };

  const handleSettingsClick = () => {
    setIsOpen(false);
    if (onSettingsClick) {
      onSettingsClick();
    }
  };

  return (
    <div className="relative z-50" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/50"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        {/* Avatar with gradient border */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary p-[2px]">
            <div className="w-full h-full rounded-full bg-[#0A0A0A] flex items-center justify-center font-semibold text-sm text-primary">
              {user?.email ? getInitials(user.email) : '?'}
            </div>
          </div>
        </div>
        
        {/* User info - hidden on mobile */}
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-white">
            {user?.email?.split('@')[0] || 'User'}
          </div>
          <div className="text-xs text-[#A0A0A0] capitalize">
            {user?.tier || 'Free'} Plan
          </div>
        </div>

        {/* Chevron */}
        <ChevronDown
          className={`hidden md:block w-4 h-4 text-[#A0A0A0] transition-transform duration-300 ease-in-out ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-[#0A0A0A] rounded-2xl shadow-2xl border border-[#2a2a2a] py-2 z-50 animate-slideDown">
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-white/10">
            <div className="text-sm font-medium text-white truncate">
              {user?.email || 'user@example.com'}
            </div>
            <div className="text-xs text-[#A0A0A0] mt-1 capitalize">
              {user?.tier || 'Free'} Plan
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={handleProfileClick}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <User className="w-4 h-4 text-[#A0A0A0]" />
              <span>Profile</span>
            </button>

            <button
              onClick={handleSettingsClick}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <Settings className="w-4 h-4 text-[#A0A0A0]" />
              <span>Settings</span>
            </button>
          </div>

          {/* Logout Section */}
          <div className="border-t border-white/10 pt-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500/50"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
