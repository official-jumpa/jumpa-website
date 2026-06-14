import { type ReactNode } from "react";

export function IconBtn({
  onClick,
  ariaLabel,
  children,
  className = "",
}: {
  onClick: () => void;
  ariaLabel: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`w-[35px] h-[35px] p-[7.95px] border-none rounded-[50.91px] bg-[#2d2d2d] flex items-center justify-center cursor-pointer shrink-0 box-border transition-[background] duration-150 hover:bg-[#3a3a3a] ${className}`}
    >
      {children}
    </button>
  );
}

export function VoiceScreen({ processing }: { processing: boolean }) {
  return (
    <div className="flex-1 min-h-0 flex flex-col bg-black w-full max-w-[390px] mx-auto box-border">
      <div style={{ flex: 1 }} />
      <div className="flex items-center gap-[10px] px-4 pt-[14px] pb-5 border-t border-[#2A2A3A] bg-[#0A0A0F] shrink-0">
        <div className="flex-1 flex items-center gap-[2px] h-9">
          {Array.from({ length: 45 }).map((_, i) => (
            <div
              key={i}
              className="w-[3px] rounded-[2px]"
              style={{
                background: processing ? "rgb(124, 92, 252)" : "#8888AA",
                height: `${16 + Math.abs(Math.sin(i * 0.7)) * 20}px`,
                opacity: 0.6 + Math.abs(Math.sin(i * 0.5)) * 0.4,
                animation: processing
                  ? `vwave 1s ${i * 0.02}s infinite alternate ease-in-out`
                  : "none",
              }}
            />
          ))}
        </div>
        <button
          type="button"
          className="w-10 h-10 rounded-full border-none bg-[#1A1A24] flex items-center justify-center cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8888AA" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <button
          type="button"
          className="w-10 h-10 rounded-full border-none bg-[#7c5cfc] flex items-center justify-center cursor-pointer"
        >
          {processing ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <div className="w-3 h-3 rounded-full bg-white" />
          )}
        </button>
      </div>
    </div>
  );
}
