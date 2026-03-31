type MarketTabsProps = {
  activeTab: 'market' | 'borrow' | 'rwa';
  onTabChange: (tab: 'borrow' | 'rwa') => void;
};

export default function MarketTabs({ activeTab, onTabChange }: MarketTabsProps) {
  return (
    <div className="market-tabs" role="tablist" aria-label="Market sections">
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'borrow'}
        className={`market-tab ${activeTab === 'borrow' ? 'is-active' : ''}`}
        onClick={() => onTabChange('borrow')}
      >
        Borrow
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'rwa'}
        className={`market-tab ${activeTab === 'rwa' ? 'is-active' : ''}`}
        onClick={() => onTabChange('rwa')}
      >
        RWA
      </button>
    </div>
  );
}