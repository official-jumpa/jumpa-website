import { type Message } from "./chat-types";

export function TextWithLinks({ text }: { text: string }) {
  const parts = text.split(/([\s\S]*?\]\(https?:\/\/\S+?\))/g);
  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/\[([\s\S]*?)\]\((https?:\/\/\S+?)\)/);
        if (match) {
          return (
            <a
              key={i}
              href={match[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline font-bold hover:text-white/80 transition-colors break-all"
            >
              {match[1]}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export function TransactionBlock({
  msg,
  onTransactionClick,
  disabled = false,
}: {
  msg: Message;
  onTransactionClick: (msg: Message) => void;
  disabled?: boolean;
}) {
  const isSwap = msg.transactionParams?.type === "swap";
  const labelText = msg.transactionDetails?.label || (isSwap ? "Swap Intent" : "Transfer Intent");
  const titleText = msg.transactionDetails?.title || (isSwap ? "Drafted Swap" : "Pending Transfer");

  const isCompleted = msg.transactionDetails?.result?.toLowerCase().includes("complete") || msg.transactionDetails?.result?.toLowerCase().includes("sent");

  if (disabled && !isCompleted) {
    if (!msg.text) return null;
    return (
      <div className="flex flex-col gap-3 w-full max-w-[324px]">
        <div className="w-full ml-0 mr-auto flex flex-col gap-[6px] self-start mt-1">
          <div className="m-0 font-[Geist,sans-serif] font-normal text-sm leading-[145%] text-[#d5d5d5] whitespace-pre-wrap overflow-anywhere wrap-break-word">
            <TextWithLinks text={msg.text} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full max-w-[324px]">
      {msg.text && (
        <div className="w-full ml-0 mr-auto flex flex-col gap-[6px] self-start mt-1">
          <div className="m-0 font-[Geist,sans-serif] font-normal text-sm leading-[145%] text-[#d5d5d5] whitespace-pre-wrap overflow-anywhere wrap-break-word">
            <TextWithLinks text={msg.text} />
          </div>
        </div>
      )}
      <div className="flex justify-start w-full self-start">
        <button
          type="button"
          disabled={disabled || isCompleted}
          onClick={() => onTransactionClick(msg)}
          className={`group flex flex-col gap-2 w-full text-left bg-transparent border-none p-0 select-none outline-none ${
            isCompleted || disabled ? "cursor-default" : "cursor-pointer"
          }`}
        >
          {/* Card Body */}
          <div className={`bg-[#18181b]/85 backdrop-blur-md text-white p-4 rounded-2xl text-[13px] border border-white/10 w-full shadow-2xl transition-all duration-300 flex flex-col gap-3.5 relative overflow-hidden ${
            isCompleted || disabled
              ? "opacity-60 border-white/5"
              : "group-hover:border-[#7c5cfc]/40 group-hover:bg-[#202024]/90"
          }`}>
            {/* Glossy top highlight glow */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            
            {/* Header: Title & Intent Badge */}
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                {isSwap ? (
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isCompleted || disabled
                      ? "bg-white/5 border border-white/10 text-white/40"
                      : "bg-[#7c5cfc]/15 border border-[#7c5cfc]/20 text-[#9f7aea]"
                  }`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 1l4 4-4 4" />
                      <path d="M3 11h18" />
                      <path d="M7 23l-4-4 4-4" />
                      <path d="M21 13H3" />
                    </svg>
                  </div>
                ) : (
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isCompleted || disabled
                      ? "bg-white/5 border border-white/10 text-white/40"
                      : "bg-[#3ec6c6]/15 border border-[#3ec6c6]/20 text-[#3ec6c6]"
                  }`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </div>
                )}
                <span className={`font-bold text-sm tracking-tight ${isCompleted || disabled ? "text-[#909090]" : "text-[#f4f4f4]"}`}>{titleText}</span>
              </div>
              
              <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase border ${
                isCompleted || disabled
                  ? "bg-white/5 text-[#909090] border-white/10"
                  : isSwap 
                    ? "bg-[#7c5cfc]/10 text-[#a78bfa] border-[#7c5cfc]/20" 
                    : "bg-[#3ec6c6]/10 text-[#3ec6c6] border-[#3ec6c6]/20"
              }`}>
                {labelText}
              </div>
            </div>

            {/* Transaction Data Rows */}
            <div className="flex flex-col gap-2.5 w-full bg-white/[0.02] border border-white/5 rounded-xl p-3">
              {/* Sent / From Asset Row */}
              <div className="flex justify-between items-center w-full">
                <span className="text-[#909090] text-xs">{isSwap ? "From Asset" : "Amount"}</span>
                <span className={`font-semibold tracking-wide text-sm ${isCompleted || disabled ? "text-[#909090]" : "text-white"}`}>{msg.transactionDetails?.sent.replace("Amount: ", "").replace("From: ", "")}</span>
              </div>

              {/* Arrow Divider for Swaps */}
              {isSwap && (
                <div className="flex justify-center w-full py-0.5 border-t border-white/5">
                  <div className="text-[#909090] py-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <polyline points="19 12 12 19 5 12" />
                    </svg>
                  </div>
                </div>
              )}

              {/* To / Recipient Row */}
              <div className="flex flex-col gap-1 w-full pt-1.5 border-t border-white/5">
                <span className="text-[#909090] text-xs">{isSwap ? "To Asset" : "To Recipient"}</span>
                <div className="break-all font-mono text-[11px] bg-black/40 border border-white/5 p-2 rounded-lg text-[#d4d4d8] leading-[1.4] select-text">
                  {msg.transactionDetails?.to.replace("Recipient: ", "").replace("To: ", "")}
                </div>
              </div>
            </div>

            {/* Status / Confirm Bottom Bar */}
            <div className="flex items-center gap-2 mt-0.5 pt-1">
              {!isCompleted ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7c5cfc] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7c5cfc]"></span>
                  </span>
                  <span className="text-[#a78bfa] font-bold text-xs tracking-tight group-hover:text-white transition-colors">
                    {msg.transactionDetails?.result || "Tap to confirm and send"}
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#22c55e]"></span>
                  <span className="text-[#22c55e] font-bold text-xs tracking-tight">
                    {msg.transactionDetails?.result}
                  </span>
                </>
              )}
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
