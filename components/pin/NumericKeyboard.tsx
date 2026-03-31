import React from 'react';

interface NumericKeyboardProps {
  onKeyPress: (key: string) => void;
}

const NumericKeyboard: React.FC<NumericKeyboardProps> = ({ onKeyPress }) => {
  const rows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['0', 'backspace'],
  ];

  return (
    <div className="num-keyboard">
      {rows.map((row, ri) => (
        <div key={ri} className="num-row">
          {row.map((key, ki) => {
            const isWide = key === '0';
            const isBackspace = key === 'backspace';

            return (
              <button
                key={ki}
                className={`num-key ${isWide ? 'num-key-wide' : ''}`}
                onClick={() => onKeyPress(key)}
                aria-label={isBackspace ? 'Backspace' : key}
                type="button"
              >
                {isBackspace ? 'x' : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default NumericKeyboard;
