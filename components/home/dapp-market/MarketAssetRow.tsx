const graphDown = '/assets/icons/actions/graph-down.svg';
const graphUp = '/assets/icons/actions/graph-up.svg';

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
  const isUp = direction === 'up';

  return (
    <button 
      className={`w-full flex items-center justify-between gap-4 py-3 border-b border-[#2d2d2d] last:border-b-0 bg-transparent text-white cursor-pointer transition-all duration-150 text-left hover:opacity-80 active:opacity-75 ${
        active ? 'opacity-100' : ''
      }`} 
      type="button" 
      onClick={onSelect}
    >
      <div className="min-w-0 flex items-center gap-3">
        <img src={iconSrc} alt={symbol} className="w-[37px] h-[37px] rounded-full shrink-0 object-cover" width="37" height="37" />
        <div className="min-w-0 flex flex-col gap-0.5">
          <span className={`text-white text-sm font-bold tracking-[-0.02em] leading-[1.45] ${active ? 'text-[#7c5cfc]' : ''}`}>{symbol}</span>
          <span className="text-[#8b8b93] text-xs font-normal leading-[1.45]">{subtitle}</span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1">
        <span className="text-white text-sm font-bold tracking-[-0.02em] leading-[1.45]">{price}</span>
        <span className={`inline-flex items-center gap-1 text-xs font-normal ${isUp ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
          <img src={isUp ? graphUp : graphDown} alt="" width="16" height="16" />
          {change}
        </span>
      </div>
    </button>
  );
}