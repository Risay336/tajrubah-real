import React, { useState } from 'react';
import useTranslation from '../hooks/useTranslation';
import { useSettings } from '../contexts/SettingsContext';

interface LogoProps {
    onOpenSettings: () => void;
}

const Heart: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div className="absolute text-blue-300" style={style}>
    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
    </svg>
  </div>
);

const LoveEffect: React.FC = () => {
    const hearts = Array.from({ length: 15 }).map((_, i) => {
        const size = Math.random() * 2 + 1; // 1rem to 3rem
        const animationDuration = Math.random() * 2 + 3; // 3s to 5s
        const animationDelay = Math.random() * 0.5;
        const left = Math.random() * 100;
        
        const style: React.CSSProperties = {
            width: `${size}rem`,
            height: `${size}rem`,
            left: `${left}vw`,
            animation: `floatUp ${animationDuration}s ease-out forwards`,
            animationDelay: `${animationDelay}s`,
            opacity: 0,
        };
        
        return <Heart key={i} style={style} />;
    });

    return <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">{hearts}
        <style>{`
            @keyframes floatUp {
                0% { transform: translateY(0); opacity: 1; }
                100% { transform: translateY(-100vh); opacity: 0; }
            }
        `}</style>
    </div>;
};


const Logo: React.FC<LogoProps> = ({ onOpenSettings }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showLove, setShowLove] = useState(false);
  const { t } = useTranslation();
  const { settings } = useSettings();
  const isRtl = settings.language === 'ar';

  const handleClick = () => {
    setShowLove(true);
    setTimeout(() => setShowLove(false), 5000); // Effect lasts 5 seconds
    setShowMenu(prev => !prev);
  };
  
  const handleMenuClick = (action: () => void) => {
    action();
    setShowMenu(false);
  };

  const menuItems = [
    { label: t('settings_title'), action: onOpenSettings },
    { label: t('contact'), action: () => {} },
    { label: t('quit'), action: () => {} },
  ];

  return (
    <header className={`absolute top-0 p-4 z-30 ${isRtl ? 'right-0' : 'left-0'}`}>
        {showLove && <LoveEffect />}
        <div className="relative">
            <button onClick={handleClick} className="transition-transform duration-300 hover:scale-110 focus:outline-none">
                <img src="/logo.png" alt="Sayangku Logo" className="w-16 h-16 rounded-full shadow-lg" />
            </button>
            {showMenu && (
                <div className={`absolute top-20 bg-black/50 backdrop-blur-lg text-white rounded-lg shadow-2xl overflow-hidden animate-fade-in-down ${isRtl ? 'right-0' : 'left-0'}`}>
                    {menuItems.map((item, index) => (
                        <button 
                            key={index}
                            onClick={() => handleMenuClick(item.action)} 
                            className="block w-full text-left px-4 py-3 hover:bg-white/10 transition-colors"
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
        <style>{`
            @keyframes fade-in-down {
                0% { opacity: 0; transform: translateY(-10px); }
                100% { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-down { animation: fade-in-down 0.3s ease-out forwards; }
        `}</style>
    </header>
  );
};

export default Logo;