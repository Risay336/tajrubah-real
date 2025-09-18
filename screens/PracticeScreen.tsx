import React, { useState, useEffect, useMemo } from 'react';
import { PracticeSet, PracticeItem } from '../types';
import useTranslation from '../hooks/useTranslation';
import usePracticeData from '../hooks/usePracticeData';
import { useSettings } from '../contexts/SettingsContext';

type View = 'list' | 'edit' | 'practice';

const LanguageSelect: React.FC<{ value: string; onChange: (value: string) => void; id: string; label: string;}> = ({ value, onChange, id, label }) => {
    const { t } = useTranslation();
    const languageOptions = [
        { value: 'en', label: t('english') },
        { value: 'id', label: t('indonesian') },
        { value: 'ar', label: t('arabic') },
        { value: 'other', label: 'Other' },
    ];
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-blue-200">{label}</label>
            <select
                id={id}
                value={value}
                onChange={e => onChange(e.target.value)}
                className="mt-1 block w-full bg-white/10 p-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
                {languageOptions.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-gray-700">{opt.label}</option>
                ))}
            </select>
        </div>
    );
};

// Main Component
const PracticeScreen: React.FC = () => {
    const [view, setView] = useState<View>('list');
    const [currentSetId, setCurrentSetId] = useState<number | null>(null);
    const { sets, addSet, updateSet, deleteSet } = usePracticeData();
    const { t } = useTranslation();

    const currentSet = useMemo(() => sets.find(s => s.id === currentSetId) || null, [currentSetId, sets]);

    const handleEdit = (id: number) => {
        setCurrentSetId(id);
        setView('edit');
    };

    const handlePractice = (id: number) => {
        setCurrentSetId(id);
        setView('practice');
    };
    
    const handleCreateNew = () => {
        setCurrentSetId(null);
        setView('edit');
    }

    const handleBackToList = () => {
        setView('list');
        setCurrentSetId(null);
    };

    const handleSaveSet = (set: PracticeSet) => {
        if (currentSetId) {
            updateSet(set);
        } else {
            addSet(set);
        }
        handleBackToList();
    };

    const handleDeleteSet = (id: number) => {
        if (window.confirm(t('delete_set_confirm'))) {
            deleteSet(id);
        }
    };
    

    const renderView = () => {
        switch (view) {
            case 'edit':
                return <EditSetView set={currentSet} onSave={handleSaveSet} onBack={handleBackToList} />;
            case 'practice':
                return <PracticeSessionView set={currentSet} onBack={handleBackToList} />;
            case 'list':
            default:
                return <SetListView sets={sets} onEdit={handleEdit} onPractice={handlePractice} onDelete={handleDeleteSet} onCreate={handleCreateNew} />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-black/10 backdrop-blur-sm text-white">
            {renderView()}
        </div>
    );
};


// List View Component
const SetListView: React.FC<{
    sets: PracticeSet[];
    onEdit: (id: number) => void;
    onPractice: (id: number) => void;
    onDelete: (id: number) => void;
    onCreate: () => void;
}> = ({ sets, onEdit, onPractice, onDelete, onCreate }) => {
    const { t } = useTranslation();
    const { settings } = useSettings();

    return (
        <>
            <header className="bg-black/30 p-4 text-center shadow-md">
                <h1 className="text-xl font-bold">{t('practice_hub_title')}</h1>
            </header>
            <div className="flex-grow p-4 overflow-y-auto">
                {sets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                        <p className="text-lg">{t('no_sets_message')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sets.map(set => (
                            <div key={set.id} className="bg-white/5 p-4 rounded-lg flex flex-col justify-between">
                                <div>
                                    <h2 className="text-lg font-bold">{set.title}</h2>
                                    <p className="text-sm text-gray-300">{set.description}</p>
                                    <p className="text-xs text-blue-300 mt-1">{set.items.length} cards</p>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button onClick={() => onPractice(set.id)} className="flex-1 py-2 rounded-md font-semibold" style={{ backgroundColor: settings.theme.home.main }}>{t('practice')}</button>
                                    <button onClick={() => onEdit(set.id)} className="py-2 px-4 bg-white/10 rounded-md">{t('edit_set')}</button>
                                    <button onClick={() => onDelete(set.id)} className="py-2 px-4 bg-red-600/50 rounded-md">{t('delete')}</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <button
                onClick={onCreate}
                className="absolute bottom-24 right-6 w-16 h-16 rounded-full text-white flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform"
                style={{ backgroundColor: settings.theme.home.main }}
                aria-label={t('create_new_set')}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
        </>
    );
};


// Edit View Component
const EditSetView: React.FC<{ set: PracticeSet | null; onSave: (set: PracticeSet) => void; onBack: () => void; }> = ({ set, onSave, onBack }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<Omit<PracticeSet, 'id'>>({
        title: '', description: '', sourceLang: 'en', targetLang: 'id', items: []
    });

    useEffect(() => {
        if (set) {
            setFormData({ ...set });
        }
    }, [set]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCardChange = (index: number, field: 'front' | 'back', value: string) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addCard = () => {
        setFormData(prev => ({ ...prev, items: [...prev.items, { id: Date.now(), front: '', back: '' }] }));
    };
    
    const removeCard = (id: number) => {
        setFormData(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalSet: PracticeSet = { id: set?.id || Date.now(), ...formData };
        onSave(finalSet);
    };

    return (
        <>
            <header className="bg-black/30 p-4 flex items-center shadow-md">
                <button onClick={onBack} className="p-2 -m-2 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h1 className="text-xl font-bold">{set ? t('edit_set') : t('create_new_set')}</h1>
            </header>
            <form onSubmit={handleSubmit} className="flex-grow p-4 overflow-y-auto space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-blue-200">{t('set_title')}</label>
                    <input type="text" name="title" id="title" value={formData.title} onChange={handleInputChange} placeholder={t('set_title_placeholder')} required className="form-input" />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-blue-200">{t('set_description')}</label>
                    <textarea name="description" id="description" value={formData.description} onChange={handleInputChange} placeholder={t('set_description_placeholder')} className="form-input min-h-[60px]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <LanguageSelect id="sourceLang" label={t('front_language')} value={formData.sourceLang} onChange={val => setFormData(p => ({ ...p, sourceLang: val }))} />
                    <LanguageSelect id="targetLang" label={t('back_language')} value={formData.targetLang} onChange={val => setFormData(p => ({ ...p, targetLang: val }))} />
                </div>
                <div>
                    <h3 className="text-lg font-bold mt-4 mb-2">{t('cards')}</h3>
                    <div className="space-y-3">
                        {formData.items.map((item, index) => (
                             <div key={item.id} className="bg-white/5 p-3 rounded-lg flex items-center gap-2">
                                <div className="flex-grow grid grid-cols-2 gap-2">
                                    <input type="text" value={item.front} onChange={e => handleCardChange(index, 'front', e.target.value)} placeholder={t('front')} className="form-input-sm" />
                                    <input type="text" value={item.back} onChange={e => handleCardChange(index, 'back', e.target.value)} placeholder={t('back')} className="form-input-sm" />
                                </div>
                                <button type="button" onClick={() => removeCard(item.id)} className="p-2 text-red-400 hover:text-red-300"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addCard} className="w-full mt-3 py-2 bg-white/10 rounded-md hover:bg-white/20">{t('add_card')}</button>
                </div>
                <button type="submit" className="w-full py-3 bg-blue-600 rounded-lg font-semibold sticky bottom-0">{t('save_set')}</button>
            </form>
            <style>{`
                .form-input {
                    display: block;
                    width: 100%;
                    background-color: rgba(255,255,255,0.1);
                    padding: 0.75rem;
                    border-radius: 0.375rem;
                    color: white;
                }
                .form-input-sm {
                     background-color: rgba(0,0,0,0.2);
                     padding: 0.5rem;
                     border-radius: 0.375rem;
                     color: white;
                     width: 100%;
                }
                .form-input:focus, .form-input-sm:focus {
                    outline: none;
                    box-shadow: 0 0 0 2px #60a5fa; /* ring-blue-400 */
                }
            `}</style>
        </>
    );
};


// Practice Session Component
const PracticeSessionView: React.FC<{ set: PracticeSet | null; onBack: () => void; }> = ({ set, onBack }) => {
    const { t } = useTranslation();
    const [practiceDeck, setPracticeDeck] = useState<PracticeItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [correctCount, setCorrectCount] =useState(0);
    const [sessionFinished, setSessionFinished] = useState(false);

    useEffect(() => {
        if (set?.items) {
           startSession();
        }
    }, [set]);

    const startSession = () => {
        if (!set || set.items.length === 0) return;
        const shuffled = [...set.items].sort(() => Math.random() - 0.5);
        setPracticeDeck(shuffled);
        setCurrentIndex(0);
        setIsFlipped(false);
        setCorrectCount(0);
        setSessionFinished(false);
    };

    const handleAnswer = (knewIt: boolean) => {
        if (knewIt) {
            setCorrectCount(prev => prev + 1);
        } else {
            // Move card to the end of the deck to practice again
            setPracticeDeck(prev => [...prev, practiceDeck[currentIndex]]);
        }

        if (currentIndex + 1 >= practiceDeck.length) {
            setSessionFinished(true);
        } else {
            setCurrentIndex(prev => prev + 1);
            setIsFlipped(false);
        }
    };

    if (!set) return <div onClick={onBack}>{t('return_to_sets')}</div>;
    
    if (sessionFinished) {
        return (
             <div className="flex flex-col items-center justify-center h-full text-center p-4">
                 <h2 className="text-3xl font-bold">{t('session_complete')}</h2>
                 <p className="text-xl mt-2">{t('session_summary', { correct: correctCount, total: set.items.length })}</p>
                 <div className="flex gap-4 mt-8">
                     <button onClick={startSession} className="px-6 py-3 bg-blue-600 rounded-lg font-semibold">{t('practice_again')}</button>
                     <button onClick={onBack} className="px-6 py-3 bg-white/10 rounded-lg">{t('return_to_sets')}</button>
                 </div>
            </div>
        )
    }

    const currentCard = practiceDeck[currentIndex];
    if (!currentCard) return <div className="p-4">{t('no_sets_message')}</div>;

    const progress = (currentIndex / practiceDeck.length) * 100;

    return (
        <div className="flex flex-col h-full p-4">
            <header className="flex items-center gap-4 mb-4">
                <button onClick={onBack} className="p-2 -m-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="w-full bg-white/10 rounded-full h-2.5">
                    <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                <span className="text-sm font-mono">{currentIndex}/{practiceDeck.length}</span>
            </header>
            
            <div className="flex-grow flex flex-col items-center justify-center" style={{ perspective: '1000px' }}>
                <div 
                    className="relative w-full max-w-md h-64 cursor-pointer transition-transform duration-500"
                    style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                    onClick={() => setIsFlipped(!isFlipped)}
                >
                    <div className="flashcard-face absolute inset-0 bg-gray-700 rounded-xl flex flex-col items-center justify-center p-4 text-center">
                        <span className="text-xs text-blue-200">{set.sourceLang}</span>
                        <p className="text-3xl font-bold">{currentCard.front}</p>
                        <span className="absolute bottom-4 text-xs text-gray-400">{t('tap_to_flip')}</span>
                    </div>
                     <div className="flashcard-face absolute inset-0 bg-blue-800 rounded-xl flex flex-col items-center justify-center p-4 text-center" style={{ transform: 'rotateY(180deg)'}}>
                        <span className="text-xs text-blue-200">{set.targetLang}</span>
                        <p className="text-3xl font-bold">{currentCard.back}</p>
                    </div>
                </div>
            </div>
            
            {isFlipped && (
                <div className="flex gap-4 p-4 justify-center animate-fade-in-up">
                    <button onClick={() => handleAnswer(false)} className="w-1/2 max-w-[200px] py-4 bg-red-600/80 rounded-lg font-bold text-lg">{t('i_didnt_know')}</button>
                    <button onClick={() => handleAnswer(true)} className="w-1/2 max-w-[200px] py-4 bg-green-600/80 rounded-lg font-bold text-lg">{t('i_knew_this')}</button>
                </div>
            )}
             <style>{`
                .flashcard-face {
                    backface-visibility: hidden;
                    -webkit-backface-visibility: hidden;
                }
                 @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};


export default PracticeScreen;
