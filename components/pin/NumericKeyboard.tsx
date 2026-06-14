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
    <div className="flex flex-col gap-1 items-center">
      {rows.map((row, ri) => (
        <div key={ri} className="flex justify-center gap-1">
          {row.map((key, ki) => {
            const isWide = key === '0';
            const isBackspace = key === 'backspace';

            return (
              <button
                key={ki}
                className={`w-[114px] h-[54px] rounded-lg border-none bg-[#3C3C3C] text-[#f3f3f5] text-lg font-semibold font-sans cursor-pointer flex items-center justify-center transition-all duration-100 select-none active:scale-[0.98] active:bg-[#2b2b2b] ${
                  isWide ? 'w-[232px]' : ''
                }`}
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
