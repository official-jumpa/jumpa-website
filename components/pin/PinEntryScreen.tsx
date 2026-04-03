import React, { useState, useCallback, useRef } from 'react';
import './Pin.css';
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
    let baseClass = 'pin-dot';
    if (status === 'error' && pin.length === WALLET_PIN_LENGTH) baseClass += ' error';
    if (status === 'success') baseClass += ' success';
    if (filled) baseClass += ' filled';
    return baseClass;
  };

  return (
    <div className="pin-screen-container" onClick={onClose}>
      <div className="pin-screen" onClick={(e) => e.stopPropagation()}>
        <div 
          className="pin-drag-handle"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <img src={dropIcon} alt="" />
        </div>

        <div className="pin-header">
          <button className="pin-close" onClick={onClose} aria-label="Close" type="button">
            <img src={closeIcon} alt="" />
          </button>
        </div>

        <div className="pin-content">
          <h2 className="pin-title">Enter your pin</h2>
          <div className={`pin-dots ${shake ? 'shake' : ''}`}>
            {Array.from({ length: WALLET_PIN_LENGTH }, (_, i) => (
              <div key={i} className={getDotClass(i)}>
                {i < pin.length && <img src={codeIcon} alt="" className="pin-code-icon" />}
              </div>
            ))}
          </div>
        </div>

        <div className="num-keyboard-section">
          <div className="num-keyboard-header">
             <span className="num-keyboard-label">Jumpa Secure Numeric Keypad</span>
             <button className="num-keyboard-done" onClick={onClose} type="button">Done</button>
          </div>
          <NumericKeyboard onKeyPress={handleKeyPress} />
        </div>
      </div>
    </div>
  );
};

export default PinEntryScreen;
