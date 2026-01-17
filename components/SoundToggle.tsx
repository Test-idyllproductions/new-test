import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useTheme } from '../lib/theme-context';

const SoundToggle: React.FC = () => {
  const { soundEnabled, toggleSound } = useTheme();

  return (
    <button
      onClick={toggleSound}
      className={`p-2 rounded-lg transition-all duration-200 ${
        soundEnabled 
          ? 'text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10' 
          : 'text-muted hover:text-secondary hover:bg-hover'
      }`}
      title={soundEnabled ? 'Mute notifications' : 'Unmute notifications'}
    >
      {soundEnabled ? (
        <Volume2 className="w-5 h-5" />
      ) : (
        <VolumeX className="w-5 h-5" />
      )}
    </button>
  );
};

export default SoundToggle;