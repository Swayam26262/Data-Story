'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useUser } from '@/lib/hooks/useUser';
import { useUpgrade } from '@/lib/hooks/useUpgrade';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import UsageIndicator from '@/components/UsageIndicator';
import UpgradeModal from '@/components/UpgradeModal';
import StoryList from '@/components/StoryList';
import { useStories } from '@/lib/hooks/useStories';
import ErrorMessage from '@/components/ErrorMessage';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import ProfileDropdown from '@/components/dashboard/ProfileDropdown';
import ProfileModal from '@/components/dashboard/ProfileModal';
import StatsCards from '@/components/dashboard/StatsCards';
import SettingsPage from '@/components/dashboard/SettingsPage';
import FileUpload from '@/components/FileUpload';
import { HelpCircle, Settings, Trash2, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

function DashboardContent() {
  const router = useRouter();
  const { logout } = useAuth();
  const { user, tier } = useUser();
  const { isUpgradeModalOpen, upgradeReason, resetDate, openUpgradeModal, closeUpgradeModal } =
    useUpgrade();
  const [activeSection, setActiveSection] = useState<'dashboard' | 'stories' | 'settings' | 'profile'>('dashboard');
  const [view, setView] = useState<'main' | 'upload'>('main');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
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
    setView('upload');
  };

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  // Calculate stories this month
  const storiesThisMonth = user?.storiesThisMonth || 0;
  const userInitial = user?.email ? user.email[0].toUpperCase() : 'U';

  return (
    <DashboardLayout
      activeSection={activeSection}
      header={
        <DashboardHeader
          profileDropdown={
            <ProfileDropdown
              onProfileClick={() => setIsProfileModalOpen(true)}
              onSettingsClick={() => setActiveSection('settings')}
              onLogoutClick={handleLogout}
            />
          }
        />
      }
      sidebar={
        <DashboardSidebar
          activeSection={activeSection}
          onNavigate={setActiveSection}
        />
      }
    >
      <div className="space-y-8">
        {/* Usage Indicator */}
        <UsageIndicator
          onUpgradeClick={() => openUpgradeModal('general')}
        />

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
          />
        )}

        {/* Content based on active section */}
        {view === 'main' && activeSection === 'dashboard' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-white">Dashboard</h2>
            
            {/* Stats Cards */}
            <StatsCards
              totalStories={stories.length}
              storiesThisMonth={storiesThisMonth}
              currentTier={tier || 'free'}
              isLoading={isLoadingStories}
            />

            {/* Upload Section */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-6">Create New Story</h3>
              <FileUpload 
                onUploadComplete={(jobId) => {
                  router.push(`/story/${jobId}`);
                }}
              />
            </div>
          </div>
        )}

        {view === 'main' && activeSection === 'stories' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-4">
                <h2 className="text-3xl font-bold text-white">Your Stories</h2>
                <button
                  onClick={refresh}
                  disabled={isLoadingStories}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300 ease-in-out disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  title="Refresh stories"
                  aria-label="Refresh stories"
                >
                  <svg className={`w-5 h-5 ${isLoadingStories ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              <button
                type="button"
                onClick={handleUploadDataset}
                className="inline-flex items-center px-4 py-2.5 bg-primary text-background-dark hover:bg-primary/80 rounded-lg text-base font-medium transition-colors shadow-lg touch-manipulation"
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

        {view === 'upload' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <button
                  type="button"
                  onClick={() => setView('main')}
                  className="inline-flex items-center gap-2 text-sm text-[#9CA3AF] hover:text-white transition-colors"
                >
                  <span className="inline-block rotate-180">➜</span>
                  <span>Back to Stories</span>
                </button>
                <h2 className="mt-3 text-3xl font-bold text-white">Upload Asset Files</h2>
                <p className="mt-1 text-sm text-[#9CA3AF]">
                  Manage your datasets and other attachments to generate new stories.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="h-10 w-10 rounded-full bg-[#0A0A0A] border border-white/10 flex items-center justify-center text-[#9CA3AF] hover:bg-white/5 transition-colors"
                >
                  <HelpCircle className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  className="h-10 w-10 rounded-full bg-[#0A0A0A] border border-white/10 flex items-center justify-center text-[#9CA3AF] hover:bg-white/5 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-background-dark font-bold text-sm">
                  {userInitial}
                </div>
              </div>
            </div>

            <section>
              <div className="border-2 border-dashed border-primary/60 rounded-xl bg-primary/10 px-4 py-8 sm:px-6 flex flex-col items-center justify-center">
                <FileUpload />
              </div>
            </section>


          </div>
        )}

        {activeSection === 'settings' && (
          <SettingsPage />
        )}

        {activeSection === 'profile' && (
          <div className="space-y-4 md:space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-white">Profile</h2>
            <div className="bg-[#0A0A0A] rounded-xl shadow-lg p-6 border border-secondary/50">
              <p className="text-[#D4D4D4]">Profile page coming soon...</p>
            </div>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onLogout={handleLogout}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
        currentTier={tier || 'free'}
        reason={upgradeReason}
        resetDate={resetDate}
      />
    </DashboardLayout>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
