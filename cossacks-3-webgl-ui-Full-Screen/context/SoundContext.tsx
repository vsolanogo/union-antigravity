
import React, { createContext, useContext, useState, useEffect } from 'react';
import { setMuted as setEngineMuted, resumeAudioContext } from '../utils/audio';

interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Browsers require a user interaction to resume AudioContext.
    // We attach a one-time listener to capture the first click anywhere.
    const unlockAudio = () => {
      resumeAudioContext();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    
    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
    
    return () => {
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
    }
  }, []);

  const toggleMute = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    setEngineMuted(newState);
  };

  return (
    <SoundContext.Provider value={{ isMuted, toggleMute }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSoundContext = () => {
  const context = useContext(SoundContext);
  if (!context) throw new Error('useSoundContext must be used within SoundProvider');
  return context;
};
