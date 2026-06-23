"use client";
import { useEffect, useState } from "react";
import { getTransactions, type TransactionRecord, type WalletAddresses } from "@/lib/api";
import { useHomeLayout } from "@/components/layouts/HomeLayout";
import { ArrowDownLeft, ArrowUpRight, Copy, Check } from "lucide-react";
import { getChainIcon, getCoinIcon } from "@/lib/constants/wallet-icons";
import { formatDisplayToken } from "@/lib/utils";

function truncateAddress(address: string | undefined) {
  if (!address || address === "FIAT" || address.length < 10) return address || "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function CopyableText({ text, display, isHash = false }: { text: string; display: React.ReactNode; isHash?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span 
      className="text-[#f3f3f5] cursor-pointer hover:text-[#7c5cfc] transition-colors flex items-center gap-1.5"
      onClick={handleCopy}
      title={text}
    >
      {isHash ? <span className="truncate max-w-[150px]">{display}</span> : display}
      {copied ? (
        <Check size={14} strokeWidth={3} className="text-[#25ad3e] flex-shrink-0" />
      ) : (
        <Copy size={12} className="text-[#8b8b93] flex-shrink-0" />
      )}
    </span>
  );
}

type FilterType = "all" | "transfer" | "onramp" | "offramp";

export default function TransactionListCard() {
  const { activeWallet } = useHomeLayout();
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [addresses, setAddresses] = useState<WalletAddresses | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeWallet?.address) return;

    async function load() {
      setLoading(true);
      try {
        const res = await getTransactions();
        if (res.data) {
          setTransactions(res.data.transactions || []);
          setAddresses(res.data.addresses || null);
        }
      } catch (err) {
        console.error("Failed to load transactions", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [activeWallet?.address]);

  if (loading) {
    return (
      <div className="w-full rounded-2xl py-4 mt-1">
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="m-0 text-sm font-medium text-[#f3f3f5]">Transaction</h3>
        </div>
        <div className="w-full min-h-[120px] bg-[#2d2d2d] rounded-2xl p-4 flex items-center justify-center py-10">
          <div className="h-6 w-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "all") return true;
    return tx.recordType === filter;
  });

  const hasTransactions = filteredTransactions.length > 0;

  return (
    <div className="w-full rounded-2xl py-4 mt-1">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="m-0 text-sm font-medium text-[#f3f3f5]">Transaction</h3>
        <span className="text-xs text-[#7c5cfc] cursor-pointer">View all</span>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 px-1 overflow-x-auto no-scrollbar">
        {(["all", "transfer", "onramp", "offramp"] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f
                ? "bg-[#7c5cfc] text-white"
                : "bg-[#2d2d2d] text-[#8b8b93] hover:text-white"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1).replace("ramp", "-ramp")}
          </button>
        ))}
      </div>

      <div className="w-full min-h-[120px] bg-[#2d2d2d] rounded-2xl p-4 flex flex-col gap-4">
        {!hasTransactions ? (
          <div className="flex-1 flex flex-col justify-center items-center gap-3">
            <div className="w-10 h-10 rounded-full flex justify-center items-center">
              <img
                src="/assets/icons/actions/notification.svg"
                alt="No transaction"
                style={{
                  filter:
                    "invert(36%) sepia(85%) saturate(3011%) hue-rotate(345deg) brightness(98%) contrast(92%)",
                }}
              />
            </div>
            <p className="text-[#f3f3f5] text-sm font-semibold m-0">No transaction yet</p>
          </div>
        ) : (
          <>
            {filteredTransactions.map((tx) => {
              let type: "send" | "receive" = "send";
              let title = "";
              let amountText = "";

              // Parse chain and token for UI display
              const rawToken = tx.token || "";
              const [chainPart, tokenPart] = rawToken.includes(":") ? rawToken.split(":") : [tx.chain || "", rawToken];
              const displayToken = formatDisplayToken(tokenPart) || "ASSET";
              const displayChain = chainPart.toLowerCase();

              const chainLogo = getChainIcon(displayChain);
              const tokenLogo = getCoinIcon(displayToken);

              if (tx.recordType === "onramp") {
                type = "receive";
                title = `Received ${displayToken}`;
                amountText = `+ ${tx.amount}`;
              } else if (tx.recordType === "offramp") {
                const currencySymbol = tx.fiatCurrency === "NGN" ? "₦" : (tx.fiatCurrency || "₦");
                type = "send";
                title = `Withdrew ${currencySymbol}`;
                amountText = `+ ${currencySymbol}${tx.fiatAmount || 0}`;
              } else {
                const isSwap = rawToken.includes(">");
                if (isSwap) {
                  type = "send";
                  const [fromToken, toToken] = rawToken.split(">");
                  title = `Swapped ${formatDisplayToken(fromToken)} to ${formatDisplayToken(toToken)}`;
                  amountText = `${tx.amount} ${formatDisplayToken(fromToken)}`;
                } else {
                  const chainStr = tx.chain?.toLowerCase() || "";
                  let addressKey = "";
                  if (chainStr.includes("sol")) addressKey = "sol";
                  else if (chainStr.includes("base")) addressKey = "base";
                  else if (chainStr.includes("stellar")) addressKey = "xlm";
                  else if (chainStr.includes("eth")) addressKey = "eth";
                  else if (chainStr.includes("btc")) addressKey = "btc";

                  const userAddrForChain = addressKey ? addresses?.[addressKey as keyof WalletAddresses] : "";
                  const isReceive =
                    tx.fromAddress === "FIAT" ||
                    (userAddrForChain &&
                      tx.toAddress?.toLowerCase() === userAddrForChain.toLowerCase());

                  if (isReceive) {
                    type = "receive";
                    title = `Received ${displayToken}`;
                    amountText = `+ ${tx.amount}`;
                  } else {
                    type = "send";
                    title = `Sent ${displayToken}`;
                    amountText = `- ${tx.amount}`;
                  }
                }
              }

              let formattedDate = "Pending";
              if (tx.createdAt) {
                const dateObj = new Date(tx.createdAt);
                formattedDate =
                  dateObj.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }) +
                  " " +
                  dateObj.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  });
              }

              const isExpanded = expandedTxId === tx._id;
              
              let IconComponent = type === "receive" ? ArrowDownLeft : ArrowUpRight;
              let iconColorClass = "bg-[#e6f6e9] text-[#25ad3e]"; // successful
              
              const isPending = ["pending", "AWAITING_DEPOSIT", "PROCESSING"].includes(tx.status || "");
              const isFailed = ["failed", "FAILED"].includes(tx.status || "");
              
              if (isPending) {
                iconColorClass = "bg-[#fdf5ea] text-[#ee9c2e]";
              } else if (isFailed) {
                iconColorClass = "bg-[#fee2e2] text-[#ef4444]";
              }

              return (
                <div key={tx._id} className="flex flex-col w-full border-b border-[#3d3d3d] last:border-0 pb-3 last:pb-0">
                  <div 
                    className="flex justify-between items-center w-full cursor-pointer"
                    onClick={() => setExpandedTxId(isExpanded ? null : tx._id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-[38px] h-[38px] rounded-full flex justify-center items-center ${iconColorClass}`}>
                        <IconComponent size={20} strokeWidth={2.5} />
                      </div>
                      <div className="transaction-details">
                        <p className="m-0 text-sm text-[#f3f3f5]">{title}</p>
                        <span className="text-xs tracking-tighter text-[#8b8b93]">{formattedDate}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs p-1 pr-1.5 rounded-[64px] border border-dashed border-[#aaaaaa] text-white pl-2">
                        {amountText}
                        
                        {(tx.recordType === "onramp" || tx.recordType === "transfer") && !rawToken.includes(">") && (
                          <div className="flex -space-x-2 items-center pl-1">
                            {tokenLogo && (
                              <img src={tokenLogo} alt={displayToken} className="w-[18px] h-[18px] rounded-full z-10" />
                            )}
                            {chainLogo && (
                              <img src={chainLogo} alt={displayChain} className="w-[18px] h-[18px] rounded-full object-cover z-0" />
                            )}
                          </div>
                        )}
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b8b93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>
                  </div>

                  {/* Accordion Details */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-[#3d3d3d] text-xs text-[#8b8b93] flex flex-col gap-2 bg-[#252525] p-3 rounded-xl">
                      <div className="flex justify-between">
                        <span>Status</span>
                        <span className={`capitalize ${tx.status === "pending" || tx.status === "AWAITING_DEPOSIT" || tx.status === "PROCESSING" ? "text-[#ee9c2e]" : tx.status === "failed" || tx.status === "FAILED" ? "text-red-500" : "text-[#25ad3e]"}`}>
                          {tx.status?.replace("_", " ")}
                        </span>
                      </div>
                      
                      {tx.recordType === "transfer" && (
                        <>
                          <div className="flex justify-between">
                            <span>Network</span>
                            <span className="text-[#f3f3f5] capitalize">{tx.chain}</span>
                          </div>
                          {tx.fromAddress && (
                            <div className="flex justify-between items-center">
                              <span>From</span>
                              <CopyableText text={tx.fromAddress} display={truncateAddress(tx.fromAddress)} />
                            </div>
                          )}
                          {tx.toAddress && (
                            <div className="flex justify-between items-center">
                              <span>To</span>
                              <CopyableText text={tx.toAddress} display={truncateAddress(tx.toAddress)} />
                            </div>
                          )}
                          {tx.hash && (
                            <div className="flex justify-between items-center gap-4">
                              <span>Hash</span>
                              <CopyableText text={tx.hash} display={tx.hash} isHash />
                            </div>
                          )}
                        </>
                      )}

                      {(tx.recordType === "onramp" || tx.recordType === "offramp") && (
                        <>
                          <div className="flex justify-between">
                            <span>Fiat Value</span>
                            <span className="text-[#f3f3f5]">{tx.fiatCurrency === "NGN" ? "₦" : (tx.fiatCurrency || "₦")}{tx.fiatAmount}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Crypto Value</span>
                            <span className="text-[#f3f3f5] flex items-center gap-1">
                              {tx.amount} {displayToken}
                              <div className="flex -space-x-2 items-center ml-1">
                                {tokenLogo && (
                                  <img src={tokenLogo} alt={displayToken} className="w-[18px] h-[18px] rounded-full z-10" />
                                )}
                                {chainLogo && (
                                  <img src={chainLogo} alt={displayChain} className="w-[18px] h-[18px] rounded-full object-cover z-0" />
                                )}
                              </div>
                            </span>
                          </div>
                          {tx.bankDetails && (
                            <div className="flex justify-between">
                              <span>Bank</span>
                              <span className="text-[#f3f3f5]">{tx.bankDetails.bank_name} - {tx.bankDetails.account_number}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
