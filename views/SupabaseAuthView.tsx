import React, { useState } from 'react';
import { useSupabaseStore } from '../lib/supabase-store';
import { useTheme, COLOR_THEMES, BASE_COLORS } from '../lib/theme-context';
import { useDialog } from '../lib/dialog-context';
import { UserRole } from '../types';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';
import Aurora from '../components/Aurora';

const SupabaseAuthView: React.FC = () => {
  const { signUp, signIn, signInAsGuest, currentView, setView, loading } = useSupabaseStore();
  const { theme, colorTheme } = useTheme();
  const currentTheme = COLOR_THEMES[colorTheme];
  const { showDialog } = useDialog();
  const [isLogin, setIsLogin] = useState(currentView === 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate theme-based color stops for Aurora
  const getAuroraColors = () => {
    if (theme === 'dark') {
      return [
        currentTheme.primary,
        BASE_COLORS.dark,
        currentTheme.primary
      ];
    } else {
      return [
        '#ffffff',
        '#f8fafc',
        '#ffffff'
      ];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    console.log('🔵 LOGIN START:', { email: formData.email, isLogin });

    try {
      if (isLogin) {
        console.log('🔵 Calling signIn...');
        const { error } = await signIn(formData.email, formData.password);
        console.log('🔵 signIn response:', { error: error?.message || 'none' });
        
        if (error) {
          console.log('🔴 LOGIN ERROR:', error.message);
          
          // Better error messages
          if (error.message?.includes('Invalid login credentials') || 
              error.message?.includes('Invalid email or password') ||
              error.message?.includes('Email not confirmed')) {
            showDialog({
              type: 'error',
              title: 'Login Failed',
              message: 'Account not found or incorrect password. Please create an account first if you are a new user.',
              actions: [
                { label: 'Create Account', onClick: () => setView('signup'), variant: 'primary' },
                { label: 'Try Again', onClick: () => {}, variant: 'secondary' }
              ]
            });
          } else {
            setError(error.message);
          }
        } else {
          console.log('✅ Login successful, waiting for redirect...');
          // Success! The store will handle redirect via useEffect
        }
        console.log('🔵 LOGIN END');
      } else {
        // All signups default to Editor role
        const { error } = await signUp(formData.email, formData.password, formData.username, UserRole.EDITOR);
        if (error) {
          // Check if user already exists
          if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
            showDialog({
              type: 'warning',
              title: 'Account Already Exists',
              message: 'You already have an account. Please go to Login.',
              actions: [
                { label: 'Go to Login', onClick: () => setView('login'), variant: 'primary' }
              ]
            });
          } else {
            setError(error.message);
          }
        } else {
          setError('');
          showDialog({
            type: 'success',
            title: 'Account Created Successfully',
            message: 'Your account is pending approval from management. Please login and wait for approval.',
            actions: [
              { label: 'Go to Login', onClick: () => setView('login'), variant: 'primary' }
            ]
          });
        }
      }
    } catch (err: any) {
      console.log('🔴 CATCH ERROR:', err.message || err);
      setError(err.message || 'An error occurred');
    } finally {
      console.log('🔵 Setting isSubmitting to false');
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setView(isLogin ? 'signup' : 'login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: currentTheme.primary }}
          ></div>
          <p style={{ color: theme === 'dark' ? '#94a3b8' : '#475569' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Theme-based Background */}
      {theme === 'dark' && typeof window !== 'undefined' && (
        <Aurora 
          colorStops={getAuroraColors()}
          amplitude={1.2}
          blend={0.6}
          speed={0.5}
        />
      )}
      
      {/* Simple gradient background for Light Theme */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: theme === 'dark' 
            ? '#000000'
            : `linear-gradient(135deg, ${BASE_COLORS.light} 0%, ${currentTheme.primary}08 50%, ${BASE_COLORS.light} 100%)`
        }}
      ></div>
      
      {/* Background overlay */}
      <div 
        className="absolute inset-0 z-2"
        style={{
          background: theme === 'dark' 
            ? 'rgba(0, 0, 0, 0.2)' 
            : 'rgba(255, 255, 255, 0.1)'
        }}
      ></div>
      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <button
          onClick={() => setView('landing')}
          className="mb-6 inline-flex items-center space-x-2 transition-colors"
          style={{ 
            color: theme === 'dark' ? '#94a3b8' : '#475569'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = currentTheme.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = theme === 'dark' ? '#94a3b8' : '#475569';
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Welcome</span>
        </button>

        {/* Logo */}
        <div className="text-center mb-8">
          <Logo size="xl" className="mx-auto mb-6" />
          <h1 
            className="text-3xl font-bold mb-2"
            style={{ color: theme === 'dark' ? '#e2e8f0' : '#1e293b' }}
          >
            {isLogin ? 'Welcome Back' : 'Create New Account'}
          </h1>
          <p style={{ color: theme === 'dark' ? '#94a3b8' : '#475569' }}>
            {isLogin ? 'Sign in to your account' : 'Create your account to get started'}
          </p>
        </div>

        {/* Auth Form - No Card, Direct on Background */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email or Username */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium mb-2"
                style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
              >
                Email or Username
              </label>
              <input
                type="text"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:border-transparent"
                style={{
                  backgroundColor: theme === 'dark' ? `${currentTheme.primary}10` : `${currentTheme.primary}05`,
                  border: `2px solid ${currentTheme.primary}30`,
                  color: theme === 'dark' ? '#ffffff' : '#000000'
                } as React.CSSProperties}
                placeholder="Enter your email or username"
              />
            </div>

            {/* Username (signup only) */}
            {!isLogin && (
              <div>
                <label 
                  htmlFor="username" 
                  className="block text-sm font-medium mb-2"
                  style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{
                    backgroundColor: theme === 'dark' ? `${currentTheme.primary}10` : `${currentTheme.primary}05`,
                    border: `2px solid ${currentTheme.primary}30`,
                    color: theme === 'dark' ? '#ffffff' : '#000000'
                  } as React.CSSProperties}
                  placeholder="Choose a username"
                />
              </div>
            )}

            {/* Password */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium mb-2"
                style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 pr-12 rounded-lg transition-all focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{
                    backgroundColor: theme === 'dark' ? `${currentTheme.primary}10` : `${currentTheme.primary}05`,
                    border: `2px solid ${currentTheme.primary}30`,
                    color: theme === 'dark' ? '#ffffff' : '#000000'
                  } as React.CSSProperties}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 transition-colors"
                  style={{ 
                    color: theme === 'dark' ? '#ffffff' : '#000000'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = currentTheme.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#000000';
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div 
                className="rounded-lg p-3"
                style={{
                  backgroundColor: '#dc262620',
                  border: '2px solid #dc262640'
                }}
              >
                <p style={{ color: '#fca5a5' }}>{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: currentTheme.primary,
                color: `${theme === 'dark' ? '#ffffff' : '#000000'} !important`
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.filter = 'brightness(1.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = 'brightness(1)';
              }}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div 
                    className="animate-spin rounded-full h-5 w-5 border-b-2 mr-2"
                    style={{ borderColor: theme === 'dark' ? '#ffffff' : '#000000' }}
                  ></div>
                  <span style={{ color: `${theme === 'dark' ? '#ffffff' : '#000000'} !important` }}>
                    {isLogin ? 'Signing In...' : 'Creating Account...'}
                  </span>
                </div>
              ) : (
                <span style={{ color: `${theme === 'dark' ? '#ffffff' : '#000000'} !important` }}>
                  {isLogin ? 'Sign In' : 'Create Account'}
                </span>
              )}
            </button>

            {/* Toggle Mode */}
            <div className="text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-sm font-medium transition-colors"
                style={{ color: currentTheme.primary }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'brightness(1.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'brightness(1)';
                }}
              >
                {isLogin ? "Don't have an account? Create one" : 'Already have an account? Login'}
              </button>
            </div>

            {/* Guest Login Option */}
            {isLogin && (
              <div className="text-center mt-4">
                <div className="flex items-center my-4">
                  <div 
                    className="flex-1 h-px"
                    style={{ backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}
                  ></div>
                  <span 
                    className="px-4 text-xs font-medium"
                    style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                  >
                    OR
                  </span>
                  <div 
                    className="flex-1 h-px"
                    style={{ backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}
                  ></div>
                </div>
                
                <button
                  type="button"
                  onClick={async () => {
                    console.log('🎭 GUEST LOGIN CLICKED');
                    await signInAsGuest(UserRole.EDITOR);
                  }}
                  className="w-full font-medium py-3 px-6 rounded-lg transition-all duration-200 border-2"
                  style={{
                    backgroundColor: 'transparent',
                    borderColor: currentTheme.primary + '40',
                    color: currentTheme.primary
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = currentTheme.primary + '10';
                    e.currentTarget.style.borderColor = currentTheme.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = currentTheme.primary + '40';
                  }}
                >
                  <span className="flex items-center justify-center space-x-2">
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span>Continue as Guest</span>
                  </span>
                </button>
                
                <p 
                  className="text-xs mt-2"
                  style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                >
                  Explore the workspace without logging in
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Additional Info */}
        {!isLogin && (
          <div className="mt-6 text-center">
            <p 
              className="text-sm"
              style={{ color: theme === 'dark' ? '#94a3b8' : '#475569' }}
            >
              All new accounts are created as Editors and require management approval before accessing the workspace.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupabaseAuthView;