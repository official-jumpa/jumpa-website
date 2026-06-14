type MarketTabsProps = {
  activeTab: 'market' | 'borrow' | 'rwa';
  onTabChange: (tab: 'market' | 'borrow' | 'rwa') => void;
};

export default function MarketTabs({ activeTab, onTabChange }: MarketTabsProps) {
  const isBorrowActive = activeTab === 'borrow' || activeTab === 'market';
  const isRwaActive = activeTab === 'rwa';

  return (
    <div className="flex items-center gap-2 mb-6" role="tablist" aria-label="Market sections">
      <button
        type="button"
        role="tab"
        aria-selected={isBorrowActive}
        className={`min-w-[88px] h-[30px] px-3.5 rounded-full text-xs font-semibold leading-none cursor-pointer transition-all duration-150 border flex items-center justify-center ${
          isBorrowActive
            ? 'border-white/5 bg-[#252525] text-white'
            : 'border-transparent bg-transparent text-[#8b8b93] hover:bg-[#1a1a1a] hover:text-white'
        }`}
        onClick={() => onTabChange('market')}
      >
        Borrow
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={isRwaActive}
        className={`min-w-[88px] h-[30px] px-3.5 rounded-full text-xs font-semibold leading-none cursor-pointer transition-all duration-150 border flex items-center justify-center ${
          isRwaActive
            ? 'border-white/5 bg-[#252525] text-white'
            : 'border-transparent bg-transparent text-[#8b8b93] hover:bg-[#1a1a1a] hover:text-white'
        }`}
        onClick={() => onTabChange('rwa')}
      >
        RWA
      </button>
    </div>
  );
}