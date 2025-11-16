'use client';

import React, { useState } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeSection?: 'dashboard' | 'stories' | 'settings' | 'profile';
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
}

export default function DashboardLayout({
  children,
  activeSection = 'dashboard',
  header,
  sidebar,
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black flex">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-background-dark focus:rounded-lg focus:font-medium focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Sidebar */}
      {sidebar && React.cloneElement(sidebar as React.ReactElement, {
        activeSection,
        isOpen: isSidebarOpen,
        onClose: () => setIsSidebarOpen(false),
      })}

      <div className="flex-1 flex flex-col">
        {/* Header */}
        {header && React.cloneElement(header as React.ReactElement, {
          onMenuClick: () => setIsSidebarOpen(!isSidebarOpen),
        })}

        {/* Main Content */}
        <main id="main-content" className="flex-1 w-full" tabIndex={-1}>
          <div className="max-w-[1400px] mx-auto px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
