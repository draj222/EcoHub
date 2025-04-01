'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import { 
  FiMoon, 
  FiSun, 
  FiLock, 
  FiUser, 
  FiBell, 
  FiShield, 
  FiCheckCircle,
  FiAlertCircle,
  FiSave
} from 'react-icons/fi';

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('appearance');
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Password change form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    messageNotifications: true,
    projectUpdates: true,
    mentions: true
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    allowMessaging: true
  });

  // Add useEffect to fetch user preferences
  useEffect(() => {
    // Only load preferences if user is logged in
    if (status === 'authenticated') {
      fetchUserPreferences();
    }
  }, [status]);

  // Function to fetch user preferences
  const fetchUserPreferences = async () => {
    try {
      const response = await fetch('/api/user/preferences');
      
      if (!response.ok) {
        throw new Error('Failed to fetch preferences');
      }
      
      const preferences = await response.json();
      
      // Update state with fetched preferences
      if (preferences.theme) {
        setTheme(preferences.theme);
        // Apply theme to document
        document.documentElement.classList.toggle('dark', preferences.theme === 'dark');
      }
      
      if (preferences.notificationSettings) {
        setNotificationSettings(preferences.notificationSettings);
      }
      
      if (preferences.privacySettings) {
        setPrivacySettings(preferences.privacySettings);
      }
    } catch (err) {
      console.error('Error fetching user preferences:', err);
      // Don't show error to user, just use defaults
    }
  };

  // Redirect if not logged in
  if (status === 'unauthenticated') {
    router.push('/signin?redirect=/settings');
    return null;
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">Loading settings...</div>
          </div>
        </div>
      </div>
    );
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/user/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update password');
      }
      
      setSuccess('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    // Apply theme to document
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    
    // Save preference to API
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme: newTheme,
          notificationSettings,
          privacySettings,
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to save theme preference');
      }
    } catch (err) {
      console.error('Error saving theme preference:', err);
    }
    
    // Show success message
    setSuccess('Theme updated successfully');
    setTimeout(() => setSuccess(''), 3000);
  };

  const saveNotificationSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme,
          notificationSettings,
          privacySettings,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update notification settings');
      }
      
      setSuccess('Notification settings updated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to update notification settings');
    } finally {
      setLoading(false);
    }
  };

  const savePrivacySettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme,
          notificationSettings,
          privacySettings,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update privacy settings');
      }
      
      setSuccess('Privacy settings updated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to update privacy settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-b from-green-50 to-white text-gray-800'}`}>
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Settings</h1>
          
          <div className={`${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-xl shadow-md overflow-hidden`}>
            {/* Settings Tabs */}
            <div className={`flex border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                className={`px-4 py-3 text-sm font-medium ${activeTab === 'appearance' 
                  ? `text-green-500 border-b-2 border-green-500` 
                  : `${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                }`}
                onClick={() => setActiveTab('appearance')}
              >
                <FiSun className="inline mr-2" />
                Appearance
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium ${activeTab === 'account' 
                  ? `text-green-500 border-b-2 border-green-500` 
                  : `${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                }`}
                onClick={() => setActiveTab('account')}
              >
                <FiUser className="inline mr-2" />
                Account
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium ${activeTab === 'notifications' 
                  ? `text-green-500 border-b-2 border-green-500` 
                  : `${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                }`}
                onClick={() => setActiveTab('notifications')}
              >
                <FiBell className="inline mr-2" />
                Notifications
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium ${activeTab === 'privacy' 
                  ? `text-green-500 border-b-2 border-green-500` 
                  : `${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                }`}
                onClick={() => setActiveTab('privacy')}
              >
                <FiShield className="inline mr-2" />
                Privacy
              </button>
            </div>
            
            {/* Success/Error Messages */}
            {success && (
              <div className="p-4 bg-green-50 border-l-4 border-green-500 flex items-center dark:bg-green-900/30">
                <FiCheckCircle className="text-green-500 mr-2" />
                <span className="text-green-700 dark:text-green-300">{success}</span>
              </div>
            )}
            
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 flex items-center dark:bg-red-900/30">
                <FiAlertCircle className="text-red-500 mr-2" />
                <span className="text-red-700 dark:text-red-300">{error}</span>
              </div>
            )}
            
            <div className="p-6">
              {/* Appearance Settings */}
              {activeTab === 'appearance' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Appearance Settings</h2>
                  <div className="space-y-6">
                    <p className="text-gray-600">
                      Appearance settings will be available in future updates.
                    </p>
                  </div>
                </div>
              )}
              
              {/* Account Settings */}
              {activeTab === 'account' && (
                <div>
                  <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Account Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className={`text-md font-medium mb-2 flex items-center ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                        <FiLock className="mr-2" />
                        Change Password
                      </h3>
                      <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                          <label htmlFor="currentPassword" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Current Password
                          </label>
                          <input
                            type="password"
                            id="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                            className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                              theme === 'dark' 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'border border-gray-300 text-gray-900'
                            }`}
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="newPassword" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            New Password
                          </label>
                          <input
                            type="password"
                            id="newPassword"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                              theme === 'dark' 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'border border-gray-300 text-gray-900'
                            }`}
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="confirmPassword" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            id="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                            className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                              theme === 'dark' 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'border border-gray-300 text-gray-900'
                            }`}
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          className={`flex items-center px-4 py-2 rounded-md text-white ${
                            loading 
                              ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
                              : 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600'
                          }`}
                          disabled={loading}
                        >
                          {loading ? 'Updating...' : (
                            <>
                              <FiSave className="mr-2" />
                              Update Password
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                    
                    <div className={`pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h3 className={`text-md font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Account Info</h3>
                      <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        <p>
                          <span className="font-medium">Email:</span> {session?.user?.email}
                        </p>
                        <p>
                          <span className="font-medium">Name:</span> {session?.user?.name}
                        </p>
                        <p>
                          <span className="font-medium">Account created:</span> {new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Notification Settings</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label htmlFor="emailNotifications" className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Email Notifications</label>
                      <input
                        type="checkbox"
                        id="emailNotifications"
                        checked={notificationSettings.emailNotifications}
                        onChange={() => setNotificationSettings({
                          ...notificationSettings,
                          emailNotifications: !notificationSettings.emailNotifications
                        })}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-green-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="messageNotifications" className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Message Notifications</label>
                      <input
                        type="checkbox"
                        id="messageNotifications"
                        checked={notificationSettings.messageNotifications}
                        onChange={() => setNotificationSettings({
                          ...notificationSettings,
                          messageNotifications: !notificationSettings.messageNotifications
                        })}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-green-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="projectUpdates" className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Project Updates</label>
                      <input
                        type="checkbox"
                        id="projectUpdates"
                        checked={notificationSettings.projectUpdates}
                        onChange={() => setNotificationSettings({
                          ...notificationSettings,
                          projectUpdates: !notificationSettings.projectUpdates
                        })}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-green-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="mentions" className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Mentions</label>
                      <input
                        type="checkbox"
                        id="mentions"
                        checked={notificationSettings.mentions}
                        onChange={() => setNotificationSettings({
                          ...notificationSettings,
                          mentions: !notificationSettings.mentions
                        })}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-green-500"
                      />
                    </div>
                    <div className="pt-4">
                      <button
                        onClick={saveNotificationSettings}
                        className={`flex items-center px-4 py-2 rounded-md text-white ${
                          loading 
                            ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
                            : 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600'
                        }`}
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : (
                          <>
                            <FiSave className="mr-2" />
                            Save Preferences
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Privacy Settings */}
              {activeTab === 'privacy' && (
                <div>
                  <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Privacy Settings</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="profileVisibility" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Profile Visibility
                      </label>
                      <select
                        id="profileVisibility"
                        value={privacySettings.profileVisibility}
                        onChange={(e) => setPrivacySettings({
                          ...privacySettings,
                          profileVisibility: e.target.value
                        })}
                        className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          theme === 'dark' 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'border border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="public">Public - Anyone can view your profile</option>
                        <option value="members">Members Only - Only EcoHub members can view your profile</option>
                        <option value="followers">Followers Only - Only people who follow you can view your profile</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="showEmail" className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Show Email in Profile</label>
                      <input
                        type="checkbox"
                        id="showEmail"
                        checked={privacySettings.showEmail}
                        onChange={() => setPrivacySettings({
                          ...privacySettings,
                          showEmail: !privacySettings.showEmail
                        })}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-green-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="allowMessaging" className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Allow Messaging from All Users</label>
                      <input
                        type="checkbox"
                        id="allowMessaging"
                        checked={privacySettings.allowMessaging}
                        onChange={() => setPrivacySettings({
                          ...privacySettings,
                          allowMessaging: !privacySettings.allowMessaging
                        })}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-green-500"
                      />
                    </div>
                    <div className="pt-4">
                      <button
                        onClick={savePrivacySettings}
                        className={`flex items-center px-4 py-2 rounded-md text-white ${
                          loading 
                            ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
                            : 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600'
                        }`}
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : (
                          <>
                            <FiSave className="mr-2" />
                            Save Privacy Settings
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 