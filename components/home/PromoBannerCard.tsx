const promoImg = '/assets/promo-invite-users.svg';

const PromoBannerCard: React.FC = () => {
  return (
    <div className="rounded-[20px] overflow-hidden cursor-pointer transition-all duration-150 hover:opacity-90 active:scale-[0.99]">
      <img src={promoImg} alt="Enjoy amazing benefit when you invite new users" className="w-full h-auto block" />
    </div>
  );
};

export default PromoBannerCard;
