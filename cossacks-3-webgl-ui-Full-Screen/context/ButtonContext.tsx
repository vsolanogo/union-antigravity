import React, { createContext, useContext, useState, useCallback } from 'react';
import { ButtonContextType, ButtonState } from '../types';

const ButtonContext = createContext<ButtonContextType | undefined>(undefined);

export const ButtonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [buttons, setButtons] = useState<Map<string, ButtonState>>(new Map());

  const registerButton = useCallback((id: string, state: ButtonState) => {
    setButtons(prev => {
      const next = new Map<string, ButtonState>(prev);
      next.set(id, { ...state, lastClickTime: 0 });
      return next;
    });
  }, []);

  const updateButton = useCallback((id: string, partial: Partial<ButtonState>) => {
    setButtons(prev => {
      const next = new Map<string, ButtonState>(prev);
      const current = next.get(id);
      if (current) {
        next.set(id, { ...current, ...partial });
      }
      return next;
    });
  }, []);

  const unregisterButton = useCallback((id: string) => {
    setButtons(prev => {
      const next = new Map<string, ButtonState>(prev);
      next.delete(id);
      return next;
    });
  }, []);

  return (
    <ButtonContext.Provider value={{ buttons, registerButton, updateButton, unregisterButton }}>
      {children}
    </ButtonContext.Provider>
  );
};

export const useButtonContext = () => {
  const context = useContext(ButtonContext);
  if (!context) {
    throw new Error('useButtonContext must be used within a ButtonProvider');
  }
  return context;
};