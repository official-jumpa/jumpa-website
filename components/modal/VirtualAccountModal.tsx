import React from 'react';
const closeIcon = '/assets/icons/actions/close.svg';
const virtualGraphic = '/assets/images/illustrations/virtual-account-graphic.svg';

interface VirtualAccountModalProps {
  onClose: () => void;
}

const VirtualAccountModal: React.FC<VirtualAccountModalProps> = ({ onClose }) => {
  return (
    <div className="absolute top-1/2 left-1/2 w-[90%] max-w-[342px] min-h-[274px] bg-[#0f0f10] rounded-[32px] z-[60] animate-[modalScaleIn_0.3s_cubic-bezier(0.34,1.56,0.64,1)_forwards] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
      <button className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#252525] border-none flex items-center justify-center cursor-pointer z-10 transition-colors duration-150 ease-out hover:bg-[#2b2b2b]" onClick={onClose} aria-label="Close" type="button">
        <img src={closeIcon} alt="" width="11.72" height="11.72" className="opacity-70" />
      </button>

      <div className="flex flex-col items-center p-6 px-5 flex-1 justify-center">
        <div className="w-[60px] h-[58px] mt-2 mb-5">
          <img src={virtualGraphic} alt="Virtual Account" className="w-full h-full object-contain" />
        </div>
        <p className="w-full max-w-[300px] min-h-[54px] bg-[#f0eefa] border border-dashed border-[#c4b8f0] rounded-[8px] p-2.5 font-sans text-xs font-normal text-[#6a59ce] leading-[145%] tracking-[-0.02em] text-left mb-5">
          Get a virtual account to send, store and receive money on your Jumpa wallet.
        </p>
        <button className="h-[27px] px-4 flex items-center justify-center bg-[#7c5cfc] border-none rounded-[10px] text-white text-[11px] font-semibold cursor-pointer transition-all duration-150 ease-out hover:bg-[#9a84ff] active:scale-[0.98]" type="button">
          Continue
        </button>
      </div>
    </div>
  );
};

export default VirtualAccountModal;
