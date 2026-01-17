import React, { useRef, useState, useEffect, ReactNode } from 'react';

interface MagicBentoProps {
  children?: ReactNode;
  className?: string;
  textAutoHide?: boolean;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  enableTilt?: boolean;
  enableMagnetism?: boolean;
  clickEffect?: boolean;
  spotlightRadius?: number;
  particleCount?: number;
  glowColor?: string;
}

const MagicBento: React.FC<MagicBentoProps> = ({
  children,
  className = '',
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  enableTilt = true,
  enableMagnetism = true,
  clickEffect = true,
  spotlightRadius = 300,
  particleCount = 12,
  glowColor = '132, 0, 255'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [tiltStyle, setTiltStyle] = useState({});
  const [particles, setParticles] = useState<Array<{ x: number; y: number; id: number }>>([]);

  useEffect(() => {
    if (!enableStars || !isHovered) return;

    const generateParticles = () => {
      const newParticles = Array.from({ length: particleCount }, (_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        id: Date.now() + i
      }));
      setParticles(newParticles);
    };

    generateParticles();
    const interval = setInterval(generateParticles, 3000);

    return () => clearInterval(interval);
  }, [isHovered, enableStars, particleCount]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePosition({ x, y });

    if (enableTilt) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      setTiltStyle({
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
        transition: 'transform 0.1s ease-out'
      });
    }

    if (enableMagnetism) {
      const magnetStrength = 0.15;
      const offsetX = ((x - rect.width / 2) / rect.width) * magnetStrength * 100;
      const offsetY = ((y - rect.height / 2) / rect.height) * magnetStrength * 100;

      setTiltStyle(prev => ({
        ...prev,
        transform: `${prev.transform || ''} translate(${offsetX}px, ${offsetY}px)`
      }));
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (enableTilt || enableMagnetism) {
      setTiltStyle({
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1) translate(0px, 0px)',
        transition: 'transform 0.3s ease-out'
      });
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!clickEffect || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Create ripple effect
    const ripple = document.createElement('div');
    ripple.style.position = 'absolute';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.width = '0px';
    ripple.style.height = '0px';
    ripple.style.borderRadius = '50%';
    ripple.style.background = `rgba(${glowColor}, 0.4)`;
    ripple.style.transform = 'translate(-50%, -50%)';
    ripple.style.animation = 'ripple-effect 0.6s ease-out';
    ripple.style.pointerEvents = 'none';

    containerRef.current.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

  return (
    <div
      ref={containerRef}
      className={`magic-bento relative overflow-hidden ${className}`}
      style={tiltStyle}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Border Glow */}
      {enableBorderGlow && isHovered && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle ${spotlightRadius}px at ${mousePosition.x}px ${mousePosition.y}px, rgba(${glowColor}, 0.15), transparent 80%)`,
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}

      {/* Spotlight Effect */}
      {enableSpotlight && isHovered && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${mousePosition.x}px`,
            top: `${mousePosition.y}px`,
            width: `${spotlightRadius * 2}px`,
            height: `${spotlightRadius * 2}px`,
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle, rgba(${glowColor}, 0.2) 0%, transparent 70%)`,
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}

      {/* Particle Stars */}
      {enableStars && isHovered && particles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 rounded-full pointer-events-none animate-pulse"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            background: `rgba(${glowColor}, 0.6)`,
            boxShadow: `0 0 4px rgba(${glowColor}, 0.8)`,
            animation: 'twinkle 2s ease-in-out infinite'
          }}
        />
      ))}

      {/* Content */}
      <div className={`relative z-10 ${textAutoHide && !isHovered ? 'opacity-70' : 'opacity-100'} transition-opacity duration-300`}>
        {children}
      </div>

      <style jsx>{`
        @keyframes ripple-effect {
          to {
            width: 300px;
            height: 300px;
            opacity: 0;
          }
        }

        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
};

export default MagicBento;
