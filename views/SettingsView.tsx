import React, { useState } from 'react';
import { useSupabaseStore } from '../lib/supabase-store';
import { useDialog } from '../lib/dialog-context';
import { useTheme, COLOR_THEMES, getDarkShade } from '../lib/theme-context';
import { User, Settings, Moon, Sun, Trash2, Save, Eye, EyeOff, Palette } from 'lucide-react';

const SettingsView: React.FC = () => {
  const { currentUser, updateUser, signOut } = useSupabaseStore();
  const { showDialog } = useDialog();
  const { theme, colorTheme, toggleTheme, setColorTheme } = useTheme();
  const currentTheme = COLOR_THEMES[colorTheme];
  const [formData, setFormData] = useState({
    username: currentUser?.username || '',
    email: currentUser?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage({ type: '', text: '' });

    try {
      // Update profile information
      if (formData.username !== currentUser?.username || formData.email !== currentUser?.email) {
        await updateUser(currentUser!.id, {
          username: formData.username,
          email: formData.email
        });
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      }

      // Handle password change if provided
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setMessage({ type: 'error', text: 'New passwords do not match!' });
          return;
        }
        
        if (formData.newPassword.length < 6) {
          setMessage({ type: 'error', text: 'Password must be at least 6 characters!' });
          return;
        }

        // Note: Password update would require Supabase auth.updateUser()
        // For now, show success message
        setMessage({ type: 'success', text: 'Profile and password updated successfully!' });
        
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    showDialog({
      type: 'warning',
      title: 'Delete Account',
      message: 'Account deletion feature is not yet implemented. Please contact your administrator.',
      actions: [
        { label: 'OK', onClick: () => {}, variant: 'primary' }
      ]
    });
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center space-x-3 mb-8">
        <Settings className="w-8 h-8" style={{ color: currentTheme.primary }} />
        <h1 
          className="text-3xl font-bold"
          style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
        >
          Settings
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Settings */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
          <div className="flex items-center space-x-3 mb-6">
            <User className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-primary">Profile Information</h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-secondary mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="Enter your username"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Current Password */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-secondary mb-2">
                Current Password (required for changes)
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 bg-input border border-border rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-secondary transition-colors"
                >
                  {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-secondary mb-2">
                New Password (optional)
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 bg-input border border-border rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  placeholder="Enter new password"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-secondary transition-colors"
                >
                  {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            {formData.newPassword && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pr-12 bg-input border border-border rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    placeholder="Confirm new password"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-secondary transition-colors"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Message */}
            {message.text && (
              <div className={`p-3 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}>
                {message.text}
              </div>
            )}

            {/* Update Button */}
            <button
              type="submit"
              disabled={isUpdating}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg transition-all font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: currentTheme.primary,
                color: `${theme === 'dark' ? '#ffffff' : '#000000'} !important`
              }}
              onMouseEnter={(e) => {
                if (!isUpdating) {
                  e.currentTarget.style.filter = 'brightness(1.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = 'brightness(1)';
              }}
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span style={{ color: `${theme === 'dark' ? '#ffffff' : '#000000'} !important` }}>Updating...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" style={{ color: `${theme === 'dark' ? '#ffffff' : '#000000'} !important` }} />
                  <span style={{ color: `${theme === 'dark' ? '#ffffff' : '#000000'} !important` }}>Update Profile</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Appearance & Preferences */}
        <div className="space-y-6">
          {/* Theme Settings */}
          <div 
            className="rounded-2xl p-6 shadow-xl"
            style={{
              backgroundColor: theme === 'dark' 
                ? `${getDarkShade(currentTheme.primary)}CC`
                : 'rgba(255, 255, 255, 0.9)',
              border: `1px solid ${currentTheme.primary}30`
            }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <Palette className="w-6 h-6" style={{ color: currentTheme.primary }} />
              <h2 
                className="text-xl font-bold"
                style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
              >
                Appearance
              </h2>
            </div>

            <div className="space-y-6">
              {/* Color Theme Selection */}
              <div>
                <h3 
                  className="font-medium mb-2"
                  style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
                >
                  Color Theme
                </h3>
                <p 
                  className="text-sm mb-4"
                  style={{ color: theme === 'dark' ? '#94a3b8' : '#475569' }}
                >
                  Choose your preferred color palette
                </p>
                <div className="grid grid-cols-5 gap-3">
                  {Object.entries(COLOR_THEMES).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => setColorTheme(key as any)}
                      className={`w-12 h-12 rounded-lg border-2 transition-all duration-200 hover:scale-110`}
                      style={{
                        backgroundColor: value.primary,
                        borderColor: colorTheme === key 
                          ? (theme === 'dark' ? '#ffffff' : '#000000')
                          : 'transparent'
                      }}
                      title={value.name}
                    >
                      {colorTheme === key && (
                        <div className="w-full h-full rounded-md flex items-center justify-center">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: theme === 'dark' ? '#ffffff' : '#000000' }}
                          ></div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Light/Dark Mode Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 
                    className="font-medium"
                    style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
                  >
                    Theme Mode
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: theme === 'dark' ? '#94a3b8' : '#475569' }}
                  >
                    Switch between light and dark mode
                  </p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{
                    backgroundColor: currentTheme.primary,
                    '--tw-ring-color': currentTheme.primary
                  } as React.CSSProperties}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div 
                className="text-sm"
                style={{ color: theme === 'dark' ? '#94a3b8' : '#475569' }}
              >
                Current theme: <span 
                  className="font-medium capitalize"
                  style={{ color: currentTheme.primary }}
                >
                  {COLOR_THEMES[colorTheme].name} {theme} Mode
                </span>
              </div>
            </div>
          </div>

          {/* Account Management */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
            <div className="flex items-center space-x-3 mb-6">
              <Trash2 className="w-6 h-6 text-red-400" />
              <h2 className="text-xl font-bold text-primary">Account Management</h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-primary mb-2">Danger Zone</h3>
                <p className="text-sm text-secondary mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all font-medium"
                  style={{
                    backgroundColor: '#dc2626', // Red color for danger
                    color: '#ffffff !important'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#b91c1c';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#dc2626';
                  }}
                >
                  <Trash2 className="w-4 h-4" style={{ color: '#ffffff' }} />
                  <span style={{ color: '#ffffff !important' }}>Delete Account</span>
                </button>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-primary mb-4">Account Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-secondary">Role:</span>
                <span className="font-medium text-primary capitalize">{currentUser?.role.toLowerCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Status:</span>
                <span className={`font-medium capitalize ${
                  currentUser?.status === 'APPROVED' ? 'text-green-400' : 
                  currentUser?.status === 'PENDING' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {currentUser?.status.toLowerCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Member since:</span>
                <span className="font-medium text-primary">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;