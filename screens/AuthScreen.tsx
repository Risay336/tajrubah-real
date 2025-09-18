import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import useTranslation from '../hooks/useTranslation';
import { User, Language } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import { logoBase64 } from '../assets/logo';

type AuthStep = 'welcome' | 'email' | 'profile' | 'success';

const LanguagePicker: React.FC = () => {
    const { settings, updateSettings } = useSettings();
    const [isOpen, setIsOpen] = useState(false);
    const isRtl = settings.language === 'ar';

    const languages: { code: Language, name: string }[] = [
        { code: 'en', name: 'English' },
        { code: 'id', name: 'Bahasa Indonesia' },
        { code: 'ar', name: 'العربية' },
    ];

    const selectLanguage = (lang: Language) => {
        updateSettings({ language: lang });
        setIsOpen(false);
    };

    return (
        <div className={`absolute top-4 z-10 ${isRtl ? 'left-4' : 'right-4'}`}>
            <div className="relative">
                <button
                    onClick={() => setIsOpen(prev => !prev)}
                    className="bg-black/20 text-white font-bold py-2 px-4 rounded-full text-sm flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                    </svg>
                    <span className="uppercase">{settings.language}</span>
                </button>

                {isOpen && (
                    <div 
                        className={`absolute top-full mt-2 w-48 bg-gray-800/90 backdrop-blur-md rounded-lg shadow-lg overflow-hidden animate-fade-in-down ${isRtl ? 'left-0' : 'right-0'}`}
                        style={{ animationDuration: '200ms' }}
                    >
                        {languages.map(lang => (
                             <button 
                                key={lang.code} 
                                onClick={() => selectLanguage(lang.code)}
                                className={`block w-full text-left px-4 py-3 hover:bg-white/10 transition-colors ${settings.language === lang.code ? 'bg-blue-500/50' : ''} ${lang.code === 'ar' ? 'font-tajawal' : ''}`}
                            >
                                {lang.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};


const AuthScreen: React.FC = () => {
    const [step, setStep] = useState<AuthStep>('welcome');
    const [email, setEmail] = useState('');
    const [profile, setProfile] = useState<Omit<User, 'id'>>({
        username: '',
        dob: '',
        avatar: 'https://picsum.photos/seed/default/200/200',
    });
    const { login, signUp } = useAuth();
    const { t } = useTranslation();
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const today = new Date().toISOString().split('T')[0];

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setProfile(p => ({...p, avatar: event.target!.result as string }));
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    // Simulate login for existing user, sign up for new user
    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // A real app would check if the user exists. Here we check localStorage.
        const storedUser = localStorage.getItem(`sayangku-user-${email}`);
        if (storedUser) {
            login(email); // Log in existing user
        } else {
            setStep('profile'); // New user, proceed to profile creation
        }
    };
    
    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!profile.username || !profile.dob || !email) return;
        const newUser: User = { id: email, ...profile };
        signUp(newUser);
        setStep('success');
    };

    const renderStep = () => {
        switch(step) {
            case 'welcome':
                return (
                    <>
                        <img src={logoBase64} alt="Sayangku Logo" className="w-24 h-24 rounded-full shadow-lg mb-4" />
                        <h1 className="text-4xl font-bold font-script text-white mb-2">{t('welcome_to_sayangku')}</h1>
                        <p className="text-blue-200 mb-8">{t('connect_with_google')}</p>
                        <div className="w-full space-y-4">
                            <button onClick={() => setStep('email')} className="w-full bg-blue-600 text-white font-bold py-3 rounded-full text-lg hover:bg-blue-700 transition-transform hover:scale-105">{t('sign_in')}</button>
                            <button onClick={() => setStep('email')} className="w-full bg-white/20 text-white font-bold py-3 rounded-full text-lg hover:bg-white/30 transition-transform hover:scale-105">{t('login')}</button>
                        </div>
                    </>
                );
            case 'email':
                return (
                    <form onSubmit={handleEmailSubmit} className="w-full flex flex-col items-center">
                        <h2 className="text-3xl font-bold text-white mb-6">{t('email_address')}</h2>
                        <div className="relative w-full mb-6">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full bg-white/10 text-white py-3 pl-5 pr-28 rounded-full text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                             <button
                                type="button"
                                onClick={() => {
                                    if (email && !email.includes('@')) {
                                        setEmail(email + '@gmail.com');
                                    }
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 text-white text-xs font-bold py-1.5 px-3 rounded-full hover:bg-white/30 transition-colors"
                            >
                                @gmail.com
                            </button>
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-full text-lg hover:bg-blue-700 transition-transform hover:scale-105 disabled:bg-gray-500" disabled={!email}>{t('continue')}</button>
                    </form>
                );
             case 'profile':
                return (
                    <form onSubmit={handleProfileSubmit} className="w-full flex flex-col items-center">
                        <h2 className="text-3xl font-bold text-white mb-6">{t('create_your_profile')}</h2>
                        <div className="relative mb-4">
                           <img src={profile.avatar} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-blue-400"/>
                           <button type="button" onClick={() => avatarInputRef.current?.click()} className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full hover:bg-blue-600">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                           </button>
                           <input type="file" ref={avatarInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                        </div>
                         <input
                            type="text"
                            value={profile.username}
                            onChange={(e) => setProfile(p => ({...p, username: e.target.value}))}
                            placeholder={t('username')}
                            className="w-full bg-white/10 text-white py-3 px-5 rounded-full text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                            required
                        />
                         <input
                            type="date"
                            value={profile.dob}
                            onChange={(e) => setProfile(p => ({...p, dob: e.target.value}))}
                            placeholder={t('date_of_birth')}
                            className="w-full bg-white/10 text-white py-3 px-5 rounded-full text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
                            required
                            max={today}
                        />
                        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-full text-lg hover:bg-blue-700 transition-transform hover:scale-105 disabled:bg-gray-500" disabled={!profile.username || !profile.dob}>{t('confirm')}</button>
                    </form>
                );
            case 'success':
                 return (
                    <div className="flex flex-col items-center text-center">
                        <div className="text-8xl mb-4 animate-bounce">✅</div>
                        <h2 className="text-3xl font-bold text-white">{t('account_created_successfully')}</h2>
                    </div>
                );
        }
    }

    return (
        <div className="h-screen w-screen bg-gray-900 flex flex-col items-center justify-center p-8 transition-all duration-500" style={{background: 'linear-gradient(to top, #0d3b66, #2a628f)'}}>
            <LanguagePicker />
            <div className="w-full max-w-sm flex flex-col items-center text-center">
                {renderStep()}
            </div>
             <style>{`
                @keyframes fade-in-down {
                    0% { opacity: 0; transform: translateY(-10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-down { animation: fade-in-down 0.3s ease-out forwards; }
            `}</style>
        </div>
    )
}

export default AuthScreen;