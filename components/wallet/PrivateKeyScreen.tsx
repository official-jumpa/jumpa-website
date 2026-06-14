import React, { useState } from 'react';
import { type Wallet } from '../../data/wallets';
const backIcon = '/assets/icons/actions/back.svg';
const copyIcon = '/assets/icons/actions/copy.svg';
const eyeOpen = '/assets/icons/actions/eye-open.svg';
const eyeClosed = '/assets/icons/actions/eye-closed.svg';


interface PrivateKeyScreenProps {
  wallet: Wallet | null;
  onDone: () => void;
}

const PrivateKeyScreen: React.FC<PrivateKeyScreenProps> = ({ wallet, onDone }) => {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!wallet) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(wallet.privateKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* silently fail */
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#171717] pt-[60px] px-6 pb-0">
      <div className="flex items-center justify-between py-4 px-0">
        <button className="w-9 h-9 rounded-full bg-[#252525] border-none flex items-center justify-center cursor-pointer transition-colors duration-150 ease-out hover:bg-[#2b2b2b]" onClick={onDone} aria-label="Back" type="button">
          <img src={backIcon} alt="" width="20" height="20" className="opacity-70" />
        </button>
        <h2 className="text-[17px] font-bold text-[#f3f3f5]">Send Money</h2>
        <div style={{ width: 36 }} />
      </div>

      <div className="flex-1 flex flex-col gap-5 pt-5">
        <p className="text-[13px] text-[#b7b7be] leading-[1.5]">
          Your private key can be used to access all of your funds. Do not share it with anyone
        </p>

        <div className="flex items-start gap-2 bg-[#1f1f1f] rounded-[14px] p-4 relative transition-all duration-250 ease-in-out">
          <span className={`flex-1 text-[13px] text-[#b7b7be] font-mono break-all leading-[1.5] transition-all duration-250 ${revealed ? 'blur-none' : 'blur-md select-none'}`}>
            {wallet.privateKey}
          </span>
          <button
            className="bg-transparent border-none cursor-pointer p-1 flex items-center shrink-0"
            onClick={() => setRevealed(!revealed)}
            aria-label={revealed ? 'Hide key' : 'Reveal key'}
            type="button"
          >
            <img
              src={revealed ? eyeOpen : eyeClosed}
              alt=""
              width="20"
              height="20"
              className="opacity-60 hover:opacity-100 transition-opacity"
            />
          </button>
        </div>

        <button className="flex items-center justify-center gap-2 bg-transparent border-none cursor-pointer font-sans text-[13px] text-[#b7b7be] py-2 px-0 transition-colors duration-150 hover:text-[#f3f3f5]" onClick={handleCopy} type="button">
          <img src={copyIcon} alt="" width="16" height="16" className="opacity-60" />
          <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
        </button>
      </div>

      <button className="w-full p-4 bg-[#7c5cfc] border-none rounded-[14px] text-white text-[15px] font-semibold cursor-pointer font-sans mb-8 transition-all duration-150 hover:bg-[#9a84ff] active:scale-[0.98]" onClick={onDone} type="button">
        Done
      </button>
    </div>
  );
};

export default PrivateKeyScreen;
