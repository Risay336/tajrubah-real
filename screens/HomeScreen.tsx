import React, { useState } from 'react';
import useClock from '../hooks/useClock';
import { useSettings } from '../contexts/SettingsContext';
import useTranslation from '../hooks/useTranslation';
import { ClockPosition } from '../types';
import PracticeIcon from '../components/icons/PracticeIcon';

interface HomeScreenProps {
  wallpaper: string;
  setWallpaper: (url: string) => void;
  onNavigateToPractice: () => void;
}

const wallpapers = [
  'https://picsum.photos/seed/love/800/1200',
  'https://picsum.photos/seed/sky/800/1200',
  'https://picsum.photos/seed/ocean/800/1200',
  'https://picsum.photos/seed/forest/800/1200',
];

const HomeScreen: React.FC<HomeScreenProps> = ({ wallpaper, setWallpaper, onNavigateToPractice }) => {
  const { settings } = useSettings();
  const { time, day } = useClock(settings.language);
  const [showWallpaperMenu, setShowWallpaperMenu] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const { t } = useTranslation();
  const isRtl = settings.language === 'ar';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setWallpaper(reader.result as string);
        setShowWallpaperMenu(false);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handlePracticeClick = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setTimeout(() => {
        onNavigateToPractice();
        // Reset state after navigating, ready for next time
        setTimeout(() => setIsFlipping(false), 100);
    }, 600); // Duration matches animation
  };

  const positionClasses: Record<ClockPosition, string> = {
    start: 'items-start text-start',
    center: 'items-center text-center',
    end: 'items-end text-end',
  };

  return (
    <div className="flex flex-col h-full text-white p-4">
      <div className={`flex-grow flex flex-col justify-center w-full text-shadow-lg ${positionClasses[settings.clock.position]}`}>
        <h1 className={`text-8xl font-bold tracking-tight ${settings.clock.font}`}>{time}</h1>
        <p className={`text-2xl mt-2 text-shadow ${settings.clock.font === 'font-pacifico' ? 'font-nunito' : ''}`}>{day}</p>
      </div>
      
      <div className={`absolute bottom-20 flex flex-col items-center gap-4 ${isRtl ? 'left-4' : 'right-4'}`}>
        {/* Wallpaper Button - Moved up */}
        <div className="relative">
            <button 
                onClick={() => setShowWallpaperMenu(!showWallpaperMenu)} 
                className="p-3 bg-black/50 rounded-full hover:bg-white/20 transition-all duration-300 shadow-lg"
                aria-label={t('change_wallpaper')}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </button>

            {showWallpaperMenu && (
                <div className={`absolute bottom-14 bg-black/70 backdrop-blur-md p-2 rounded-lg w-48 shadow-2xl ${isRtl ? 'left-0' : 'right-0'}`}>
                    <p className="text-xs text-gray-300 px-2 pb-2">{t('change_wallpaper')}</p>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        {wallpapers.map((url, index) => (
                            <img 
                                key={index}
                                src={url}
                                className={`w-full h-16 object-cover rounded-md cursor-pointer border-2 ${wallpaper === url ? 'border-blue-400' : 'border-transparent'}`}
                                onClick={() => { setWallpaper(url); setShowWallpaperMenu(false); }}
                                alt={`${t('wallpaper')} ${index + 1}`}
                            />
                        ))}
                    </div>
                    <label className="w-full text-center py-2 px-4 bg-blue-500/80 rounded-md text-sm cursor-pointer hover:bg-blue-600/80 transition-colors">
                        {t('upload')}
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                </div>
            )}
        </div>

        {/* Practice Hub Button - Updated */}
        <button
            onClick={handlePracticeClick}
            className="p-4 bg-black/50 rounded-full hover:bg-white/20 transition-all duration-300 shadow-lg transform hover:scale-110"
            aria-label={t('practice_hub')}
            style={{ perspective: '1000px' }}
        >
            <div className={isFlipping ? 'animate-flip-icon' : ''}>
                <PracticeIcon className="w-8 h-8" />
            </div>
        </button>
      </div>

      <style>{`
        .text-shadow { text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
        .text-shadow-lg { text-shadow: 0 4px 10px rgba(0,0,0,0.5); }
        @keyframes flip-icon {
            0% { transform: rotateY(0deg); }
            100% { transform: rotateY(360deg); }
        }
        .animate-flip-icon {
            animation: flip-icon 0.6s ease-in-out;
            transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
};

export default HomeScreen;