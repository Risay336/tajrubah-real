import { useState, useEffect } from 'react';
import { Language } from '../types';

const useClock = (locale: Language) => {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setDate(new Date());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  // Use the provided locale for formatting.
  // The browser's Intl API will handle the translation and numeral system.
  const time = date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  const day = date.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' });

  return { time, day };
};

export default useClock;