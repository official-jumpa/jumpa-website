import React, { useState, useCallback, useRef } from 'react';
import NumericKeyboard from './NumericKeyboard';
import { WALLET_PIN_LENGTH } from '@/lib/wallet-pin';
const closeIcon = '/assets/icons/actions/close.svg';
const dropIcon = '/assets/icons/actions/drop.svg';
const codeIcon = '/assets/icons/actions/code.svg';

const CORRECT_PIN = '123456';

interface PinEntryScreenProps {
  onSuccess: () => void;
  onClose: () => void;
}

type PinStatus = 'idle' | 'typing' | 'error' | 'success';

const PinEntryScreen: React.FC<PinEntryScreenProps> = ({ onSuccess, onClose }) => {
  const [pin, setPin] = useState('');
  const [status, setStatus] = useState<PinStatus>('idle');
  const [shake, setShake] = useState(false);
  
  const touchStartY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (deltaY > 50) {
      onClose();
    }
  };

  const handleKeyPress = useCallback((key: string) => {
    if (status === 'success') return;

    if (key === 'backspace') {
      setPin((prev) => prev.slice(0, -1));
      setStatus('typing');
      return;
    }

    if (pin.length >= WALLET_PIN_LENGTH) return;

    const newPin = pin + key;
    setPin(newPin);
    setStatus('typing');

    if (newPin.length === WALLET_PIN_LENGTH) {
      setTimeout(() => {
        if (newPin === CORRECT_PIN) {
          setStatus('success');
          setTimeout(() => {
            onSuccess();
          }, 600);
        } else {
          setStatus('error');
          setShake(true);
          setTimeout(() => {
            setShake(false);
            setPin('');
            setStatus('idle');
          }, 800);
        }
      }, 300);
    }
  }, [pin, status, onSuccess]);

  const getDotClass = (index: number) => {
    const filled = index < pin.length;
    let baseClass = 'w-[50px] h-[50px] rounded-[9.12px] bg-[#3C3C3C] border-[1.14px] border-[#AAAAAA] flex items-center justify-center transition-all duration-200';
    if (status === 'error' && pin.length === WALLET_PIN_LENGTH) baseClass += ' !border-[#FF2524]';
    if (status === 'success') baseClass += ' !border-[#25AD3E]';
    return baseClass;
  };

  return (
    <div className="absolute inset-0 bg-black/45 backdrop-blur-[10px] z-[1000] flex justify-center" onClick={onClose}>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] max-h-[90vh] bg-[#2D2D2D] rounded-t-[36.49px] flex flex-col shadow-[0_-4px_20px_rgba(0,0,0,0.3)] animate-[slideUp_0.3s_ease-out] px-6 pb-[env(safe-area-inset-bottom,24px)] pt-0 overflow-y-auto scrollbar-none" onClick={(e) => e.stopPropagation()}>
        <div 
          className="flex justify-center py-3 cursor-grab"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <img src={dropIcon} alt="" className="w-8 h-1" />
        </div>

        <div className="flex justify-start py-2">
          <button className="w-9 h-9 rounded-full bg-[#252525] border-none flex items-center justify-center cursor-pointer hover:bg-[#2b2b2b] transition-colors duration-150" onClick={onClose} aria-label="Close" type="button">
            <img src={closeIcon} alt="" className="w-[11.72px] h-[11.72px] opacity-70" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-6 my-5">
          <h2 className="text-[15.96px] font-bold text-[#f3f3f5]">Enter your pin</h2>
          <div className={`flex gap-3 ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
            {Array.from({ length: WALLET_PIN_LENGTH }, (_, i) => (
              <div key={i} className={getDotClass(i)}>
                {i < pin.length && <img src={codeIcon} alt="" className="w-3 h-3" />}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto pb-[30px]">
          <div className="flex justify-between items-center px-[10%] pb-3 mt-10">
             <span className="font-sans text-[10px] font-normal text-[#D5D5D5] leading-[15px]">Jumpa Secure Numeric Keypad</span>
             <button className="font-sans text-[10px] font-normal text-[#6a59ce] bg-transparent border-none cursor-pointer leading-[15px] hover:opacity-80 transition-opacity" onClick={onClose} type="button">Done</button>
          </div>
          <NumericKeyboard onKeyPress={handleKeyPress} />
        </div>
      </div>
    </div>
  );
};

export default PinEntryScreen;
