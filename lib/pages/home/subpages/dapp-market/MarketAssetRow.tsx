const graphDown = '/assets/icons/actions/graph-down.svg';;
const graphUp = '/assets/icons/actions/graph-up.svg';;

type MarketAssetRowProps = {
  id?: string;
  symbol: string;
  subtitle: string;
  iconSrc: string;
  price: string;
  change: string;
  direction: 'up' | 'down';
  active?: boolean;
  onSelect?: () => void;
};

export default function MarketAssetRow({
  symbol,
  subtitle,
  iconSrc,
  price,
  change,
  direction,
  active = false,
  onSelect,
}: MarketAssetRowProps) {
  return (
    <button className={`market-asset-row ${active ? 'is-active' : ''}`} type="button" onClick={onSelect}>
      <div className="market-asset-main">
        <img src={iconSrc} alt={symbol} className="market-asset-icon" width="37" height="37" />
        <div className="market-asset-copy">
          <span className="market-asset-symbol">{symbol}</span>
          <span className="market-asset-name">{subtitle}</span>
        </div>
      </div>

      <div className="market-asset-meta">
        <span className="market-asset-price">{price}</span>
        <span className={`market-asset-change market-asset-change-${direction}`}>
          <img src={direction === 'up' ? graphUp : graphDown} alt="" width="16" height="16" />
          {change}
        </span>
      </div>
    </button>
  );
}