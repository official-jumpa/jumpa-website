const WATCHLIST_ICONS = [
  { src: '/coins/eth.svg', alt: 'ETH', offset: 0 },
  { src: '/coins/btc.svg', alt: 'BTC', offset: 1 },
  { src: '/coins/sol.svg', alt: 'SOL', offset: 2 },
];

export default function WatchlistPromptCard() {
  return (
    <div className="watchlist-card">
      <div className="watchlist-card-copy">
        <div className="watchlist-token-stack" aria-hidden="true">
          {WATCHLIST_ICONS.map(({ src, alt, offset }) => (
            <img
              key={alt}
              src={src}
              alt={alt}
              width="30"
              height="30"
              className="watchlist-token-chip"
              style={{ '--watchlist-index': offset } as React.CSSProperties}
            />
          ))}
        </div>
        <p className="watchlist-card-title">Add tokens to watchlist</p>
      </div>
      <button className="watchlist-card-action" type="button">
        Add
      </button>
    </div>
  );
}