import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Screen, GalleryImage, User } from './types';
import HomeScreen from './screens/HomeScreen';
import CalculatorScreen from './screens/CalculatorScreen';
import ChatScreen from './screens/ChatScreen';
import TranslatorScreen from './screens/TranslatorScreen';
import GalleryScreen from './screens/GalleryScreen';
import PracticeScreen from './screens/PracticeScreen';
import BottomNav from './components/BottomNav';
import Logo from './components/Logo';
import SettingsModal from './components/SettingsModal';
import { useSettings } from './contexts/SettingsContext';
import { useAuth } from './contexts/AuthContext';
import AuthScreen from './screens/AuthScreen';
import LoveAnimation from './components/LoveAnimation';
import ViewProfileModal from './components/ViewProfileModal';
import { useMusic } from './contexts/MusicContext';

const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<Screen>(Screen.Home);
  const [wallpaper, setWallpaper] = useState<string>('https://picsum.photos/seed/love/800/1200');
  const [replyingToImage, setReplyingToImage] = useState<GalleryImage | null>(null);
  const [viewImageId, setViewImageId] = useState<number | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<User | null>(null);
  const [showStartupAnimation, setShowStartupAnimation] = useState(true);

  const { settings } = useSettings();
  const { user, loading } = useAuth();
  const { currentTrack, isPlaying, volume, playbackMode, playNext } = useMusic();
  const audioRef = useRef<HTMLAudioElement>(null);


  useEffect(() => {
    document.documentElement.lang = settings.language;
    document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
    document.body.style.fontFamily = settings.language === 'ar' ? "'Tajawal', sans-serif" : "'Nunito', sans-serif";
  }, [settings.language]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowStartupAnimation(false);
    }, 4000); // Animation lasts 4 seconds
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentTrack && audio.src !== currentTrack.url) {
      audio.src = currentTrack.url;
    }

    if (isPlaying && currentTrack) {
        audio.play().catch(e => console.error("Audio play failed:", e));
    } else {
        audio.pause();
    }
  }, [isPlaying, currentTrack]);
  
  useEffect(() => {
      if (audioRef.current) {
          audioRef.current.volume = volume;
      }
  }, [volume]);

  const handleAudioEnded = () => {
    if (playbackMode !== 'repeat_one') {
        playNext();
    }
  };


  const handleReplyToImage = (image: GalleryImage) => {
    setReplyingToImage(image);
    setActiveScreen(Screen.Chat);
  };

  const clearReplyingToImage = () => {
    setReplyingToImage(null);
  };

  const handleViewImageInGallery = (imageId: number) => {
    setViewImageId(imageId);
    setActiveScreen(Screen.Gallery);
  };

  const clearViewImageId = () => {
    setViewImageId(null);
  };

  const handleViewProfile = (profile: User) => {
    setViewingProfile(profile);
  };

  const renderScreen = useCallback(() => {
    switch (activeScreen) {
      case Screen.Home:
        return <HomeScreen wallpaper={wallpaper} setWallpaper={setWallpaper} onNavigateToPractice={() => setActiveScreen(Screen.Practice)} />;
      case Screen.Calculator:
        return <CalculatorScreen />;
      case Screen.Chat:
        return <ChatScreen 
                    replyingToImage={replyingToImage} 
                    onClearReply={clearReplyingToImage} 
                    onViewImage={handleViewImageInGallery}
                    onViewProfile={handleViewProfile}
                />;
      case Screen.Translator:
        return <TranslatorScreen />;
      case Screen.Gallery:
        return <GalleryScreen 
                    onReplyToImage={handleReplyToImage} 
                    viewImageId={viewImageId}
                    onClearViewImageId={clearViewImageId}
                />;
      case Screen.Practice:
        return <PracticeScreen />;
      default:
        return <HomeScreen wallpaper={wallpaper} setWallpaper={setWallpaper} onNavigateToPractice={() => setActiveScreen(Screen.Practice)} />;
    }
  }, [activeScreen, wallpaper, replyingToImage, viewImageId]);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-300"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        {showStartupAnimation && <LoveAnimation />}
        <AuthScreen />
      </>
    );
  }

  return (
    <div className={`h-screen w-screen flex flex-col font-sans bg-gray-900 overflow-hidden ${settings.language === 'ar' ? 'font-tajawal' : 'font-nunito'}`}>
      {showStartupAnimation && <LoveAnimation />}
      <audio 
        ref={audioRef} 
        onEnded={handleAudioEnded} 
        loop={playbackMode === 'repeat_one'}
      />
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-500"
        style={{ backgroundImage: `url(${wallpaper})` }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
      </div>
      
      <div className="relative flex flex-col h-full z-10">
        {activeScreen === Screen.Home && <Logo onOpenSettings={() => setIsSettingsOpen(true)} />}
        
        <main className="flex-grow flex flex-col overflow-y-auto">
          {renderScreen()}
        </main>
        
        <BottomNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <ViewProfileModal user={viewingProfile} onClose={() => setViewingProfile(null)} />
    </div>
  );
};

export default App;