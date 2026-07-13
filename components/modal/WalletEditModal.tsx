"use client";

import { X, Pen } from "lucide-react";

const walletIcon = "/assets/wallet.svg";
interface WalletEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletName: string;
  tempName: string;
  editingName: boolean;
  setTempName: (name: string) => void;
  setEditingName: (editing: boolean) => void;
  onSave: () => void;
}

export default function WalletEditModal({
  isOpen,
  onClose,
  walletName,
  tempName,
  editingName,
  setTempName,
  setEditingName,
  onSave,
}: WalletEditModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
      <div className="bg-[#1C1C1E] rounded-4xl w-full max-w-sm p-6 relative flex flex-col items-center shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#2C2C2E] flex items-center justify-center hover:bg-[#3A3A3C] transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>

        {/* Gradient Avatar */}
        <div className="mt-8 mb-6 w-20 h-20 rounded-2xl">
          <img src={walletIcon} alt="" />
        </div>
        {/* Editable Name */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {editingName ? (
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="bg-transparent border-b border-[#9853F5] text-white text-[18px] font-medium text-center outline-none w-32 pb-1"
              autoFocus
              onBlur={() => {
                if (!tempName) setTempName("Wallet");
              }}
              onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
            />
          ) : (
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setEditingName(true)}
            >
              <span className="text-[18px] font-medium text-white">
                {walletName}
              </span>
              <span className="text-gray-500 font-light">|</span>
              <Pen className="w-4 h-4 text-gray-400" />
            </div>
          )}
        </div>

        {/* Wallet Address */}
        <div className="w-full bg-transparent rounded-xl px-4 py-3 mb-8 flex items-center justify-center border border-gray-600">
          <span className="text-[#8E8E93] text-[10px] font-mono truncate">
            0x295cCa3BD7C8C854b7c52Bd7a0dCB10CFFFc44e
          </span>
        </div>

        {/* Save Button */}
        <button
          onClick={onSave}
          className={`w-full py-4 rounded-2xl font-medium text-[16px] transition-colors ${
            walletName !== tempName
              ? "bg-[#7C3AED] text-white"
              : "bg-[#C4B5FD] text-white/90"
          }`}
        >
          Save
        </button>
      </div>
    </div>
  );
}
