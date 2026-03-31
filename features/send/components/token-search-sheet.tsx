import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { Token } from "../types";
import SheetShell from "./sheet-shell";

type TokenSearchSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tokens: Token[];
  onSelectToken: (token: Token) => void;
};

function TokenIcon({ token }: { token: Token }) {
  return (
    <div className="relative">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${token.iconColor}`}
      >
        {token.iconLabel}
      </div>
      {token.chainBadge ? (
        <span
          className={`absolute -bottom-1 -right-1 inline-flex h-4 w-4 items-center justify-center rounded-[2px] border border-white text-[9px] font-bold ${token.chainBadge.color} ${token.chainBadge.textColor ?? "text-white"}`}
        >
          {token.chainBadge.label}
        </span>
      ) : null}
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
        token.name.toLowerCase().includes(trimmed)
    );
  }, [query, tokens]);

  return (
    <SheetShell open={open} onOpenChange={onOpenChange} title="Search Token">
      <div className="space-y-4">
        <label
          htmlFor="token-search"
          className="flex h-12 items-center gap-2 rounded-xl border border-zinc-500/70 px-3"
        >
          <Search className="h-4 w-4 text-zinc-500" />
          <input
            id="token-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search here"
            className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
          />
        </label>

        <div className="max-h-[42vh] space-y-2 overflow-y-auto pb-3">
          {filteredTokens.map((token) => (
            <button
              type="button"
              key={token.id}
              onClick={() => onSelectToken(token)}
              className="flex w-full items-center gap-3 rounded-2xl bg-zinc-800 px-4 py-3 text-left transition hover:bg-zinc-700"
            >
              <TokenIcon token={token} />
              <div>
                <p className="text-lg font-medium text-white">{token.symbol}</p>
                <p className="text-sm text-zinc-400">{token.balanceText}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </SheetShell>
  );
}
