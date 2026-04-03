import { useMemo, useRef, useState } from 'react';
import type { AddressStatus, BorrowAsset, BorrowFlowStep, PinStatus } from './borrow-flow.types';
import { WALLET_PIN_LENGTH } from '@/lib/wallet-pin';

const DEMO_PIN = '123456';

export function useBorrowFlow() {
  const [step, setStep] = useState<BorrowFlowStep>('asset-selection');
  const [selectedAsset, setSelectedAsset] = useState<BorrowAsset | null>(null);
  const [addressInput, setAddressInput] = useState('');
  const [addressStatus, setAddressStatus] = useState<AddressStatus>('idle');
  const [resolvedAddress, setResolvedAddress] = useState('');
  const [recipientLabel, setRecipientLabel] = useState('New address');
  const [amount, setAmount] = useState('1.00');
  const [pin, setPin] = useState('');
  const [pinStatus, setPinStatus] = useState<PinStatus>('idle');
  const pinTimerRef = useRef<number | null>(null);
  const successTimerRef = useRef<number | null>(null);

  const hasOpenFlow = step !== 'asset-selection';

  const hasMinimumCollateral = useMemo(() => {
    if (!selectedAsset) return false;
    return selectedAsset.availableCollateral >= selectedAsset.minimumCollateral;
  }, [selectedAsset]);

  const openAsset = (asset: BorrowAsset) => {
    setSelectedAsset(asset);
    setStep('address-entry');
    setAddressInput('');
    setAddressStatus('idle');
    setResolvedAddress('');
    setRecipientLabel('New address');
    setAmount('1.00');
    setPin('');
    setPinStatus('idle');
  };

  const closeFlow = () => {
    setStep('asset-selection');
    setAddressInput('');
    setAddressStatus('idle');
    setResolvedAddress('');
    setRecipientLabel('New address');
    setPin('');
    setPinStatus('idle');
  };

  const handlePasteDemo = () => {
    setAddressInput('7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV');
    setAddressStatus('idle');
  };

  const validateAddress = (value: string) => {
    const trimmed = value.trim();
    const looksLikeTag = /^\.[a-z0-9_-]{3,}$/i.test(trimmed);
    const looksLikeWallet = /^[a-zA-Z0-9]{12,}$/i.test(trimmed);
    return looksLikeTag || looksLikeWallet;
  };

  const confirmAddress = () => {
    if (!validateAddress(addressInput)) {
      setAddressStatus('invalid');
      setResolvedAddress('');
      setRecipientLabel('Invalid address');
      return;
    }

    setAddressStatus('valid');
    setResolvedAddress(addressInput.trim());
    setRecipientLabel('New address');
  };

  const goToReview = () => {
    if (addressStatus !== 'valid' || !selectedAsset || !hasMinimumCollateral) return;
    setStep('review');
  };

  const goToPin = () => {
    if (!selectedAsset) return;
    setStep('pin');
    setPin('');
    setPinStatus('idle');
  };

  const applyPinResult = (nextPin: string) => {
    if (nextPin.length < WALLET_PIN_LENGTH) {
      setPinStatus(nextPin.length === 0 ? 'idle' : 'typing');
      return;
    }

    if (nextPin === DEMO_PIN) {
      setPinStatus('success');
      if (successTimerRef.current) window.clearTimeout(successTimerRef.current);
      successTimerRef.current = window.setTimeout(() => {
        setStep('processing');
        window.setTimeout(() => {
          setStep('success');
        }, 1200);
      }, 450);
      return;
    }

    setPinStatus('error');
    if (pinTimerRef.current) window.clearTimeout(pinTimerRef.current);
    pinTimerRef.current = window.setTimeout(() => {
      setPin('');
      setPinStatus('idle');
    }, 700);
  };

  const onPinKeyPress = (key: string) => {
    if (pinStatus === 'success') return;

    if (key === 'backspace') {
      const nextPin = pin.slice(0, -1);
      setPin(nextPin);
      applyPinResult(nextPin);
      return;
    }

    if (pin.length >= WALLET_PIN_LENGTH) return;

    const nextPin = `${pin}${key}`;
    setPin(nextPin);
    applyPinResult(nextPin);
  };

  const resetToMarket = () => {
    closeFlow();
    setSelectedAsset(null);
  };

  return {
    step,
    selectedAsset,
    hasOpenFlow,
    hasMinimumCollateral,
    addressInput,
    addressStatus,
    resolvedAddress,
    recipientLabel,
    amount,
    pin,
    pinStatus,
    setAddressInput,
    setAmount,
    openAsset,
    closeFlow,
    handlePasteDemo,
    confirmAddress,
    goToReview,
    goToPin,
    onPinKeyPress,
    resetToMarket,
  };
}