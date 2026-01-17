import React, { useState } from 'react';
import { useSupabaseStore } from '../lib/supabase-store';
import { useTheme, COLOR_THEMES, BASE_COLORS } from '../lib/theme-context';
import { useDialog } from '../lib/dialog-context';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Send, UserPlus } from 'lucide-react';
import Logo from '../components/Logo';
import Aurora from '../components/Aurora';

const ApplyView: React.FC = () => {
  const { setView } = useSupabaseStore();
  const { theme, colorTheme } = useTheme();
  const currentTheme = COLOR_THEMES[colorTheme];
  const { showDialog } = useDialog();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
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
    
    if (!formData.name || !formData.email) {
      showDialog({
        type: 'error',
        title: 'Missing Information',
        message: 'Please fill in your name and email.',
        actions: [{ label: 'OK', onClick: () => {}, variant: 'primary' }]
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('user_submissions')
        .insert({
          name: formData.name,
          email: formData.email,
          message: formData.message || '',
          status: 'PENDING'
        });

      if (error) throw error;

      showDialog({
        type: 'success',
        title: 'Application Submitted',
        message: 'Your application has been submitted successfully. Our management team will review it and contact you soon.',
        actions: [
          { 
            label: 'Back to Welcome', 
            onClick: () => setView('landing'), 
            variant: 'primary' 
          }
        ]
      });

      // Clear form
      setFormData({ name: '', email: '', message: '' });
    } catch (error: any) {
      console.error('Error submitting application:', error);
      showDialog({
        type: 'error',
        title: 'Submission Failed',
        message: error.message || 'Failed to submit application. Please try again.',
        actions: [{ label: 'OK', onClick: () => {}, variant: 'primary' }]
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
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
        <Logo size="lg" className="mx-auto mb-8" />

        {/* Form - No Card, Direct on Background */}
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: currentTheme.primary }}
            >
              <UserPlus 
                className="w-8 h-8" 
                style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
              />
            </div>
            <h2 
              className="text-3xl font-bold mb-2"
              style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
            >
              Apply to be an Editor
            </h2>
            <p 
              className="text-sm"
              style={{ color: theme === 'dark' ? '#94a3b8' : '#475569' }}
            >
              Submit your application and our team will review it
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
              >
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
                className="w-full px-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:border-transparent"
                style={{
                  backgroundColor: theme === 'dark' ? `${currentTheme.primary}10` : `${currentTheme.primary}05`,
                  border: `2px solid ${currentTheme.primary}30`,
                  color: theme === 'dark' ? '#ffffff' : '#000000'
                }}
              />
            </div>

            {/* Email */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
              >
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
                required
                className="w-full px-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:border-transparent"
                style={{
                  backgroundColor: theme === 'dark' ? `${currentTheme.primary}10` : `${currentTheme.primary}05`,
                  border: `2px solid ${currentTheme.primary}30`,
                  color: theme === 'dark' ? '#ffffff' : '#000000'
                }}
              />
            </div>

            {/* Message */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
              >
                Why do you want to join? (Optional)
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Tell us about your experience and why you'd like to join Idyll Productions..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:border-transparent resize-none"
                style={{
                  backgroundColor: theme === 'dark' ? `${currentTheme.primary}10` : `${currentTheme.primary}05`,
                  border: `2px solid ${currentTheme.primary}30`,
                  color: theme === 'dark' ? '#ffffff' : '#000000'
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
                <>
                  <div 
                    className="animate-spin rounded-full h-5 w-5 border-b-2"
                    style={{ borderColor: theme === 'dark' ? '#ffffff' : '#000000' }}
                  ></div>
                  <span style={{ color: `${theme === 'dark' ? '#ffffff' : '#000000'} !important` }}>
                    Submitting...
                  </span>
                </>
              ) : (
                <>
                  <Send 
                    className="w-5 h-5" 
                    style={{ color: `${theme === 'dark' ? '#ffffff' : '#000000'} !important` }}
                  />
                  <span style={{ color: `${theme === 'dark' ? '#ffffff' : '#000000'} !important` }}>
                    Submit Application
                  </span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p 
              className="text-xs"
              style={{ color: theme === 'dark' ? '#94a3b8' : '#475569' }}
            >
              Already have an account?{' '}
              <button
                onClick={() => setView('login')}
                className="font-semibold transition-colors"
                style={{ color: currentTheme.primary }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'brightness(1.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'brightness(1)';
                }}
              >
                Login here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyView;
