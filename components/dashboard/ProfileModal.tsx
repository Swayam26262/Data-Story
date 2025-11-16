'use client';

import React, { useEffect, useState } from 'react';
import { X, User, Mail, Crown, Settings, LogOut, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useUser } from '@/lib/hooks/useUser';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

export default function ProfileModal({
  isOpen,
  onClose,
  onLogout,
}: ProfileModalProps) {
  const { user, isLoading: userLoading } = useUser();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  // Get user initials for avatar fallback
  const getInitials = (email: string): string => {
    if (!email) return '?';
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError(null);
    try {
      if (onLogout) {
        onLogout();
      } else {
        await logout();
      }
      onClose();
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : 'Failed to logout');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleRetry = () => {
    // Reload the page to refetch user data
    window.location.reload();
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={handleOverlayClick}
    >
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl mx-4 bg-[#0A0A0A] rounded-xl shadow-2xl border border-secondary/50 overflow-hidden animate-scaleIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#A0A0A0] hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/50 z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-8 pb-6">
          <h2 className="text-2xl font-bold text-white">Profile</h2>
        </div>

        {/* Loading State */}
        {userLoading && (
          <div className="px-8 py-12 flex flex-col items-center justify-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-secondary/30 border-t-primary"></div>
            </div>
            <p className="text-[#A0A0A0] mt-4">Loading profile...</p>
          </div>
        )}

        {/* Error State */}
        {!user && !userLoading && (
          <div className="px-8 py-6">
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-400 mb-2">Failed to load profile</p>
                  <p className="text-sm text-red-300">Unable to retrieve user information</p>
                  <button
                    onClick={handleRetry}
                    className="mt-3 flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500/50 rounded px-2 py-1"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Retry</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Section */}
        {!userLoading && user && (
        <>
          <div className="px-8 pb-6">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-primary text-background-dark flex items-center justify-center font-bold text-2xl flex-shrink-0">
                {user?.email ? getInitials(user.email) : '?'}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-semibold text-white truncate">
                  {user?.email?.split('@')[0] || 'User'}
                </h3>
                <p className="text-sm text-[#A0A0A0] mt-1 truncate">
                  {user?.email || 'user@example.com'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Crown className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary capitalize">
                    {user?.tier || 'Free'} Plan
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details Section */}
          <div className="px-8 py-6 border-t border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Account Details</h3>
            
            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#A0A0A0] mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#D4D4D4]">Email</div>
                  <div className="text-sm text-white mt-1 truncate">
                    {user?.email || 'user@example.com'}
                  </div>
                </div>
              </div>

              {/* Account Tier */}
              <div className="flex items-start gap-3">
                <Crown className="w-5 h-5 text-[#A0A0A0] mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-[#D4D4D4]">Plan</div>
                  <div className="text-sm text-white mt-1 capitalize">
                    {user?.tier || 'Free'}
                  </div>
                </div>
              </div>

              {/* Stories This Month */}
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-[#A0A0A0] mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-[#D4D4D4]">Stories This Month</div>
                  <div className="text-sm text-white mt-1">
                    {user?.storiesThisMonth || 0} / {user?.limits?.storiesPerMonth || 3}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Settings Section */}
          <div className="px-8 py-6 border-t border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Account Settings</h3>
            
            <div className="space-y-2">
              <button
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/5 rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/50"
                onClick={() => {
                  // TODO: Implement settings navigation
                  console.log('Navigate to settings');
                }}
              >
                <Settings className="w-5 h-5 text-[#A0A0A0]" />
                <span>Preferences</span>
              </button>
            </div>
          </div>

          {/* Actions Section */}
          <div className="px-8 py-6 border-t border-white/10">
            {logoutError && (
              <div className="mb-4 bg-red-500/10 border border-red-500/50 rounded-xl p-3">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-red-300">{logoutError}</p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all duration-300 ease-in-out font-medium focus:outline-none focus:ring-2 focus:ring-red-500/50 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-400/30 border-t-red-400"></div>
                  <span>Logging out...</span>
                </>
              ) : (
                <>
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </>
              )}
            </button>
          </div>
        </>
        )}
      </div>
    </div>
  );
}
