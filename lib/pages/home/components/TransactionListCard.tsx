import React from "react";

export default function TransactionListCard() {
  const transactions = [
    {
      id: "1",
      type: "receive",
      title: "Deposit 2.00 USDC",
      date: "Jan 26, 2026 7:34 AM",
      amount: "+ 2.00 USD",
    },
    {
      id: "2",
      type: "send",
      title: "Sent  2.00 Sol USDC",
      date: "Jan 26, 2026 7:34 AM",
      amount: "- 2.00 USD",
    },
  ];

  // Set to true to show the filled state as depicted in the right image
  const hasTransactions = true;

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
            {transactions.map((tx) => (
              <div key={tx.id} className="transaction-item">
                <div className="transaction-item-left">
                  <div className={`transaction-icon ${tx.type}`}>
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
                      {tx.type === "receive" ? (
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
                    <p>{tx.title}</p>
                    <span>{tx.date}</span>
                  </div>
                </div>
                <div className="transaction-amount">{tx.amount}</div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
