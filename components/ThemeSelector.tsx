import React, { useState, useRef, useEffect } from 'react';
import { useTheme, COLOR_THEMES, ColorTheme, ThemeMode, getDarkShade } from '../lib/theme-context';
import { Palette, Sun, Moon } from 'lucide-react';

const ThemeSelector: React.FC = () => {
  const { theme, colorTheme, toggleTheme, setColorTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentTheme = COLOR_THEMES[colorTheme];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleColorSelect = (color: ColorTheme) => {
    setColorTheme(color);
  };

  const handleModeToggle = () => {
    toggleTheme();
  };

  return (
    <div className="relative theme-selector-dropdown" ref={dropdownRef}>
      {/* Theme Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all duration-300 rounded-lg hover:scale-105 no-theme"
        style={{ 
          color: isOpen ? currentTheme.primary : (theme === 'dark' ? '#ffffff' : '#000000'),
          backgroundColor: isOpen 
            ? `${currentTheme.primary}20` 
            : (theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'),
          border: `1px solid ${isOpen ? currentTheme.primary : 'transparent'}`,
          boxShadow: isOpen ? `0 0 20px ${currentTheme.primary}30` : 'none'
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.color = currentTheme.primary;
            e.currentTarget.style.backgroundColor = `${currentTheme.primary}10`;
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#000000';
            e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
          }
        }}
      >
        <Palette size={16} />
        Theme
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <div 
          className="absolute top-full right-0 mt-2 w-72 rounded-2xl shadow-2xl p-6 transition-all duration-500 ease-out"
          style={{
            backgroundColor: theme === 'dark' 
              ? `${getDarkShade(currentTheme.primary)}F0` // Much lighter opacity for better visibility
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `2px solid ${currentTheme.primary}60`, // More visible border
            boxShadow: `0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px ${currentTheme.primary}40`,
            zIndex: 9999, // Very high z-index to appear above everything
            animation: isOpen ? 'slideInScale 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'slideOutScale 0.3s ease-in'
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Palette size={20} style={{ color: currentTheme.primary }} />
            <h3 
              className="text-lg font-bold transition-colors duration-300"
              style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
            >
              Theme Settings
            </h3>
          </div>

          {/* Color Selection */}
          <div className="mb-6">
            <h4 
              className="text-sm font-semibold mb-4 transition-colors duration-300"
              style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
            >
              Color Palette
            </h4>
            <div className="grid grid-cols-5 gap-3">
              {Object.entries(COLOR_THEMES).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => handleColorSelect(key as ColorTheme)}
                  className={`w-12 h-12 rounded-xl border-3 transition-all duration-200 hover:scale-110 hover:shadow-lg relative overflow-hidden`}
                  style={{
                    backgroundColor: value.primary,
                    borderColor: colorTheme === key 
                      ? '#ffffff'
                      : 'rgba(255, 255, 255, 0.2)',
                    boxShadow: colorTheme === key 
                      ? `0 0 20px ${value.primary}60, 0 4px 12px rgba(0, 0, 0, 0.3)`
                      : `0 2px 8px rgba(0, 0, 0, 0.2)`
                  }}
                  title={value.name}
                >
                  {colorTheme === key && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div 
                        className="w-3 h-3 rounded-full border-2 border-white"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                      ></div>
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div 
                    className="absolute inset-0 bg-white opacity-0 hover:opacity-20 transition-opacity duration-200"
                  ></div>
                </button>
              ))}
            </div>
          </div>

          {/* Mode Toggle */}
          <div 
            className="border-t pt-4 transition-colors duration-300"
            style={{ borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
          >
            <h4 
              className="text-sm font-semibold mb-4 transition-colors duration-300"
              style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
            >
              Appearance Mode
            </h4>
            <div className="flex items-center justify-between">
              <span 
                className="text-sm transition-colors duration-300"
                style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
              >
                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </span>
              <button
                onClick={handleModeToggle}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105"
                style={{ 
                  backgroundColor: theme === 'dark' 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(0, 0, 0, 0.05)',
                  border: `2px solid ${currentTheme.primary}60`,
                  boxShadow: `0 4px 12px rgba(0, 0, 0, 0.1)`
                }}
              >
                {theme === 'dark' ? (
                  <>
                    <Moon size={18} style={{ color: currentTheme.primary }} />
                    <span 
                      className="text-sm font-medium transition-colors duration-300"
                      style={{ color: '#ffffff' }}
                    >
                      Dark Mode
                    </span>
                  </>
                ) : (
                  <>
                    <Sun size={18} style={{ color: currentTheme.primary }} />
                    <span 
                      className="text-sm font-medium transition-colors duration-300"
                      style={{ color: '#000000' }}
                    >
                      Light Mode
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Current Selection Display */}
          <div 
            className="mt-6 p-4 rounded-xl transition-all duration-300"
            style={{ 
              backgroundColor: theme === 'dark' 
                ? 'rgba(255, 255, 255, 0.08)' 
                : 'rgba(0, 0, 0, 0.03)',
              border: `1px solid ${currentTheme.primary}30`
            }}
          >
            <div className="flex items-center justify-between text-sm">
              <span 
                className="font-medium transition-colors duration-300"
                style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
              >
                Current Theme:
              </span>
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full border-2 border-white"
                  style={{ backgroundColor: currentTheme.primary }}
                ></div>
                <span 
                  className="font-bold"
                  style={{ color: currentTheme.primary }}
                >
                  {COLOR_THEMES[colorTheme].name} {theme === 'dark' ? 'Dark' : 'Light'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;