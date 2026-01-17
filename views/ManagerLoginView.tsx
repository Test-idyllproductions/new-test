import React, { useState } from 'react';
import { useSupabaseStore } from '../lib/supabase-store';
import { useTheme, COLOR_THEMES, BASE_COLORS } from '../lib/theme-context';
import { useDialog } from '../lib/dialog-context';
import { UserRole } from '../types';
import { Eye, EyeOff, ArrowLeft, Shield } from 'lucide-react';
import Logo from '../components/Logo';
import Aurora from '../components/Aurora';

const ManagerLoginView: React.FC = () => {
  const { signIn, setView, loading } = useSupabaseStore();
  const { theme, colorTheme } = useTheme();
  const currentTheme = COLOR_THEMES[colorTheme];
  const { showDialog } = useDialog();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    console.log('🔵 MANAGER LOGIN START:', { email: formData.email });

    try {
      console.log('🔵 Calling signIn for manager...');
      const { error, user } = await signIn(formData.email, formData.password);
      console.log('🔵 signIn response:', { error: error?.message || 'none', userRole: user?.role });
      
      if (error) {
        console.log('🔴 MANAGER LOGIN ERROR:', error.message);
        
        if (error.message?.includes('Invalid login credentials') || 
            error.message?.includes('Invalid email or password') ||
            error.message?.includes('Email not confirmed')) {
          showDialog({
            type: 'error',
            title: 'Manager Login Failed',
            message: 'Invalid manager credentials. Please check your email and password.',
            actions: [
              { label: 'Try Again', onClick: () => {}, variant: 'primary' },
              { label: 'Back to Home', onClick: () => setView('landing'), variant: 'secondary' }
            ]
          });
        } else {
          setError(error.message);
        }
      } else if (user && user.role !== UserRole.MANAGER) {
        // User logged in successfully but is not a manager
        console.log('🔴 NON-MANAGER TRYING TO ACCESS MANAGER LOGIN:', user.role);
        showDialog({
          type: 'error',
          title: 'Access Denied',
          message: 'This login is for managers only. Please use the regular login if you are an editor.',
          actions: [
            { label: 'Go to Editor Login', onClick: () => setView('login'), variant: 'primary' },
            { label: 'Back to Home', onClick: () => setView('landing'), variant: 'secondary' }
          ]
        });
        // Sign out the non-manager user
        // await signOut(); // You might need to implement this
      } else {
        console.log('✅ Manager login successful, waiting for redirect...');
        // Success! The store will handle redirect via useEffect
      }
      console.log('🔵 MANAGER LOGIN END');
    } catch (err: any) {
      console.log('🔴 CATCH ERROR:', err.message || err);
      setError(err.message || 'An error occurred');
    } finally {
      console.log('🔵 Setting isSubmitting to false');
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
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
          
          {/* Manager Badge */}
          <div 
            className="inline-flex items-center space-x-2 border px-4 py-2 rounded-full mb-4"
            style={{ 
              backgroundColor: `${currentTheme.primary}20`,
              borderColor: `${currentTheme.primary}40`
            }}
          >
            <Shield 
              className="w-4 h-4"
              style={{ color: currentTheme.primary }}
            />
            <span 
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: currentTheme.primary }}
            >
              Manager Access
            </span>
          </div>

          <h1 
            className="text-3xl font-bold mb-2"
            style={{ color: theme === 'dark' ? '#e2e8f0' : '#1e293b' }}
          >
            Manager Login
          </h1>
          <p style={{ color: theme === 'dark' ? '#94a3b8' : '#475569' }}>
            Sign in with your manager credentials
          </p>
        </div>

        {/* Manager Login Form */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium mb-2"
                style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
              >
                Manager Email
              </label>
              <input
                type="email"
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
                placeholder="Enter your manager email"
              />
            </div>

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
                    Signing In...
                  </span>
                </div>
              ) : (
                <span style={{ color: `${theme === 'dark' ? '#ffffff' : '#000000'} !important` }}>
                  Sign In as Manager
                </span>
              )}
            </button>

            {/* Link to Editor Login */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setView('login')}
                className="text-sm font-medium transition-colors"
                style={{ color: currentTheme.primary }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'brightness(1.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'brightness(1)';
                }}
              >
                Are you an editor? Login here instead
              </button>
            </div>
          </form>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p 
            className="text-xs"
            style={{ color: theme === 'dark' ? '#94a3b8' : '#475569' }}
          >
            This login is restricted to managers only. Unauthorized access attempts are logged.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ManagerLoginView;