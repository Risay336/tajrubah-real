import React, { useState, useRef, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import useTranslation from '../hooks/useTranslation';
import { Language, ThemeColor, ClockFont, ClockPosition, User } from '../types';
import { useAuth } from '../contexts/AuthContext';

type SettingsPage = 'main' | 'theme' | 'language' | 'clock' | 'profile';

const SubPageButton: React.FC<{ onClick: () => void; isActive?: boolean; children: React.ReactNode; className?: string }> = ({ onClick, isActive = false, children, className = '' }) => (
    <button
        onClick={onClick}
        className={`w-full text-center p-3 rounded-lg transition-colors duration-200 ${isActive ? 'bg-white/20' : 'bg-white/10 hover:bg-white/15'} ${className}`}
    >
        {children}
    </button>
);

const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [page, setPage] = useState<SettingsPage>('main');
  const { settings, updateSettings, availableThemes } = useSettings();
  const { t, currentLang } = useTranslation();
  const { user, updateProfile, logout } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState<User | null>(user);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const isRtl = currentLang === 'ar';

  useEffect(() => {
    if (user) {
        setProfileData(user);
    }
  }, [user]);

  if (!isOpen) return null;

  const handleLanguageChange = (lang: Language) => updateSettings({ language: lang });
  const handleThemeChange = (category: 'home' | 'calculator' | 'translator', theme: ThemeColor) => updateSettings({ theme: { ...settings.theme, [category]: theme } });
  const handleClockFontChange = (font: ClockFont) => updateSettings({ clock: { ...settings.clock, font } });
  const handleClockPositionChange = (position: ClockPosition) => updateSettings({ clock: { ...settings.clock, position } });
  
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && profileData) {
        const reader = new FileReader();
        reader.onload = (event) => {
            setProfileData({...profileData, avatar: event.target!.result as string });
        };
        reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleProfileSave = () => {
    if (profileData) {
        updateProfile(profileData);
        setIsEditingProfile(false);
    }
  };

  const renderContent = () => {
    switch (page) {
      case 'main':
        return (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center">{t('settings_title')}</h2>
            <div className="flex flex-col space-y-4">
              <button className="settings-main-btn" onClick={() => setPage('profile')}>{t('profile')}</button>
              <button className="settings-main-btn" onClick={() => setPage('theme')}>{t('themes')}</button>
              <button className="settings-main-btn" onClick={() => setPage('language')}>{t('language')}</button>
              <button className="settings-main-btn" disabled>{t('chat_settings')}</button>
              <button className="settings-main-btn" disabled>{t('music')}</button>
              <button className="settings-main-btn" disabled>{t('more')}</button>
            </div>
          </>
        );
      
      case 'profile':
        if (!profileData) return null;
        return (
             <>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">{t('profile')}</h2>
                    {!isEditingProfile && (
                        <button onClick={() => setIsEditingProfile(true)} className="text-blue-300 hover:underline">{t('edit_profile')}</button>
                    )}
                </div>
                <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                       <img src={profileData.avatar} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-blue-400"/>
                       {isEditingProfile && (
                            <button type="button" onClick={() => avatarInputRef.current?.click()} className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full hover:bg-blue-600">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                            </button>
                       )}
                       <input type="file" ref={avatarInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                    </div>

                    {isEditingProfile ? (
                        <input type="text" value={profileData.username} onChange={e => setProfileData({...profileData, username: e.target.value})} className="bg-white/10 text-white text-3xl font-bold text-center rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    ) : (
                        <h2 className="text-3xl font-bold">{profileData.username}</h2>
                    )}
                </div>

                <div className="w-full mt-6 text-left space-y-3">
                    <div className="bg-white/5 p-3 rounded-lg">
                        <label className="text-xs text-blue-200">{t('email_address')}</label>
                        <p className="text-md">{profileData.id}</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg">
                        <label className="text-xs text-blue-200">{t('date_of_birth')}</label>
                        {isEditingProfile ? (
                             <input type="date" value={profileData.dob} onChange={e => setProfileData({...profileData, dob: e.target.value})} className="w-full bg-transparent text-white focus:outline-none"/>
                        ) : (
                            <p className="text-md">{profileData.dob}</p>
                        )}
                    </div>
                </div>

                {isEditingProfile && (
                    <div className="mt-6 flex gap-3">
                        <button onClick={() => { setIsEditingProfile(false); setProfileData(user); }} className="flex-1 py-3 bg-white/10 rounded-lg">{t('cancel_reply')}</button>
                        <button onClick={handleProfileSave} className="flex-1 py-3 bg-blue-600 rounded-lg">{t('save_changes')}</button>
                    </div>
                )}
                 <button onClick={logout} className="mt-6 w-full py-3 bg-red-600/50 text-white rounded-lg font-semibold hover:bg-red-600/70 transition-colors">{t('logout')}</button>
            </>
        );

      case 'theme':
        return (
          <>
            <h2 className="text-xl font-bold mb-6">{t('themes')}</h2>
            <div className="space-y-6">
              {[
                { title: t('edit_home_theme'), category: 'home' as const },
                { title: t('edit_calculator_theme'), category: 'calculator' as const },
                { title: t('edit_translator_theme'), category: 'translator' as const },
              ].map(({ title, category }) => (
                <div key={category}>
                  <h3 className="font-semibold mb-3">{title}</h3>
                  <div className="flex flex-wrap gap-4 justify-center">
                    {Object.values(availableThemes).map(theme => (
                      <button key={theme.name} onClick={() => handleThemeChange(category, theme)} className="text-center group">
                        <div
                          className="w-12 h-12 rounded-full border-4 transition-all duration-300 group-hover:scale-110"
                          style={{
                            background: theme.gradient,
                            borderColor: settings.theme[category].name === theme.name ? theme.main : 'transparent'
                          }}
                        />
                        <span className="text-xs mt-1 block">{t(theme.name.toLowerCase().replace(' ', '_') as any)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <hr className="border-white/10 my-6"/>
              <SubPageButton onClick={() => setPage('clock')}>{t('edit_time_and_date')}</SubPageButton>
            </div>
          </>
        );

      case 'language':
        return (
          <>
            <h2 className="text-xl font-bold mb-6">{t('language')}</h2>
            <div className="space-y-3">
              <SubPageButton onClick={() => handleLanguageChange('en')} isActive={settings.language === 'en'}>English</SubPageButton>
              <SubPageButton onClick={() => handleLanguageChange('id')} isActive={settings.language === 'id'}>Bahasa Indonesia</SubPageButton>
              <SubPageButton onClick={() => handleLanguageChange('ar')} isActive={settings.language === 'ar'}>العربية</SubPageButton>
            </div>
          </>
        );
      
      case 'clock':
        return (
          <>
            <h2 className="text-xl font-bold mb-6">{t('edit_time_and_date')}</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">{t('clock_font')}</h3>
                <div className="flex gap-2">
                  <SubPageButton onClick={() => handleClockFontChange('font-nunito')} isActive={settings.clock.font === 'font-nunito'} className="flex-1">Normal</SubPageButton>
                  <SubPageButton onClick={() => handleClockFontChange('font-roboto-mono')} isActive={settings.clock.font === 'font-roboto-mono'} className="flex-1 font-roboto-mono">Digital</SubPageButton>
                  <SubPageButton onClick={() => handleClockFontChange('font-pacifico')} isActive={settings.clock.font === 'font-pacifico'} className="flex-1 font-script">Script</SubPageButton>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3">{t('clock_position')}</h3>
                <div className="flex gap-2">
                  <SubPageButton onClick={() => handleClockPositionChange('start')} isActive={settings.clock.position === 'start'} className="flex-1">{t('left')}</SubPageButton>
                  <SubPageButton onClick={() => handleClockPositionChange('center')} isActive={settings.clock.position === 'center'} className="flex-1">{t('center')}</SubPageButton>
                  <SubPageButton onClick={() => handleClockPositionChange('end')} isActive={settings.clock.position === 'end'} className="flex-1">{t('right')}</SubPageButton>
                </div>
              </div>
            </div>
          </>
        );
    }
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      style={{ animation: 'fadeIn 0.3s ease-out forwards' }}
    >
      <div 
        className="bg-gray-800/80 backdrop-blur-xl text-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] flex flex-col"
        style={{ 
            background: `linear-gradient(to bottom, ${settings.theme.home.main}, #1f2937)`,
            animation: 'scaleIn 0.3s ease-out forwards'
        }}
        onClick={e => e.stopPropagation()}
      >
        <header className="p-4 flex items-center justify-between border-b border-white/10 flex-shrink-0">
          {page !== 'main' ? (
            <button onClick={() => setPage(page === 'clock' ? 'theme' : 'main')} className="p-2 -m-2">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transform ${isRtl ? 'rotate-180': ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
          ) : <div className="w-6"/>}
          <h1 className="text-lg font-bold text-center">{t('app_name')}</h1>
          <button onClick={onClose} className="p-2 -m-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>
        <div className="p-6 overflow-y-auto">
          {renderContent()}
        </div>
      </div>

      <style>{`
        .settings-main-btn {
          width: 100%;
          text-align: left;
          padding: 1.25rem; /* p-5 */
          font-size: 1.25rem; /* text-xl */
          line-height: 1.75rem;
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 0.75rem; /* rounded-xl */
          transition: all 0.3s ease-out;
        }
        .settings-main-btn:hover:not(:disabled) {
          background-color: rgba(255, 255, 255, 0.1);
          transform: translateY(-4px) scale(1.02);
        }
        .settings-main-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default SettingsModal;