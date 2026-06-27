import { useState, useEffect } from "react";
import type { Recipient } from "../types";
import { isAddress } from "viem";

const closeIcon = "/assets/icons/actions/close.svg";
const dropIcon = "/assets/icons/actions/drop.svg";

type RecipientSelectSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipients: Recipient[];
  selectedRecipientId: string;
  onSelectRecipient: (recipient: Recipient) => void;
};

export default function RecipientSelectSheet({
  open,
  onOpenChange,
  recipients,
  selectedRecipientId,
  onSelectRecipient,
}: RecipientSelectSheetProps) {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    if (!open) {
      setInputValue("");
      setError("");
      setShowContact(false);
    }
  }, [open]);

  const isValidAddress = (val: string) => {
    return val.startsWith("@") || val.length > 10;
  };

  const handleContinue = () => {
    if (!inputValue) return;
    if (isValidAddress(inputValue)) {
      setError("");
      setShowContact(true);
    } else {
      setError("Invalid address");
      setShowContact(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;
      setInputValue(text);
      if (isValidAddress(text)) {
        setError("");
        setShowContact(true);
      } else {
        setError("Invalid address");
        setShowContact(false);
      }
    } catch (e) {
      // Ignore paste error
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setError("");
    setShowContact(false);
  };

  if (!open) return null;

  // Resolve a display contact for the valid input
  const displayContact =
    inputValue && showContact
      ? recipients.find(
          (r) => r.address.toLowerCase() === inputValue.toLowerCase(),
        ) || {
          id: inputValue,
          name: inputValue.startsWith("@") ? inputValue : "New Contact",
          address: inputValue,
          bank: "Crypto Destination",
          avatar: "",
        }
      : null;

  return (
    <div
      className="absolute inset-0 bg-black/45 backdrop-blur-[10px] z-1000 flex justify-center"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-105 max-w-full min-h-110 max-h-[90vh] bg-[#101010] rounded-t-4xl flex flex-col shadow-[0_-4px_20px_rgba(0,0,0,0.3)] animate-[slideUp_0.3s_ease-out] px-5 pb-[env(safe-area-inset-bottom,24px)] pt-0 overflow-y-auto scrollbar-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center py-3 cursor-grab">
          <img src={dropIcon} alt="" className="w-8 h-1" />
        </div>

        <div className="flex items-center justify-center relative py-2 mb-6">
          <h2 className="text-[15px] font-semibold text-white tracking-wide">
            Choose recipient
          </h2>
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

        <div className="space-y-6 pb-6">
          <div className="flex flex-col bg-[#2d2d2d] rounded-2xl px-4 py-3 min-h-22.5 relative">
            <p
              className={`text-[13px] font-medium mb-1 ${error ? "text-[#FF4D4D]" : "text-white"}`}
            >
              Address or .Tag handle
            </p>
            <input
              value={inputValue}
              onChange={handleChange}
              placeholder="Enter wallet address or .tag handle"
              className={`w-full bg-transparent text-[12px] font-normal leading-relaxed resize-none focus:outline-none placeholder:text-zinc-500 ${error ? "text-[#FF4D4D]" : "text-zinc-300"}`}
            />
            {error && (
              <p className="text-[11px] text-[#FF4D4D] mt-1">{error}</p>
            )}

            {inputValue && !error && (
              <p className="text-[11px] text-zinc-500 mt-1">New address</p>
            )}

            <div className="flex items-center gap-2 mt-auto pt-3">
              <button
                type="button"
                onClick={handleContinue}
                className="h-8 px-4 rounded-full bg-white text-black text-[13px] font-medium transition hover:bg-zinc-200"
              >
                Continue
              </button>
              <button
                type="button"
                onClick={handlePaste}
                className="h-8 px-4 rounded-full bg-[#3d3d3d] text-white text-[13px] font-medium flex items-center gap-2 transition hover:bg-[#4a4a4a]"
              >
                Paste
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>

            {inputValue && (
              <button
                onClick={() => setInputValue("")}
                className="absolute right-4 top-4 w-5 h-5 flex items-center justify-center rounded-full bg-[#3d3d3d] text-zinc-400 hover:text-white"
              >
                <img
                  src={closeIcon}
                  alt=""
                  className="w-2.5 h-2.5 opacity-70"
                />
              </button>
            )}
          </div>

          {showContact && displayContact && (
            <div className="pt-2">
              <h3 className="text-[13px] font-bold text-white mb-3">Contact</h3>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    onSelectRecipient(displayContact);
                    onOpenChange(false);
                  }}
                  className="flex w-full items-center gap-3 text-left transition hover:bg-[#1a1a1a] p-2 rounded-xl"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2d2d2d] overflow-hidden">
                    <img
                      src="/assets/icons/actions/user-wallet.svg"
                      alt="wallet"
                      className="w-5 h-5 opacity-60"
                    />
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="text-[13px] font-semibold text-white truncate">
                      {displayContact.name}
                    </p>
                    <p className="text-[11px] text-zinc-500 truncate">
                      {displayContact.address}
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
