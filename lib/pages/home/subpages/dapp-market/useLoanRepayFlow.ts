import { useState } from 'react';
import type { PinStatus } from './borrow-flow.types';
import { WALLET_PIN_LENGTH } from '@/lib/wallet-pin';

type LoanRepayStep = 'detail' | 'amount' | 'review' | 'pin' | 'processing' | 'success';
type LoanMode = 'borrow' | 'repay';

const DEMO_PIN = '123456';

export function useLoanRepayFlow() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<LoanRepayStep>('detail');
  const [mode, setMode] = useState<LoanMode>('repay');
  const [repayAmount, setRepayAmount] = useState('200.00');
  const [pin, setPin] = useState('');
  const [pinStatus, setPinStatus] = useState<PinStatus>('idle');

  const openLoan = () => {
    setOpen(true);
    setStep('detail');
    setMode('repay');
    setRepayAmount('200.00');
    setPin('');
    setPinStatus('idle');
  };

  const closeLoan = () => {
    setOpen(false);
    setStep('detail');
    setPin('');
    setPinStatus('idle');
  };

  const goToAmount = () => {
    setStep('amount');
  };

  const goToReview = () => {
    if (!Number(repayAmount) || Number(repayAmount) <= 0) return;
    setStep('review');
  };

  const goToPin = () => {
    setStep('pin');
    setPin('');
    setPinStatus('idle');
  };

  const goToSuccess = () => {
    setStep('processing');
    window.setTimeout(() => setStep('success'), 1200);
  };

  const onPinKeyPress = (key: string) => {
    if (pinStatus === 'success') return;

    if (key === 'backspace') {
      const nextPin = pin.slice(0, -1);
      setPin(nextPin);
      setPinStatus(nextPin.length ? 'typing' : 'idle');
      return;
    }

    if (pin.length >= WALLET_PIN_LENGTH) return;

    const nextPin = `${pin}${key}`;
    setPin(nextPin);

    if (nextPin.length < WALLET_PIN_LENGTH) {
      setPinStatus('typing');
      return;
    }

    if (nextPin === DEMO_PIN) {
      setPinStatus('success');
      window.setTimeout(goToSuccess, 450);
      return;
    }

    setPinStatus('error');
    window.setTimeout(() => {
      setPin('');
      setPinStatus('idle');
    }, 700);
  };

  return {
    open,
    step,
    mode,
    repayAmount,
    pin,
    pinStatus,
    setMode,
    setRepayAmount,
    openLoan,
    closeLoan,
    goToAmount,
    goToReview,
    goToPin,
    onPinKeyPress,
  };
}