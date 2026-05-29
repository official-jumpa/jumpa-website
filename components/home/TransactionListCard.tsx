"use client"
import { useEffect, useState } from "react";
import { getTransactions, type TransactionRecord, type WalletAddresses } from "@/lib/api";

export default function TransactionListCard() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [addresses, setAddresses] = useState<WalletAddresses | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
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
  }, []);

  if (loading) {
    return (
      <div className="home-transaction-section">
        <div className="home-transaction-head">
          <h3>Transaction</h3>
        </div>
        <div className="transaction-list-card flex items-center justify-center py-10">
          <div className="h-6 w-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  const hasTransactions = transactions.length > 0;

  return (
    <div className="home-transaction-section">
      <div className="home-transaction-head">
        <h3>Transaction</h3>
        <span>View all</span>
      </div>

      <div className="transaction-list-card">
        {!hasTransactions ? (
          <div className="empty-transaction">
            <div className="empty-transaction-icon">
              <img
                src="/assets/icons/actions/notification.svg"
                alt="No transaction"
                style={{
                  filter:
                    "invert(36%) sepia(85%) saturate(3011%) hue-rotate(345deg) brightness(98%) contrast(92%)",
                }}
              />
            </div>
            <p>No transaction yet</p>
          </div>
        ) : (
          <>
            {transactions.map((tx) => {
              // 1. Determine transaction type (send, receive, swap)
              let type: "send" | "receive" = "send";
              let title = "";
              let amountText = "";

              const isSwap = tx.token.includes(">");

              if (isSwap) {
                type = "send"; // swaps represent outbound/outgoing actions for the source asset
                const [fromToken, toToken] = tx.token.split(">");
                title = `Swapped ${fromToken} to ${toToken}`;
                amountText = `${tx.amount} ${fromToken}`;
              } else {
                const chainKey = tx.chain.toLowerCase();
                const userAddrForChain =
                  addresses?.[chainKey as keyof WalletAddresses] || "";

                // If it is fiat onramp or the recipient address is our address, it is a receive/deposit
                const isReceive =
                  tx.fromAddress === "FIAT" ||
                  (userAddrForChain &&
                    tx.toAddress.toLowerCase() === userAddrForChain.toLowerCase());

                if (isReceive) {
                  type = "receive";
                  title = `Received ${tx.token}`;
                  amountText = `+ ${tx.amount} ${tx.token}`;
                } else {
                  type = "send";
                  title = `Sent ${tx.token}`;
                  amountText = `- ${tx.amount} ${tx.token}`;
                }
              }

              // 2. Format timestamp nicely (e.g. Jan 26, 2026 7:34 AM)
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

              return (
                <div key={tx._id} className="transaction-item">
                  <div className="transaction-item-left">
                    <div className={`transaction-icon ${type}`}>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        {type === "receive" ? (
                          <>
                            <line x1="2" y1="2" x2="17" y2="17" />
                            <polyline points="5 17 17 17 17 5" />
                          </>
                        ) : (
                          <>
                            <line x1="2" y1="17" x2="17" y2="2" />
                            <polyline points="5 2 17 2 17 14" />
                          </>
                        )}
                      </svg>
                    </div>
                    <div className="transaction-details">
                      <p>{title}</p>
                      <span>{formattedDate}</span>
                    </div>
                  </div>
                  <div className="transaction-amount">{amountText}</div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
