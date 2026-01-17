
import React, { useState } from 'react';
import { useSupabaseStore } from '../lib/supabase-store';
import { useTheme, COLOR_THEMES, BASE_COLORS, getDarkShade } from '../lib/theme-context';
import Logo from '../components/Logo';
import ThemeSelector from '../components/ThemeSelector';
import Aurora from '../components/Aurora';

const LandingView: React.FC = () => {
  const { setView } = useSupabaseStore();
  const { colorTheme, theme } = useTheme();
  const currentTheme = COLOR_THEMES[colorTheme];
  const [showAbout, setShowAbout] = useState(false);
  
  // Generate theme-based color stops for Aurora
  const getAuroraColors = () => {
    const primaryColor = currentTheme.primary;
    const darkBase = getDarkShade(primaryColor);
    
    if (theme === 'dark') {
      // Dark theme: primary color with very dark base variations
      return [
        primaryColor,
        darkBase,
        primaryColor
      ];
    } else {
      // Light theme: much more subtle, elegant colors
      return [
        '#ffffff',           // Pure white
        '#f8fafc',          // Very light gray-blue  
        '#ffffff'           // Pure white
      ];
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Aurora Background - Only for Dark Theme */}
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
            ? '#000000' // Pure black background for dark theme
            : `linear-gradient(135deg, ${BASE_COLORS.light} 0%, ${currentTheme.primary}08 50%, ${BASE_COLORS.light} 100%)`
        }}
      ></div>
      
      {/* Background overlay for better text readability */}
      <div 
        className="absolute inset-0 z-2"
        style={{
          background: theme === 'dark' 
            ? 'rgba(23, 23, 23, 0.2)' 
            : 'rgba(255, 255, 255, 0.1)'
        }}
      ></div>

      {/* Top-right text links */}
      <div className="absolute top-6 right-6 flex items-center gap-6 z-20">
        <a 
          href="https://idyllproductions.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm font-medium transition-colors no-theme"
          style={{ 
            color: theme === 'dark' ? '#ffffff' : '#000000'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = currentTheme.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#000000';
          }}
        >
          Portfolio
        </a>
        <a 
          href="https://idyllproductions.com/about" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm font-medium transition-colors no-theme"
          style={{ 
            color: theme === 'dark' ? '#ffffff' : '#000000'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = currentTheme.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#000000';
          }}
          onClick={(e) => {
            e.preventDefault();
            setShowAbout(true);
          }}
        >
          About Us
        </a>
        <ThemeSelector />
      </div>

      <div className="max-w-4xl w-full text-center space-y-8 relative z-10">
        {/* Logo */}
        <Logo size="xl" className="mx-auto mb-6" />
        
        <div 
          className="inline-flex items-center space-x-2 border px-4 py-1.5 rounded-full mb-4"
          style={{ 
            backgroundColor: `${currentTheme.primary}30`,
            borderColor: `${currentTheme.primary}20`
          }}
        >
          <span 
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: currentTheme.primary }}
          ></span>
          <span 
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: currentTheme.primary }}
          >
            Welcome to the
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
          <span style={{ color: theme === 'light' ? '#1e293b' : '#e2e8f0' }}>
            Idyll Productions <br />
          </span>
          <span style={{ color: currentTheme.primary }}>
            Workspace
          </span>
        </h1>

        <p 
          className="text-lg max-w-2xl mx-auto leading-relaxed"
          style={{ color: theme === 'light' ? '#475569' : '#94a3b8' }}
        >
          An internal production workspace built for high-performance editors. 
          Manage tasks, meetings, and payouts in one unified, distraction-free environment.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
          <button 
            onClick={() => {
              console.log('LOGIN BUTTON CLICKED');
              setView('login');
            }}
            className="w-full sm:w-auto px-8 py-4 font-semibold rounded-xl transition-all duration-300 transform hover:-translate-y-1"
            style={{ 
              backgroundColor: currentTheme.primary,
              boxShadow: `0 0 20px ${currentTheme.primary}30`,
              color: theme === 'dark' ? '#ffffff !important' : '#000000 !important'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = currentTheme.primary;
              e.currentTarget.style.filter = 'brightness(1.1)';
              e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#000000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = currentTheme.primary;
              e.currentTarget.style.filter = 'brightness(1)';
              e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#000000';
            }}
          >
            <span style={{ color: `${theme === 'dark' ? '#ffffff' : '#000000'} !important` }}>
              Login to Workspace
            </span>
          </button>
          <button 
            onClick={() => {
              console.log('CREATE ACCOUNT BUTTON CLICKED');
              setView('signup');
            }}
            className="w-full sm:w-auto px-8 py-4 font-semibold rounded-xl transition-all duration-300"
            style={{ 
              color: theme === 'dark' ? '#ffffff' : '#000000',
              backgroundColor: theme === 'light' ? '#f1f5f9' : '#0a0a0a',
              borderColor: currentTheme.primary,
              border: `2px solid ${currentTheme.primary}`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = currentTheme.primary + '20';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme === 'light' ? '#f1f5f9' : '#0a0a0a';
            }}
          >
            <span style={{ color: `${theme === 'dark' ? '#ffffff' : '#000000'} !important` }}>
              Create New Account
            </span>
          </button>
          <button 
            onClick={() => {
              console.log('APPLY TO BE EDITOR BUTTON CLICKED');
              setView('apply');
            }}
            className="w-full sm:w-auto px-8 py-4 font-semibold rounded-xl transition-all duration-300 transform hover:-translate-y-1"
            style={{ 
              background: `linear-gradient(to right, ${currentTheme.primary}, ${currentTheme.primary}dd)`,
              color: theme === 'dark' ? '#ffffff !important' : '#000000 !important'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `linear-gradient(to right, ${currentTheme.primary}, ${currentTheme.primary}dd)`;
              e.currentTarget.style.filter = 'brightness(1.1)';
              e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#000000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `linear-gradient(to right, ${currentTheme.primary}, ${currentTheme.primary}dd)`;
              e.currentTarget.style.filter = 'brightness(1)';
              e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#000000';
            }}
          >
            <span style={{ color: `${theme === 'dark' ? '#ffffff' : '#000000'} !important` }}>
              Apply to be an Editor
            </span>
          </button>
        </div>
      </div>

      {/* Manager Login Button - Bottom Right */}
      <div className="fixed bottom-6 right-6 z-20">
        <button 
          onClick={() => {
            console.log('MANAGER LOGIN BUTTON CLICKED');
            setView('manager-login');
          }}
          className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          style={{ 
            backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            color: theme === 'dark' ? '#ffffff' : '#000000',
            border: `1px solid ${currentTheme.primary}40`,
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = currentTheme.primary + '20';
            e.currentTarget.style.borderColor = currentTheme.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)';
            e.currentTarget.style.borderColor = currentTheme.primary + '40';
          }}
        >
          <span className="flex items-center gap-2">
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
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="m22 2-5 10-5-5 10-5z"/>
            </svg>
            Login as Manager
          </span>
        </button>
      </div>

      {/* About Modal */}
      {showAbout && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500 ease-out"
          style={{
            animation: showAbout ? 'fadeIn 0.4s ease-out' : 'fadeOut 0.3s ease-in'
          }}
          onClick={() => setShowAbout(false)}
        >
          {/* Backdrop with blur */}
          <div 
            className="absolute inset-0 transition-all duration-700 ease-out"
            style={{
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              animation: showAbout ? 'blurFadeIn 0.6s ease-out' : 'blurFadeOut 0.4s ease-in'
            }}
          ></div>
          
          {/* Modal Content - Glassmorphism */}
          <div 
            className="relative max-w-2xl w-full rounded-3xl p-8 shadow-2xl transition-all duration-500 ease-out transform"
            style={{
              backgroundColor: theme === 'dark' 
                ? `${getDarkShade(currentTheme.primary)}26` // Very dark with low opacity
                : 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              animation: showAbout ? 'slideInScale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'slideOutScale 0.3s ease-in'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 
              className="text-3xl font-bold mb-6 transition-colors duration-300"
              style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
            >
              About Idyll Productions Workspace
            </h2>
            
            <div className="space-y-4 text-sm leading-relaxed">
              <p 
                className="transition-colors duration-300"
                style={{ color: theme === 'dark' ? '#e2e8f0' : '#1e293b' }}
              >
                Idyll Productions Workspace is built for editors. It's the internal system where all work is managed tasks, revisions, deadlines, meetings, approvals, and payouts. One place, no noise, no guesswork.
              </p>
              
              <p 
                className="transition-colors duration-300"
                style={{ color: theme === 'dark' ? '#e2e8f0' : '#1e293b' }}
              >
                This workspace supports Idyll Productions, a creator-focused editing and post-production company founded by Harsh Pawar.
              </p>
              
              <p 
                className="transition-colors duration-300"
                style={{ color: theme === 'dark' ? '#e2e8f0' : '#1e293b' }}
              >
                At Idyll Productions, we handle paid ads editing for creators, SaaS product videos, and gaming content. Alongside commercial work, we also produce short films and narrative projects. Different formats, same standard clean storytelling and sharp execution.
              </p>
              
              <p 
                className="transition-colors duration-300"
                style={{ color: theme === 'dark' ? '#e2e8f0' : '#1e293b' }}
              >
                The workspace exists to keep everything aligned: editors know exactly what to do, management knows exactly what's happening, and payouts stay transparent.
              </p>
              
              <p 
                className="font-semibold transition-colors duration-300"
                style={{ color: currentTheme.primary }}
              >
                Less chaos. Better output. That's the point.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingView;
