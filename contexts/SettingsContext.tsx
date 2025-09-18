import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Settings, Language, ThemeColor, ThemeSettings, ClockSettings, ChatSettings } from '../types';

const THEMES: Record<string, ThemeColor> = {
    'sayangku_blue': { name: 'Sayangku Blue', gradient: 'linear-gradient(to top, #0d3b66, #2a628f)', main: '#2a628f' },
    'ocean_teal': { name: 'Ocean Teal', gradient: 'linear-gradient(to top, #0c4b5e, #1e838e)', main: '#1e838e' },
    'sunset_orange': { name: 'Sunset Orange', gradient: 'linear-gradient(to top, #8c2d0a, #d54d23)', main: '#d54d23' },
    'royal_purple': { name: 'Royal Purple', gradient: 'linear-gradient(to top, #4c1d95, #6d28d9)', main: '#6d28d9' },
};

const defaultSettings: Settings = {
  language: 'en',
  theme: {
    home: THEMES['sayangku_blue'],
    calculator: THEMES['sayangku_blue'],
    translator: THEMES['sayangku_blue'],
  },
  clock: {
    font: 'font-nunito',
    position: 'center',
  },
  chat: {
    wallpaper: 'https://picsum.photos/seed/chatbg/800/1200',
    myBubbleColor: '#2563eb', // blue-600
    otherBubbleColor: '#4b5563', // gray-600
    textSize: 'text-base',
    anonymousMode: false,
    autoTranslate: false,
    translateToLang: 'en',
    translateScope: null,
  }
};

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  availableThemes: Record<string, ThemeColor>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const storedSettings = localStorage.getItem('sayangku-settings');
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        // Ensure chat settings exist
        if (!parsed.chat) {
          parsed.chat = defaultSettings.chat;
        }
        return parsed;
      }
      return defaultSettings;
    } catch (error) {
      console.error("Could not parse settings from localStorage", error);
      return defaultSettings;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sayangku-settings', JSON.stringify(settings));
    } catch (error) {
      console.error("Could not save settings to localStorage", error);
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ 
      ...prev, 
      ...newSettings,
      theme: { ...prev.theme, ...newSettings.theme },
      clock: { ...prev.clock, ...newSettings.clock },
      chat: { ...prev.chat, ...newSettings.chat },
    }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, availableThemes: THEMES }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};