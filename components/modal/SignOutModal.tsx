"use client";

import { X } from "lucide-react";

interface SignOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function SignOutModal({
  isOpen,
  onClose,
  onConfirm,
}: SignOutModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center px-6 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#1C1C1E] rounded-3xl w-full max-w-sm p-6 relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dashed Circle X Icon */}
        <div className="flex justify-end mb-4">
          <div className="w-8 h-8 rounded-full border-2 border-dashed border-[#7C3AED] flex items-center justify-center">
            <X className="w-3.5 h-3.5 text-[#7C3AED]" />
          </div>
        </div>

        {/* Message */}
        <p className="text-white text-[17px] font-medium text-center mb-6 leading-snug">
          Are you sure you want to sign out ?
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 py-3.5 rounded-2xl bg-white text-[#1C1C1E] text-[15px] font-semibold hover:bg-gray-100 transition-colors"
          >
            Yes
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-2xl bg-[#7C3AED] text-white text-[15px] font-semibold hover:bg-[#6D28D9] transition-colors"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}
