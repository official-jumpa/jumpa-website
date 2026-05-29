import React from 'react';
const virtualImg = '/assets/enable-virtual-account.svg';;

interface VirtualAccountBannerProps {
  onClick: () => void;
}

const VirtualAccountBanner: React.FC<VirtualAccountBannerProps> = ({ onClick }) => {
  return (
    <div className="banner-card" onClick={onClick}>
      <img src={virtualImg} alt="Enable virtual account" className="banner-img" />
    </div>
  );
};

export default VirtualAccountBanner;
