'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useUser } from '@/lib/hooks/useUser';
import { useUpgrade } from '@/lib/hooks/useUpgrade';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import UsageIndicator from '@/components/UsageIndicator';
import UpgradeModal from '@/components/UpgradeModal';
import UpgradeButton from '@/components/UpgradeButton';
import StoryList from '@/components/StoryList';
import { StoryCardProps } from '@/components/StoryCard';
import { useStories } from '@/lib/hooks/useStories';
import { DashboardSkeleton } from '@/components/SkeletonLoader';
import ErrorMessage from '@/components/ErrorMessage';

function DashboardContent() {
  const router = useRouter();
  const { logout } = useAuth();
  const { user, tier } = useUser();
  const { isUpgradeModalOpen, upgradeReason, resetDate, openUpgradeModal, closeUpgradeModal } =
    useUpgrade();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'dashboard' | 'stories' | 'settings'>('dashboard');
  const { stories, isLoading: isLoadingStories, error: storiesError, refresh, deleteStory } = useStories();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleViewStory = (storyId: string) => {
    router.push(`/story/${storyId}`);
  };

  const handleDeleteStory = async (storyId: string) => {
    try {
      setDeleteError(null);
      await deleteStory(storyId);
    } catch (error) {
      console.error('Error deleting story:', error);
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete story');
    }
  };

  const handleExportStory = async (storyId: string) => {
    // Will be implemented in later tasks
    console.log('Export story:', storyId);
  };

  const handleUploadDataset = () => {
    // Will be implemented in later tasks
    console.log('Upload dataset');
  };

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const navigationItems = [
    {
      id: 'dashboard' as const,
      name: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'stories' as const,
      name: 'Stories',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: 'settings' as const,
      name: 'Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 mr-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-900">DataStory AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              {tier === 'free' && (
                <UpgradeButton
                  onClick={() => openUpgradeModal('general')}
                  variant="outline"
                  size="sm"
                />
              )}
              <div className="hidden sm:flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-gray-600 hidden md:inline">{user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-20 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === item.id
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="pt-16 lg:pl-64 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Usage Indicator */}
          <div className="mb-6">
            <UsageIndicator
              onUpgradeClick={() => openUpgradeModal('general')}
              className="mb-6"
            />
          </div>

          {/* Error Messages */}
          {(storiesError || deleteError) && (
            <ErrorMessage
              title="Error"
              message={storiesError || deleteError || 'An error occurred'}
              retryable={true}
              onRetry={() => {
                setDeleteError(null);
                refresh();
              }}
              className="mb-6"
            />
          )}

          {/* Content based on active section */}
          {activeSection === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-100 rounded-lg p-3">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Stories</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {isLoadingStories ? '...' : stories.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">This Month</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {isLoadingStories ? '...' : user?.storiesRemaining !== undefined ? 
                          Math.max(0, (user.tier === 'free' ? 3 : 999) - (user.storiesRemaining || 0)) : 
                          stories.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Current Tier</p>
                      <p className="text-2xl font-bold text-gray-900 capitalize">{tier || 'Free'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Stories */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Stories</h3>
                  {stories.length > 0 && (
                    <button
                      onClick={() => setActiveSection('stories')}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      View all
                    </button>
                  )}
                </div>
                <StoryList
                  stories={stories.slice(0, 3)}
                  isLoading={isLoadingStories}
                  onView={handleViewStory}
                  onDelete={handleDeleteStory}
                  onExport={handleExportStory}
                />
              </div>
            </div>
          )}

          {activeSection === 'stories' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                  <h2 className="text-2xl font-bold text-gray-900">Your Stories</h2>
                  <button
                    onClick={refresh}
                    disabled={isLoadingStories}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    title="Refresh stories"
                  >
                    <svg className={`w-5 h-5 ${isLoadingStories ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleUploadDataset}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  New Story
                </button>
              </div>

              {/* Stories Grid */}
              <StoryList
                stories={stories}
                isLoading={isLoadingStories}
                onView={handleViewStory}
                onDelete={handleDeleteStory}
                onExport={handleExportStory}
              />
            </div>
          )}

          {activeSection === 'settings' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600">Settings coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
        currentTier={tier || 'free'}
        reason={upgradeReason}
        resetDate={resetDate}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
