import React from 'react';
import { Screen } from '../types';
import HomeIcon from './icons/HomeIcon';
import CalculatorIcon from './icons/CalculatorIcon';
import ChatIcon from './icons/ChatIcon';
import TranslateIcon from './icons/TranslateIcon';
import GalleryIcon from './icons/GalleryIcon';
import { useSettings } from '../contexts/SettingsContext';
import useTranslation from '../hooks/useTranslation';

interface BottomNavProps {
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    aria-label={label}
    className={`
      flex flex-col items-center justify-start w-1/5 h-16
      transition-transform duration-300 ease-out
      ${isActive ? '-translate-y-3' : 'hover:-translate-y-1'}
    `}
  >
    <div
      className={`
        relative flex items-center justify-center w-12 h-12 rounded-full
        transition-all duration-300 ease-out
        ${isActive ? 'bg-white/20' : ''}
      `}
    >
      <div
        className={`
          transition-all duration-300 ease-out
          ${isActive ? 'scale-125 text-white' : 'text-blue-200 hover:text-white'}
        `}
      >
        {icon}
      </div>
    </div>
    <span
      className={`
        text-xs mt-1 transition-colors duration-300
        ${isActive ? 'font-bold text-white' : 'text-blue-200'}
      `}
    >
      {label}
    </span>
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, setActiveScreen }) => {
  const { settings } = useSettings();
  const { t } = useTranslation();
  
  const navItems = [
    { screen: Screen.Calculator, label: t('nav_calc'), icon: <CalculatorIcon className="w-6 h-6" /> },
    { screen: Screen.Chat, label: t('nav_chat'), icon: <ChatIcon className="w-6 h-6" /> },
    { screen: Screen.Home, label: t('nav_home'), icon: <HomeIcon className="w-6 h-6" /> },
    { screen: Screen.Translator, label: t('nav_translate'), icon: <TranslateIcon className="w-6 h-6" /> },
    { screen: Screen.Gallery, label: t('nav_gallery'), icon: <GalleryIcon className="w-6 h-6" /> },
  ];

  return (
    <nav 
        className="w-full backdrop-blur-md border-t border-white/20 pt-1 transition-colors duration-500"
        style={{ background: settings.theme.home.gradient }}
    >
      <div className="flex justify-around max-w-md mx-auto">
        {navItems.map((item) => (
          <NavItem
            key={item.screen}
            label={item.label}
            icon={item.icon}
            isActive={activeScreen === item.screen}
            onClick={() => setActiveScreen(item.screen)}
          />
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;