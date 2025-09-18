import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import useTranslation from '../hooks/useTranslation';

const StandardCalculator: React.FC = () => {
    const [display, setDisplay] = useState('0');
    const [firstOperand, setFirstOperand] = useState<number | null>(null);
    const [operator, setOperator] = useState<string | null>(null);
    const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
    const { settings } = useSettings();

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
    );
};

const ScientificCalculator: React.FC = () => {
    const [expression, setExpression] = useState('');
    const [display, setDisplay] = useState('0');
    const { settings } = useSettings();

    const handleInput = (value: string) => {
        setExpression(prev => prev + value);
        setDisplay(prev => (prev === '0' && !'()*/+-^.'.includes(value)) ? value : prev + value);
    };
    
    const handleFunction = (func: string, exprFunc: string) => {
        setExpression(prev => prev + exprFunc);
        setDisplay(prev => (prev === '0' ? '' : prev) + `${func}(`);
    };

    const clear = () => {
        setExpression('');
        setDisplay('0');
    };
    
    const backspace = () => {
        setExpression(prev => prev.slice(0, -1));
        setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    };

    const calculate = () => {
        if (!expression) return;
        try {
            let evalExpr = expression
                .replace(/π/g, 'Math.PI')
                .replace(/e/g, 'Math.E')
                .replace(/√/g, 'Math.sqrt')
                .replace(/sin/g, 'Math.sin')
                .replace(/cos/g, 'Math.cos')
                .replace(/tan/g, 'Math.tan')
                .replace(/log/g, 'Math.log10')
                .replace(/ln/g, 'Math.log')
                .replace(/\^/g, '**');

            if (evalExpr.split('(').length !== evalExpr.split(')').length) {
                throw new Error("Mismatched parentheses");
            }

            // Using new Function for safer evaluation than eval()
            const result = new Function('return ' + evalExpr)();
            
            if (typeof result !== 'number' || !isFinite(result)) {
                throw new Error("Invalid result");
            }

            const finalResult = String(Number(result.toPrecision(12)));
            setDisplay(finalResult);
            setExpression(finalResult);
        } catch (error) {
            console.error("Calculation Error:", error);
            setDisplay('Error');
            setExpression('');
        }
    };
    
    const operatorStyle = { backgroundColor: settings.theme.calculator.main };
    const funcStyle = 'bg-gray-600/50';

    const buttons = [
         { label: 'sin', onClick: () => handleFunction('sin', 'sin('), className: funcStyle },
         { label: 'cos', onClick: () => handleFunction('cos', 'cos('), className: funcStyle },
         { label: 'tan', onClick: () => handleFunction('tan', 'tan('), className: funcStyle },
         { label: 'log', onClick: () => handleFunction('log', 'log('), className: funcStyle },
         { label: 'ln', onClick: () => handleFunction('ln', 'ln('), className: funcStyle },
        
         { label: '(', onClick: () => handleInput('('), className: funcStyle },
         { label: ')', onClick: () => handleInput(')'), className: funcStyle },
         { label: '√', onClick: () => handleFunction('√', '√('), className: funcStyle },
         { label: 'x^y', onClick: () => handleInput('^'), className: funcStyle },
         { label: 'π', onClick: () => handleInput('π'), className: funcStyle },
        
         { label: '7', onClick: () => handleInput('7') },
         { label: '8', onClick: () => handleInput('8') },
         { label: '9', onClick: () => handleInput('9') },
         { label: 'DEL', onClick: backspace, className: 'bg-red-600/50' },
         { label: 'AC', onClick: clear, className: 'bg-red-600/50' },

         { label: '4', onClick: () => handleInput('4') },
         { label: '5', onClick: () => handleInput('5') },
         { label: '6', onClick: () => handleInput('6') },
         { label: '*', onClick: () => handleInput('*'), style: operatorStyle },
         { label: '/', onClick: () => handleInput('/'), style: operatorStyle },

         { label: '1', onClick: () => handleInput('1') },
         { label: '2', onClick: () => handleInput('2') },
         { label: '3', onClick: () => handleInput('3') },
         { label: '+', onClick: () => handleInput('+'), style: operatorStyle },
         { label: '-', onClick: () => handleInput('-'), style: operatorStyle },

         { label: '0', onClick: () => handleInput('0'), wide: true },
         { label: '.', onClick: () => handleInput('.') },
         { label: 'e', onClick: () => handleInput('e'), className: funcStyle },
         { label: '=', onClick: calculate, style: operatorStyle },
    ];

    return (
        <div className="flex flex-col w-full max-w-sm mx-auto p-4 justify-end flex-grow">
            <div className="bg-black/30 rounded-t-xl p-6 text-right text-white">
                <div className="text-gray-400 text-2xl h-8 overflow-x-auto text-right mb-1 break-all">{expression || ' '}</div>
                <div className="text-5xl font-light break-all h-14">{display}</div>
            </div>
            <div className="grid grid-cols-5 gap-px bg-black/30 rounded-b-xl overflow-hidden">
                {buttons.map((btn, i) => (
                    <button
                        key={i}
                        onClick={btn.onClick}
                        style={btn.style}
                        className={`
                            ${btn.wide ? 'col-span-2' : ''}
                            ${btn.className || 'bg-gray-700/50'}
                            text-white text-xl p-5 hover:bg-white/20 transition-colors duration-200
                        `}
                    >
                        {btn.label}
                    </button>
                ))}
            </div>
        </div>
    );
};


const CalculatorScreen: React.FC = () => {
  const { settings } = useSettings();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full bg-black/10 backdrop-blur-sm">
      <header className="bg-black/30 p-4 text-white text-center shadow-md">
          <h1 className="text-xl font-bold">{t('calculator_title')}</h1>
      </header>
      {settings.scientificCalculator ? <ScientificCalculator /> : <StandardCalculator />}
    </div>
  );
};

export default CalculatorScreen;