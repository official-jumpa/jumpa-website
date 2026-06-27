import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { Token } from "../types";
import { getChainIcon, getCoinIcon } from "@/lib/constants/wallet-icons";
import Image from "next/image";

const closeIcon = "/assets/icons/actions/close.svg";
const dropIcon = "/assets/icons/actions/drop.svg";

type TokenSearchSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tokens: Token[];
  onSelectToken: (token: Token) => void;
};

function TokenIcon({ token }: { token: Token }) {
  const tokenImg = getCoinIcon(token.symbol);
  const chainImg = getChainIcon(token.symbol);

  return (
    <div className="relative">
      {tokenImg ? (
        <Image
          height={40}
          width={40}
          src={tokenImg}
          alt={token.symbol}
          className="h-10 w-10 rounded-full object-contain"
        />
      ) : (
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${token.iconColor}`}
        >
          {token.iconLabel}
        </div>
      )}
      {chainImg && (
        <div className="absolute -bottom-1 -right-1 bg-[#2d2d2d] rounded-full p-0.5">
          <Image
            height={16}
            width={16}
            src={chainImg}
            alt="Chain"
            className="h-4 w-4 object-contain rounded-full"
          />
        </div>
      )}
    </div>
  );
}

export default function TokenSearchSheet({
  open,
  onOpenChange,
  tokens,
  onSelectToken,
}: TokenSearchSheetProps) {
  const [query, setQuery] = useState("");

  const filteredTokens = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return tokens;
    return tokens.filter(
      (token) =>
        token.symbol.toLowerCase().includes(trimmed) ||
        token.name.toLowerCase().includes(trimmed),
    );
  }, [query, tokens]);

  if (!open) return null;

  return (
    <div
      className="absolute inset-0 bg-black/45 backdrop-blur-[10px] z-1000 flex justify-center"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-105 max-h-[90vh] bg-[#101010] rounded-t-4xl flex flex-col shadow-[0_-4px_20px_rgba(0,0,0,0.3)] animate-[slideUp_0.3s_ease-out] px-5 pb-[env(safe-area-inset-bottom,24px)] pt-0 overflow-y-auto scrollbar-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center py-3 cursor-grab">
          <img src={dropIcon} alt="" className="w-8 h-1" />
        </div>

        <div className="flex items-center justify-center relative py-2 mb-4">
          <h2 className="text-[17px] font-semibold text-white">Search Token</h2>
          <button
            type="button"
            className="absolute right-0 w-8.75 h-8.75 p-2 border-none rounded-[50.91px] bg-[#2d2d2d] flex items-center justify-center cursor-pointer transition-colors duration-150 hover:bg-[#3a3a3a]"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
          >
            <img
              src={closeIcon}
              alt=""
              className="w-[11.72px] h-[11.72px] block opacity-70"
            />
          </button>
        </div>

        <div className="space-y-4">
          <label
            htmlFor="token-search"
            className="flex h-13 items-center gap-3 rounded-2xl border border-[#3C3C3C] bg-transparent px-4"
          >
            <Search className="h-4 w-4 text-zinc-500" />
            <input
              id="token-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search here"
              className="w-full bg-transparent text-[15px] text-white placeholder:text-zinc-500 focus:outline-none"
            />
          </label>

          <div className="max-h-[60vh] space-y-2.5 overflow-y-auto pb-6 scrollbar-none">
            {filteredTokens.map((token) => (
              <button
                type="button"
                key={token.id}
                onClick={() => {
                  onSelectToken(token);
                  onOpenChange(false);
                }}
                className="flex w-full items-center gap-3.5 rounded-2xl bg-[#2d2d2d] px-4 py-3.5 text-left transition hover:bg-[#353535] active:scale-[0.98]"
              >
                <TokenIcon token={token} />
                <div className="flex flex-col gap-0.5">
                  <p className="text-[15px] font-medium text-white">
                    {token.name || token.symbol}
                  </p>
                  <p className="text-[12px] font-normal text-zinc-400">
                    {token.balanceRaw || "0.00"} {token.symbol}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
