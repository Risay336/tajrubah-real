import React, { useState, useCallback } from 'react';
import { translateText } from '../services/geminiService';
import { useSettings } from '../contexts/SettingsContext';
import useTranslation from '../hooks/useTranslation';

const TranslatorScreen: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Indonesian');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { settings } = useSettings();
  const { t } = useTranslation();

  const handleTranslate = useCallback(async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setError(null);
    setOutputText('');
    try {
      const result = await translateText(inputText, sourceLang, targetLang);
      setOutputText(result);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [inputText, sourceLang, targetLang]);

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(outputText);
    setOutputText(inputText);
  };

  const buttonStyle = { backgroundColor: settings.theme.translator.main };

  return (
    <div className="flex flex-col h-full bg-black/10 backdrop-blur-sm p-4">
        <header className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white text-shadow-md">{t('translator_title_sayangku')} {t('translator_title_translate')}</h1>
            <p className="text-blue-200">Powered by Gemini</p>
        </header>

      <div className="flex items-center justify-between mb-4">
        <span className="text-lg font-semibold text-white w-2/5 text-center">{t(sourceLang.toLowerCase() as any)}</span>
        <button 
          onClick={swapLanguages} 
          style={buttonStyle}
          className="p-3 rounded-full text-white hover:opacity-80 transition-transform duration-300 hover:rotate-180"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
        </button>
        <span className="text-lg font-semibold text-white w-2/5 text-center">{t(targetLang.toLowerCase() as any)}</span>
      </div>

      <div className="flex flex-col gap-4 flex-grow">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t('enter_text_placeholder', { lang: t(sourceLang.toLowerCase() as any) })}
          className="flex-1 w-full p-4 bg-black/30 text-white rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex-1 w-full p-4 bg-black/50 text-white rounded-xl relative overflow-y-auto">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-300"></div>
                </div>
            )}
            {error && <p className="text-red-400">{error}</p>}
            <p className="whitespace-pre-wrap">{outputText}</p>
        </div>
      </div>
      
      <button
        onClick={handleTranslate}
        disabled={isLoading || !inputText}
        style={buttonStyle}
        className="mt-6 w-full py-4 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
      >
        {isLoading ? t('translating') : t('translate_button')}
      </button>
      <style>{`.text-shadow-md { text-shadow: 0 1px 3px rgba(0,0,0,0.4); }`}</style>
    </div>
  );
};

export default TranslatorScreen;