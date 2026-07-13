"use client";

import { useState } from "react";
import { X, Users } from "lucide-react";

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, address: string) => void;
}

// Minimal address validation – just checks it's non-empty and looks like a hex address
function isValidAddress(address: string) {
  return /^0x[0-9a-fA-F]{10,}$/.test(address.trim());
}

export default function AddContactModal({
  isOpen,
  onClose,
  onAdd,
}: AddContactModalProps) {
  const [contactName, setContactName] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [addressError, setAddressError] = useState(false);
  const [touched, setTouched] = useState(false);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setContactAddress(text);
      if (touched) setAddressError(!isValidAddress(text));
    } catch {
      // Silently fail if clipboard not accessible
    }
  };

  const handleAddressChange = (val: string) => {
    setContactAddress(val);
    if (touched) setAddressError(val.length > 0 && !isValidAddress(val));
  };

  const handleAddressBlur = () => {
    setTouched(true);
    setAddressError(
      contactAddress.length > 0 && !isValidAddress(contactAddress),
    );
  };

  const handleSubmit = () => {
    setTouched(true);
    if (!contactName.trim() || !isValidAddress(contactAddress)) {
      if (!isValidAddress(contactAddress)) setAddressError(true);
      return;
    }
    onAdd(contactName.trim(), contactAddress.trim());
    // Reset form
    setContactName("");
    setContactAddress("");
    setAddressError(false);
    setTouched(false);
    onClose();
  };

  if (!isOpen) return null;

  const isReady =
    contactName.trim().length > 0 && isValidAddress(contactAddress);

  return (
    <div
      className="fixed inset-0 z-200 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-112.5 mx-auto bg-[#1C1C1E] rounded-t-4xl px-6 pt-6 pb-12 animate-[slideUp_0.35s_cubic-bezier(0.4,0,0.2,1)_forwards]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#2C2C2E] flex items-center justify-center hover:bg-[#3A3A3C] transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6 mt-4">
          <div className="w-12 h-12 flex items-center justify-center">
            <Users className="w-10 h-10 text-[#7C3AED]" strokeWidth={1.5} />
          </div>
        </div>

        {/* Contact Name Input */}
        <div className="mb-3">
          <input
            type="text"
            placeholder="Contact name"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className={`w-full bg-[#2C2C2E] text-white placeholder-[#48484A] text-[15px] rounded-2xl px-4 py-4 outline-none border transition-colors ${
              contactName ? "border-[#7C3AED]" : "border-transparent"
            }`}
          />
        </div>

        {/* Contact Address Input */}
        <div className="mb-2">
          <div
            className={`w-full flex items-center bg-[#2C2C2E] rounded-2xl px-4 py-4 border transition-colors ${
              addressError
                ? "border-[#FF453A]"
                : contactAddress
                  ? "border-[#7C3AED]"
                  : "border-transparent"
            }`}
          >
            <input
              type="text"
              placeholder="Contact address / account number"
              value={contactAddress}
              onChange={(e) => handleAddressChange(e.target.value)}
              onBlur={handleAddressBlur}
              className="flex-1 bg-transparent text-white placeholder-[#48484A] text-[15px] outline-none min-w-0"
            />
            <button
              type="button"
              onClick={handlePaste}
              className="ml-3 text-[#7C3AED] text-[14px] font-medium shrink-0"
            >
              Paste
            </button>
          </div>
          {addressError && (
            <p className="text-[#FF453A] text-[12px] mt-1.5 pl-1">
              Wrong address
            </p>
          )}
        </div>

        {/* Add Contact Button */}
        <button
          onClick={handleSubmit}
          className={`w-full py-4 rounded-2xl font-medium text-[16px] mt-6 transition-colors ${
            isReady ? "bg-[#7C3AED] text-white" : "bg-[#C4B5FD] text-white/70"
          }`}
        >
          Add contact
        </button>
      </div>
    </div>
  );
}
