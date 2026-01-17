import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSupabaseStore } from './supabase-store';

export type ColorTheme = 'orange' | 'blue' | 'red' | 'yellow' | 'green';
export type ThemeMode = 'dark' | 'light';

export const COLOR_THEMES = {
  orange: { primary: '#FB8500', name: 'Orange' },
  blue: { primary: '#389EFC', name: 'Blue' },
  red: { primary: '#D00000', name: 'Red' },
  yellow: { primary: '#FFBA08', name: 'Yellow' },
  green: { primary: '#7ED957', name: 'Green' }
} as const;

export const BASE_COLORS = {
  light: '#F4F4F4',
  dark: '#171717'
} as const;

// Helper function to create very dark shade of primary color
export const getDarkShade = (primaryColor: string): string => {
  // Remove # if present
  const hex = primaryColor.replace('#', '');
  
  // Convert hex to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Create very dark shade (reduce to 8-12% of original brightness)
  const darkR = Math.floor(r * 0.08);
  const darkG = Math.floor(g * 0.08);
  const darkB = Math.floor(b * 0.08);
  
  // Convert back to hex
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(darkR)}${toHex(darkG)}${toHex(darkB)}`;
};

interface ThemeContextType {
  theme: ThemeMode;
  colorTheme: ColorTheme;
  toggleTheme: () => void;
  setColorTheme: (color: ColorTheme) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, updateUser } = useSupabaseStore();
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [colorTheme, setColorThemeState] = useState<ColorTheme>('orange');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Load user preferences
  useEffect(() => {
    if (currentUser) {
      setTheme(currentUser.theme || 'dark');
      setColorThemeState(currentUser.colorTheme || 'orange');
      setSoundEnabled(currentUser.soundEnabled !== false);
    } else {
      // Load from localStorage for non-authenticated users
      const savedTheme = localStorage.getItem('idyll_theme') as ThemeMode || 'dark';
      const savedColorTheme = localStorage.getItem('idyll_color_theme') as ColorTheme || 'orange';
      const savedSound = localStorage.getItem('idyll_sound_enabled') !== 'false';
      setTheme(savedTheme);
      setColorThemeState(savedColorTheme);
      setSoundEnabled(savedSound);
    }
  }, [currentUser]);

  // Apply theme to document
  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;
      const currentColorTheme = COLOR_THEMES[colorTheme];
      const darkBase = getDarkShade(currentColorTheme.primary);
      
      // Set theme mode
      root.setAttribute('data-theme', theme);
      root.setAttribute('data-color-theme', colorTheme);
      document.body.className = `${theme}-theme ${colorTheme}-theme`;
      
      // Set CSS custom properties
      root.style.setProperty('--theme-primary', currentColorTheme.primary);
      root.style.setProperty('--theme-base', theme === 'light' ? BASE_COLORS.light : darkBase);
      root.style.setProperty('--theme-mode', theme);
      
      // Apply dark background based on theme color
      if (theme === 'dark') {
        document.body.style.background = `linear-gradient(135deg, ${darkBase} 0%, ${getDarkShade(currentColorTheme.primary)} 100%)`;
      } else {
        document.body.style.background = `linear-gradient(135deg, ${BASE_COLORS.light} 0%, #ffffff 100%)`;
      }
      
      // Global button text visibility fix and theme overrides
      const style = document.createElement('style');
      style.textContent = `
        /* CRITICAL: Global Button Text Visibility Fix */
        button, .btn, input[type="button"], input[type="submit"], [role="button"] {
          color: ${theme === 'dark' ? '#FFFFFF' : '#000000'} !important;
        }
        
        /* Primary buttons with theme background */
        button[style*="background-color: ${currentColorTheme.primary}"],
        .btn[style*="background-color: ${currentColorTheme.primary}"],
        button.bg-primary, .btn.bg-primary {
          color: ${theme === 'dark' ? '#FFFFFF' : '#000000'} !important;
        }
        
        /* Outline/secondary buttons */
        button[style*="border"], .btn[style*="border"] {
          color: ${theme === 'dark' ? '#FFFFFF' : '#000000'} !important;
        }
        
        /* Disabled buttons */
        button:disabled, .btn:disabled, button[disabled], .btn[disabled] {
          color: ${theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'} !important;
        }
        
        /* Specific button classes that might override */
        .text-white, .text-black, .text-primary, .text-secondary {
          color: ${theme === 'dark' ? '#FFFFFF' : '#000000'} !important;
        }
        
        /* Ring color for focus states */
        * {
          --tw-ring-color: ${currentColorTheme.primary} !important;
        }
        
        /* Link colors (not buttons) */
        a:not(.no-theme):not(button):not(.btn) {
          color: ${currentColorTheme.primary} !important;
        }
        
        /* Override default blue colors */
        .text-blue-500, .text-blue-600, .text-cyan-500, .text-cyan-600 {
          color: ${colorTheme === 'blue' ? currentColorTheme.primary : currentColorTheme.primary} !important;
        }
        .bg-blue-500, .bg-blue-600, .bg-cyan-500, .bg-cyan-600 {
          background-color: ${currentColorTheme.primary} !important;
        }
        .border-blue-500, .border-blue-600, .border-cyan-500, .border-cyan-600 {
          border-color: ${currentColorTheme.primary} !important;
        }
        .hover\\:bg-blue-500:hover, .hover\\:bg-blue-600:hover, .hover\\:bg-cyan-500:hover, .hover\\:bg-cyan-600:hover {
          background-color: ${currentColorTheme.primary} !important;
          filter: brightness(1.1);
        }
      `;
      
      // Remove existing theme style if it exists
      const existingStyle = document.getElementById('dynamic-theme-style');
      if (existingStyle) {
        existingStyle.remove();
      }
      
      style.id = 'dynamic-theme-style';
      document.head.appendChild(style);
    };

    applyTheme();
  }, [theme, colorTheme]);

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    if (currentUser) {
      await updateUser(currentUser.id, { theme: newTheme });
    } else {
      localStorage.setItem('idyll_theme', newTheme);
    }
  };

  const setColorTheme = async (color: ColorTheme) => {
    setColorThemeState(color);
    
    if (currentUser) {
      await updateUser(currentUser.id, { colorTheme: color });
    } else {
      localStorage.setItem('idyll_color_theme', color);
    }
  };

  const toggleSound = async () => {
    const newSoundEnabled = !soundEnabled;
    setSoundEnabled(newSoundEnabled);
    
    if (currentUser) {
      await updateUser(currentUser.id, { soundEnabled: newSoundEnabled });
    } else {
      localStorage.setItem('idyll_sound_enabled', newSoundEnabled.toString());
    }
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      colorTheme,
      toggleTheme,
      setColorTheme,
      soundEnabled,
      toggleSound
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};