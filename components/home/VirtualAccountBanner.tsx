import React from 'react';
const virtualImg = '/assets/enable-virtual-account.svg';;

interface VirtualAccountBannerProps {
  onClick: () => void;
}

const VirtualAccountBanner: React.FC<VirtualAccountBannerProps> = ({ onClick }) => {
  return (
    <div className="rounded-[20px] overflow-hidden cursor-pointer transition-all duration-150 hover:opacity-90 active:scale-[0.99]" onClick={onClick}>
      <img src={virtualImg} alt="Enable virtual account" className="w-full h-auto block" />
    </div>
  );
};

export default VirtualAccountBanner;
