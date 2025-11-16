'use client';

import { useState } from 'react';
import { useUser } from '@/lib/hooks/useUser';
import { User, Lock, Bell, Palette, CreditCard, Save } from 'lucide-react';

export default function SettingsPage() {
  const { user, tier } = useUser();
  const [activeTab, setActiveTab] = useState<'account' | 'security' | 'notifications' | 'theme' | 'billing'>('account');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Form states
  const [accountData, setAccountData] = useState({
    name: user?.email?.split('@')[0] || '',
    email: user?.email || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    storyComplete: true,
    weeklyDigest: false,
    productUpdates: true,
  });

  const [themeSettings, setThemeSettings] = useState({
    theme: 'dark',
    accentColor: 'green',
  });

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSaveMessage('Settings saved successfully!');
    setIsSaving(false);
    
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">Settings</h2>
        <p className="text-[#A0A0A0] mt-2">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ease-in-out text-sm font-medium ${
                    activeTab === tab.id
                      ? 'bg-primary/20 text-primary'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-[#0A0A0A] rounded-2xl border border-[#2a2a2a] shadow-lg p-8">
            {/* Account Settings */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Account Information</h3>
                  <p className="text-[#A0A0A0] text-sm mb-6">Update your account details</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Name</label>
                    <input
                      type="text"
                      value={accountData.name}
                      onChange={(e) => setAccountData({ ...accountData, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-black border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Email</label>
                    <input
                      type="email"
                      value={accountData.email}
                      onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                      className="w-full px-4 py-2.5 bg-black border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-background-dark rounded-lg font-medium hover:bg-primary/80 transition-all disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Change Password</h3>
                  <p className="text-[#A0A0A0] text-sm mb-6">Update your password to keep your account secure</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Current Password</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-4 py-2.5 bg-black border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-2.5 bg-black border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2.5 bg-black border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-background-dark rounded-lg font-medium hover:bg-primary/80 transition-all disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Notification Preferences</h3>
                  <p className="text-[#A0A0A0] text-sm mb-6">Choose what notifications you want to receive</p>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
                    { key: 'storyComplete', label: 'Story Completion', description: 'Get notified when your story is ready' },
                    { key: 'weeklyDigest', label: 'Weekly Digest', description: 'Receive a weekly summary of your activity' },
                    { key: 'productUpdates', label: 'Product Updates', description: 'Stay informed about new features' },
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between p-4 bg-black/50 rounded-lg border border-[#2a2a2a]">
                      <div>
                        <p className="text-white font-medium">{setting.label}</p>
                        <p className="text-[#A0A0A0] text-sm">{setting.description}</p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, [setting.key]: e.target.checked })}
                          className="peer sr-only"
                        />
                        <div className="h-6 w-11 rounded-full bg-[#2a2a2a] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full" />
                      </label>
                    </div>
                  ))}

                  <div className="pt-4">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-background-dark rounded-lg font-medium hover:bg-primary/80 transition-all disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Theme Settings */}
            {activeTab === 'theme' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Theme Preferences</h3>
                  <p className="text-[#A0A0A0] text-sm mb-6">Customize your dashboard appearance</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">Theme Mode</label>
                    <div className="grid grid-cols-2 gap-4">
                      {['dark', 'light'].map((theme) => (
                        <button
                          key={theme}
                          onClick={() => setThemeSettings({ ...themeSettings, theme })}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            themeSettings.theme === theme
                              ? 'border-primary bg-primary/10'
                              : 'border-[#2a2a2a] hover:border-[#3a3a3a]'
                          }`}
                        >
                          <div className="text-white font-medium capitalize">{theme}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-3">Accent Color</label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { name: 'green', color: '#39FF14' },
                        { name: 'blue', color: '#00B4D8' },
                        { name: 'purple', color: '#BF00FF' },
                      ].map((accent) => (
                        <button
                          key={accent.name}
                          onClick={() => setThemeSettings({ ...themeSettings, accentColor: accent.name })}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            themeSettings.accentColor === accent.name
                              ? 'border-primary'
                              : 'border-[#2a2a2a] hover:border-[#3a3a3a]'
                          }`}
                        >
                          <div className="w-full h-8 rounded" style={{ backgroundColor: accent.color }} />
                          <div className="text-white text-sm mt-2 capitalize">{accent.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-background-dark rounded-lg font-medium hover:bg-primary/80 transition-all disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? 'Saving...' : 'Save Theme'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Settings */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Subscription & Billing</h3>
                  <p className="text-[#A0A0A0] text-sm mb-6">Manage your subscription and payment methods</p>
                </div>

                <div className="space-y-6">
                  {/* Current Plan */}
                  <div className="p-6 bg-black/50 rounded-lg border border-[#2a2a2a]">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-white capitalize">{tier || 'Free'} Plan</h4>
                        <p className="text-[#A0A0A0] text-sm">
                          {tier === 'free' ? 'Basic features for individuals' : 'Advanced features for professionals'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">
                          {tier === 'free' ? '$0' : '$49'}
                        </p>
                        <p className="text-[#A0A0A0] text-sm">per month</p>
                      </div>
                    </div>
                    {tier === 'free' && (
                      <button className="w-full mt-4 px-6 py-2.5 bg-primary text-background-dark rounded-lg font-medium hover:bg-primary/80 transition-all">
                        Upgrade to Pro
                      </button>
                    )}
                  </div>

                  {/* Usage Stats */}
                  <div className="p-6 bg-black/50 rounded-lg border border-[#2a2a2a]">
                    <h4 className="text-lg font-semibold text-white mb-4">Usage This Month</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#A0A0A0]">Stories Created</span>
                        <span className="text-white font-medium">{user?.storiesThisMonth || 0} / {user?.limits?.storiesPerMonth || 3}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#A0A0A0]">Data Sources</span>
                        <span className="text-white font-medium">1 / {tier === 'free' ? 2 : 20}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  {tier !== 'free' && (
                    <div className="p-6 bg-black/50 rounded-lg border border-[#2a2a2a]">
                      <h4 className="text-lg font-semibold text-white mb-4">Payment Method</h4>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-8 bg-gradient-to-r from-primary to-secondary rounded flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">•••• •••• •••• 4242</p>
                          <p className="text-[#A0A0A0] text-sm">Expires 12/25</p>
                        </div>
                      </div>
                      <button className="mt-4 text-primary hover:text-primary/80 text-sm font-medium">
                        Update Payment Method
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Save Message */}
            {saveMessage && (
              <div className="mt-6 p-4 bg-primary/10 border border-primary/50 rounded-lg">
                <p className="text-primary text-sm font-medium">{saveMessage}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
