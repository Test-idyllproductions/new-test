import React from 'react';
import { useTheme } from '../lib/theme-context';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  const { theme } = useTheme();
  
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-24'
  };

  // Use white logo for dark theme, black logo for light theme
  const logoSrc = theme === 'dark' 
    ? '/Logos/Idyll Productions White.png' 
    : '/Logos/Idyll Productions Black.png';

  return (
    <img 
      src={logoSrc} 
      alt="Idyll Productions" 
      className={`${sizeClasses[size]} w-auto object-contain ${className}`}
    />
  );
};

export default Logo;