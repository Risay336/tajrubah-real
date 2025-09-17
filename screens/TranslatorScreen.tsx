import React, { useState, useCallback, useEffect } from 'react';
import { translateText, getDefinition, getExamples } from '../services/geminiService';
import { useSettings } from '../contexts/SettingsContext';
import useTranslation from '../hooks/useTranslation';

const LanguageSelect: React.FC<{
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
}> = ({ value, onChange, options }) => (
    <div className="relative w-2/5">
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-black/30 text-white text-center appearance-none p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold custom-select"
        >
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
    </div>
);

const InfoBox: React.FC<{ title: string; content: string | null; isLoading: boolean; }> = ({ title, content, isLoading }) => (
    <div className="w-full p-4 bg-black/40 text-white rounded-xl relative min-h-[120px] flex-shrink-0">
        <h3 className="text-sm font-bold text-blue-200 mb-2">{title}</h3>
        {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-300"></div>
            </div>
        )}
        {content && !isLoading && (
            <p className="whitespace-pre-wrap">{content}</p>
        )}
    </div>
);


const TranslatorScreen: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Indonesian');
  
  const [sourceDefinition, setSourceDefinition] = useState<string | null>(null);
  const [sourceExamples, setSourceExamples] = useState<string | null>(null);
  const [targetDefinition, setTargetDefinition] = useState<string | null>(null);
  const [targetExamples, setTargetExamples] = useState<string | null>(null);

  const [isSourceDefinitionLoading, setIsSourceDefinitionLoading] = useState(false);
  const [isSourceExamplesLoading, setIsSourceExamplesLoading] = useState(false);
  const [isTargetDefinitionLoading, setIsTargetDefinitionLoading] = useState(false);
  const [isTargetExamplesLoading, setIsTargetExamplesLoading] = useState(false);

  const { settings } = useSettings();
  const { t } = useTranslation();

  const clearAllInfo = useCallback(() => {
    setSourceDefinition(null);
    setSourceExamples(null);
    setTargetDefinition(null);
    setTargetExamples(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (!inputText.trim()) {
      setOutputText('');
      clearAllInfo();
    }
  }, [inputText, clearAllInfo]);

  const handleTranslate = useCallback(async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setOutputText('');
    clearAllInfo();
    try {
      const result = await translateText(inputText, sourceLang, targetLang);
      setOutputText(result);
    } catch (err: any) {
      setError(t('error_translation'));
    } finally {
      setIsLoading(false);
    }
  }, [inputText, sourceLang, targetLang, t, clearAllInfo]);

  const swapLanguages = () => {
    const oldSource = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(oldSource);
    setInputText(outputText);
    setOutputText(inputText);
    clearAllInfo();
  };

  const handleClear = () => {
    setInputText('');
  };

  const handleGetSourceDefinition = async () => {
    if (!inputText.trim()) return;
    setIsSourceDefinitionLoading(true);
    setSourceDefinition(null);
    setError(null);
    try {
      const result = await getDefinition(inputText, sourceLang);
      setSourceDefinition(result);
    } catch (err: any) {
      setError(t('error_get_definition'));
    } finally {
      setIsSourceDefinitionLoading(false);
    }
  };

  const handleGetSourceExamples = async () => {
    if (!inputText.trim()) return;
    setIsSourceExamplesLoading(true);
    setSourceExamples(null);
    setError(null);
    try {
      // Note: we swap target and source to get examples in the source language
      const result = await getExamples(inputText, targetLang, sourceLang);
      setSourceExamples(result);
    } catch (err: any) {
      setError(t('error_get_examples'));
    } finally {
      setIsSourceExamplesLoading(false);
    }
  };

  const handleGetTargetDefinition = async () => {
    if (!outputText.trim()) return;
    setIsTargetDefinitionLoading(true);
    setTargetDefinition(null);
    setError(null);
    try {
      const result = await getDefinition(outputText, targetLang);
      setTargetDefinition(result);
    } catch (err: any) {
      setError(t('error_get_definition'));
    } finally {
      setIsTargetDefinitionLoading(false);
    }
  };

  const handleGetTargetExamples = async () => {
    if (!outputText.trim()) return;
    setIsTargetExamplesLoading(true);
    setTargetExamples(null);
    setError(null);
    try {
      const result = await getExamples(outputText, sourceLang, targetLang);
      setTargetExamples(result);
    } catch (err: any) {
      setError(t('error_get_examples'));
    } finally {
      setIsTargetExamplesLoading(false);
    }
  };


  const buttonStyle = { backgroundColor: settings.theme.translator.main };
  
  const languageOptions = [
    { value: 'English', label: t('english') },
    { value: 'Indonesian', label: t('indonesian') },
    { value: 'Arabic', label: t('arabic') }
  ];

  return (
    <div className="flex flex-col h-full bg-black/10 backdrop-blur-sm p-4">
        <header className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white text-shadow-md">{t('translator_title_sayangku')} {t('translator_title_translate')}</h1>
            <p className="text-blue-200">Powered by Gemini</p>
        </header>

      <div className="flex items-center justify-between mb-4">
        <LanguageSelect value={sourceLang} onChange={setSourceLang} options={languageOptions} />
        <button 
          onClick={swapLanguages} 
          style={buttonStyle}
          className="p-3 rounded-full text-white hover:opacity-80 transition-transform duration-300 hover:rotate-180"
          aria-label="Swap languages"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
        </button>
        <LanguageSelect value={targetLang} onChange={setTargetLang} options={languageOptions} />
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-y-auto pb-2">
        <div className="relative flex-shrink-0">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t('enter_text_placeholder', { lang: languageOptions.find(l => l.value === sourceLang)?.label || sourceLang })}
            className="w-full p-4 pr-24 bg-black/30 text-white rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
          />
          {inputText && (
              <div className="absolute bottom-2 right-2 flex gap-2 bg-black/30 p-1 rounded-full">
                  <button onClick={handleGetSourceDefinition} title={t('get_definition')} className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  </button>
                  <button onClick={handleGetSourceExamples} title={t('get_examples')} className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </button>
              </div>
          )}
        </div>
        
        <div className="w-full p-4 bg-black/50 text-white rounded-xl relative min-h-[120px] flex-shrink-0">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 rounded-xl">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-300"></div>
                </div>
            )}
            
            <p className="whitespace-pre-wrap">{outputText}</p>
            {outputText && !isLoading && (
                <div className="absolute bottom-2 right-2 flex gap-2 bg-black/30 p-1 rounded-full">
                    <button onClick={handleGetTargetDefinition} title={t('get_definition')} className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    </button>
                    <button onClick={handleGetTargetExamples} title={t('get_examples')} className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </button>
                    <button onClick={handleClear} title={t('clear_text')} className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            )}
        </div>
        {error && !isLoading && <p className="text-red-400 text-center py-2">{error}</p>}

        {(isSourceDefinitionLoading || sourceDefinition) &&
            <InfoBox 
                title={t('definition_for', { word: inputText.substring(0, 20) + (inputText.length > 20 ? '...' : '') })}
                content={sourceDefinition}
                isLoading={isSourceDefinitionLoading}
            />
        }
        {(isSourceExamplesLoading || sourceExamples) &&
            <InfoBox 
                title={t('examples_for', { word: inputText.substring(0, 20) + (inputText.length > 20 ? '...' : '') })}
                content={sourceExamples}
                isLoading={isSourceExamplesLoading}
            />
        }
        {(isTargetDefinitionLoading || targetDefinition) &&
            <InfoBox 
                title={t('definition_for', { word: outputText.substring(0, 20) + (outputText.length > 20 ? '...' : '') })}
                content={targetDefinition}
                isLoading={isTargetDefinitionLoading}
            />
        }
        {(isTargetExamplesLoading || targetExamples) &&
            <InfoBox 
                title={t('examples_for', { word: outputText.substring(0, 20) + (outputText.length > 20 ? '...' : '') })}
                content={targetExamples}
                isLoading={isTargetExamplesLoading}
            />
        }

      </div>
      
      <button
        onClick={handleTranslate}
        disabled={isLoading || !inputText}
        style={buttonStyle}
        className="mt-4 w-full py-4 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex-shrink-0"
      >
        {isLoading ? t('translating') : t('translate_button')}
      </button>
      <style>{`
      .text-shadow-md { text-shadow: 0 1px 3px rgba(0,0,0,0.4); }
      .custom-select {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        padding-right: 2.5rem; /* Space for the arrow */
      }
      `}</style>
    </div>
  );
};

export default TranslatorScreen;