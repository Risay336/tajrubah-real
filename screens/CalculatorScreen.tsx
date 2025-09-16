import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import useTranslation from '../hooks/useTranslation';

const CalculatorScreen: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
  const { settings } = useSettings();
  const { t } = useTranslation();

  const inputDigit = (digit: string) => {
    if (waitingForSecondOperand) {
      setDisplay(digit);
      setWaitingForSecondOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };
  
  const inputDecimal = () => {
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperator = (nextOperator: string) => {
    const inputValue = parseFloat(display);
    if (firstOperand === null) {
      setFirstOperand(inputValue);
    } else if (operator) {
      const result = calculate(firstOperand, inputValue, operator);
      setDisplay(String(result));
      setFirstOperand(result);
    }
    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  };

  const calculate = (first: number, second: number, op: string): number => {
    switch (op) {
      case '+': return first + second;
      case '-': return first - second;
      case '*': return first * second;
      case '/': return first / second;
      default: return second;
    }
  };

  const clear = () => {
    setDisplay('0');
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
  };
  
  const equals = () => {
    if (operator && firstOperand !== null) {
      const result = calculate(firstOperand, parseFloat(display), operator);
      setDisplay(String(result));
      setFirstOperand(null);
      setOperator(null);
      setWaitingForSecondOperand(false);
    }
  };

  const operatorStyle = { backgroundColor: settings.theme.calculator.main };

  const buttons = [
    { label: 'C', onClick: clear, className: 'bg-gray-600/50' },
    { label: '+/-', onClick: () => setDisplay(String(parseFloat(display) * -1)), className: 'bg-gray-600/50' },
    { label: '%', onClick: () => setDisplay(String(parseFloat(display) / 100)), className: 'bg-gray-600/50' },
    { label: '/', onClick: () => handleOperator('/'), style: operatorStyle },
    { label: '7', onClick: () => inputDigit('7') },
    { label: '8', onClick: () => inputDigit('8') },
    { label: '9', onClick: () => inputDigit('9') },
    { label: '*', onClick: () => handleOperator('*'), style: operatorStyle },
    { label: '4', onClick: () => inputDigit('4') },
    { label: '5', onClick: () => inputDigit('5') },
    { label: '6', onClick: () => inputDigit('6') },
    { label: '-', onClick: () => handleOperator('-'), style: operatorStyle },
    { label: '1', onClick: () => inputDigit('1') },
    { label: '2', onClick: () => inputDigit('2') },
    { label: '3', onClick: () => inputDigit('3') },
    { label: '+', onClick: () => handleOperator('+'), style: operatorStyle },
    { label: '0', onClick: () => inputDigit('0'), wide: true },
    { label: '.', onClick: inputDecimal },
    { label: '=', onClick: equals, style: operatorStyle },
  ];

  return (
    <div className="flex flex-col h-full bg-black/10 backdrop-blur-sm">
      <header className="bg-black/30 p-4 text-white text-center shadow-md">
          <h1 className="text-xl font-bold">{t('calculator_title')}</h1>
      </header>
      <div className="flex flex-col w-full max-w-sm mx-auto p-4 justify-end flex-grow">
        <div className="bg-black/30 rounded-t-xl p-6 text-right text-white text-6xl font-light break-all">{display}</div>
        <div className="grid grid-cols-4 gap-px bg-black/30 rounded-b-xl overflow-hidden">
          {buttons.map((btn, i) => (
            <button
              key={i}
              onClick={btn.onClick}
              style={btn.style}
              className={`
                ${btn.wide ? 'col-span-2' : ''}
                ${btn.className || 'bg-gray-700/50'}
                text-white text-3xl p-6 hover:bg-white/20 transition-colors duration-200
              `}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalculatorScreen;