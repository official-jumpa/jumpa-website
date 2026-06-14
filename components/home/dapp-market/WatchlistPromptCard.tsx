import React from 'react';

const WATCHLIST_ICONS = [
  { src: '/coins/eth.svg', alt: 'ETH' },
  { src: '/coins/btc.svg', alt: 'BTC' },
  { src: '/coins/sol.svg', alt: 'SOL' },
];

export default function WatchlistPromptCard() {
  return (
    <div className="flex items-center justify-between gap-4 py-3 px-4 bg-[#1f1f1f] border border-white/[0.05] rounded-[24px] shadow-[0_8px_24px_rgba(0,0,0,0.28)] mb-4">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="flex items-center min-w-[58px]" aria-hidden="true">
          {WATCHLIST_ICONS.map(({ src, alt }, index) => (
            <img
              key={alt}
              src={src}
              alt={alt}
              width="30"
              height="30"
              className={`w-[30px] h-[30px] rounded-full border-2 border-[#1f1f1f] object-contain block ${
                index > 0 ? '-ml-2.5' : ''
              }`}
            />
          ))}
        </div>
        <p className="m-0 text-white text-xs font-medium">Add tokens to watchlist</p>
      </div>
      <button 
        className="shrink-0 inline-flex items-center justify-center py-2.5 px-4 rounded-xl bg-[#252525] hover:bg-[#2e2e2e] transition-colors text-white border border-white/5 text-xs font-bold cursor-pointer" 
        type="button"
      >
        Add
      </button>
    </div>
  );
}