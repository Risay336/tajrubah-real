import { useState, useEffect } from 'react';
import { PracticeSet } from '../types';

const STORAGE_KEY = 'sayangku-practice-sets';

const usePracticeData = () => {
    const [sets, setSets] = useState<PracticeSet[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const storedSets = localStorage.getItem(STORAGE_KEY);
            if (storedSets) {
                setSets(JSON.parse(storedSets));
            }
        } catch (error) {
            console.error("Failed to load practice sets from localStorage", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isLoading) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
            } catch (error) {
                console.error("Failed to save practice sets to localStorage", error);
            }
        }
    }, [sets, isLoading]);

    const addSet = (newSetData: Omit<PracticeSet, 'id'>) => {
        const newSet: PracticeSet = {
            ...newSetData,
            id: Date.now(),
        };
        setSets(prevSets => [...prevSets, newSet]);
    };

    const updateSet = (updatedSet: PracticeSet) => {
        setSets(prevSets => prevSets.map(s => (s.id === updatedSet.id ? updatedSet : s)));
    };

    const deleteSet = (id: number) => {
        setSets(prevSets => prevSets.filter(s => s.id !== id));
    };
    
    const getSetById = (id: number): PracticeSet | undefined => {
        return sets.find(s => s.id === id);
    };

    return {
        sets,
        isLoading,
        addSet,
        updateSet,
        deleteSet,
        getSetById,
    };
};

export default usePracticeData;
