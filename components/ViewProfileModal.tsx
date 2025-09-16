import React from 'react';
import { User } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import useTranslation from '../hooks/useTranslation';

interface ViewProfileModalProps {
  user: User | null;
  onClose: () => void;
}

const ViewProfileModal: React.FC<ViewProfileModalProps> = ({ user, onClose }) => {
  const { settings } = useSettings();
  const { t } = useTranslation();

  if (!user) return null;

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
        <header className="p-4 flex items-center justify-end border-b border-white/10 flex-shrink-0">
          <button onClick={onClose} className="p-2 -m-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>
        <div className="p-6 overflow-y-auto flex flex-col items-center">
            <img src={user.avatar} alt={user.username} className="w-32 h-32 rounded-full object-cover border-4 border-blue-400 mb-4" />
            <h2 className="text-3xl font-bold">{user.username}</h2>
            
            <div className="w-full mt-6 text-left">
                 <div className="bg-white/5 p-3 rounded-lg">
                    <label className="text-xs text-blue-200">{t('email_address')}</label>
                    <p className="text-md">{user.id}</p>
                 </div>
                 <div className="bg-white/5 p-3 rounded-lg mt-3">
                    <label className="text-xs text-blue-200">{t('date_of_birth')}</label>
                    <p className="text-md">{user.dob}</p>
                 </div>
            </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default ViewProfileModal;