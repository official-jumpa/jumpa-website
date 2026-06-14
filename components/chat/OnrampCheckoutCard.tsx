import { useState } from "react";
import { type Message } from "./chat-types";
import { TextWithLinks } from "./TransactionIntentCard";

export function BuyCryptoBlock({
  msg,
}: {
  msg: Message;
}) {
  const [step, setStep] = useState<"summary" | "transfer" | "done">("summary");

  const amount = msg.transactionParams?.amount || "23";
  const token = msg.transactionParams?.token?.toUpperCase() || "USDC Solana";
  const ngnAmount = (Number(amount) * 1387.45).toFixed(2); // Mock exchange rate

  if (step === "done") {
    return (
      <div className="flex flex-col gap-3">
        {msg.text && (
          <div className="max-w-[324px] w-full ml-0 mr-auto flex flex-col gap-[6px] self-start mt-1">
            <div className="m-0 font-[Geist,sans-serif] font-normal text-sm leading-[145%] text-[#d5d5d5] whitespace-pre-wrap overflow-anywhere wrap-break-word">
              <TextWithLinks text={msg.text} />
            </div>
          </div>
        )}
        <div className="w-full self-start max-w-[324px] bg-[#161616] rounded-2xl p-5 box-border mt-2">
          <h3 className="m-0 text-white font-bold text-lg mb-2">Transfer Done !</h3>
          <p className="m-0 text-[#909090] text-sm leading-[1.4] mb-5">
            Got it! We'll track your payment automatically. Your balance will be updated within a few seconds once confirmed by the bank.
          </p>
          <button
            onClick={() => {}}
            className="w-full py-3 rounded-xl bg-[#7c5cfc] text-white font-semibold text-sm border-none cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  if (step === "transfer") {
    return (
      <div className="flex flex-col gap-3">
        {msg.text && (
          <div className="max-w-[324px] w-full ml-0 mr-auto flex flex-col gap-[6px] self-start mt-1">
            <div className="m-0 font-[Geist,sans-serif] font-normal text-sm leading-[145%] text-[#d5d5d5] whitespace-pre-wrap overflow-anywhere wrap-break-word">
              <TextWithLinks text={msg.text} />
            </div>
          </div>
        )}
        <div className="w-full self-start max-w-[324px] bg-[#161616] rounded-2xl p-5 box-border mt-2 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-[#d5d5d5] text-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
              <circle cx="12" cy="12" r="2" />
            </svg>
            <span className="font-semibold text-xs leading-[1.4]">
              Transfer exactly <span className="font-bold">₦ {ngnAmount}</span> to the account below.
            </span>
          </div>

          <div className="flex flex-col gap-1 mt-1">
            <span className="text-[#909090] text-xs">Bank name</span>
            <span className="text-white font-bold text-sm">Moniepoint</span>
          </div>
          
          <div className="flex flex-col gap-1">
            <span className="text-[#909090] text-xs">Account name</span>
            <span className="text-white font-bold text-sm">Ndukwe Anita Checkout</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[#909090] text-xs">Account number</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm">6098977654</span>
              <button className="bg-transparent border-none p-0 cursor-pointer flex items-center justify-center text-[#909090] hover:text-white transition-colors" onClick={() => navigator.clipboard.writeText("6098977654")}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[#909090] text-xs">Description</span>
            <input type="text" placeholder="Add note" className="w-full bg-transparent border border-[#333] rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-[#7c5cfc] placeholder:text-[#5a5a5a]" />
          </div>

          <button
            onClick={() => setStep("done")}
            className="w-full py-3 rounded-xl bg-[#7c5cfc] text-white font-semibold text-sm border-none cursor-pointer mt-2"
          >
            I have made the transfer
          </button>
          
          <p className="m-0 text-center text-[#5a5a5a] text-[10px] px-2">
            Your crypto will be delivered automatically to your wallet once the transfer is confirmed
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {msg.text && (
        <div className="max-w-[324px] w-full ml-0 mr-auto flex flex-col gap-[6px] self-start mt-1">
          <div className="m-0 font-[Geist,sans-serif] font-normal text-sm leading-[145%] text-[#d5d5d5] whitespace-pre-wrap overflow-anywhere wrap-break-word">
            <TextWithLinks text={msg.text} />
          </div>
        </div>
      )}
      
      <div className="w-full self-start max-w-[324px] bg-[#161616] rounded-2xl p-5 box-border mt-2 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-[#d5d5d5] text-xs font-medium">Buy Crypto</span>
          <div className="flex items-center gap-1 bg-[#222] px-3 py-1.5 rounded-full">
            <span className="text-[#d5d5d5] text-xs font-semibold">{token}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d5d5d5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>

        <div className="flex items-center justify-between my-2">
          <div className="flex flex-col">
            <span className="text-[#d5d5d5] text-sm font-semibold mb-1">Pay ($)</span>
            <span className="text-white text-2xl font-bold">{amount}</span>
          </div>
          
          <div className="flex items-center justify-center shrink-0 mx-2 text-[#909090]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 10l-4 4 4 4" />
              <path d="M21 14H3" />
              <path d="M17 4l4 4-4 4" />
              <path d="M3 8h18" />
            </svg>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[#d5d5d5] text-sm font-semibold mb-1">You receive (NGN)</span>
            <span className="text-white text-2xl font-bold">{ngnAmount}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <div className="flex items-center justify-between">
            <span className="text-[#909090] text-xs font-medium">Exchange rate</span>
            <span className="text-white text-xs font-bold">1 USD = ₦ 1,387.45</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#909090] text-xs font-medium">Fee</span>
            <span className="text-white text-xs font-bold">$ 0.05</span>
          </div>
        </div>

        <button
          onClick={() => setStep("transfer")}
          className="w-full py-3 rounded-xl bg-[#7c5cfc] text-white font-semibold text-sm border-none cursor-pointer mt-3 transition-opacity hover:opacity-90 active:scale-[0.98]"
        >
          Make payment
        </button>
      </div>
    </div>
  );
}
