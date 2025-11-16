'use client';

import React, { useEffect } from 'react';
import { LayoutDashboard, FileText, Settings, User, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  id: 'dashboard' | 'stories' | 'settings' | 'profile';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DashboardSidebarProps {
  activeSection?: 'dashboard' | 'stories' | 'settings' | 'profile';
  isOpen?: boolean;
  onClose?: () => void;
  onNavigate?: (section: 'dashboard' | 'stories' | 'settings' | 'profile') => void;
}

const navigationItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'stories',
    label: 'Stories',
    icon: FileText,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
  },
];

export default function DashboardSidebar({
  activeSection = 'dashboard',
  isOpen = false,
  onClose,
  onNavigate,
}: DashboardSidebarProps) {
  // Close sidebar on Escape key (mobile only)
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden animate-fadeIn"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-50 h-screen w-64',
          'bg-[#0A0A0A] border-r border-[#2a2a2a]',
          'transition-transform duration-300 ease-in-out',
          'lg:translate-x-0 overflow-y-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          {/* Close button for mobile - top right */}
          <div className="lg:hidden flex justify-end p-4">
            <button
              onClick={onClose}
              className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/50 touch-manipulation"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 pt-8 space-y-3">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (onNavigate) onNavigate(item.id);
                    if (onClose) onClose();
                  }}
                  className={cn(
                    'w-full flex items-center gap-4 px-5 py-4 rounded-xl',
                    'transition-all duration-300 ease-in-out',
                    'text-base font-semibold',
                    'focus:outline-none focus:ring-2 focus:ring-primary/50',
                    isActive
                      ? 'bg-primary/20 text-primary shadow-lg shadow-primary/10'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <Icon className="w-6 h-6" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Upgrade Button */}
          <div className="p-4 border-t border-white/10">
            <button className="w-full px-5 py-4 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all duration-300 ease-in-out text-base font-semibold hover:shadow-lg hover:shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/50">
              Upgrade to Pro
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
