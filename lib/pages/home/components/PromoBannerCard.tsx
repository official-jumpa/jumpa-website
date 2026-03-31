import React from 'react';
const promoImg = '/assets/promo-invite-users.svg';

const PromoBannerCard: React.FC = () => {
  return (
    <div className="banner-card">
      <img src={promoImg} alt="Enjoy amazing benefit when you invite new users" className="banner-img" />
    </div>
  );
};

export default PromoBannerCard;
