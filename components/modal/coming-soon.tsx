"use client";
import { X } from "lucide-react";

type ComingSoonModalProps = {
    open: boolean;
    onClose: () => void;
};

export default function ComingSoonModal({
    open,
    onClose,
}: ComingSoonModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-lg">
            <div className="relative w-[90%] max-w-[420px] rounded-2xl bg-white px-6 py-7 shadow-xl">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100"
                >
                    <X size={18} />
                </button>

                <h2 className="text-lg font-semibold mb-2">Coming Soon 🚀</h2>
                <p className="text-sm text-gray-600 mb-4">
                    This feature isn’t available yet.
                </p>
                {/* <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Get early access
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Be among the first to experience Jumpa
        </p>

        <div className="flex gap-2">
          <input
            type="email"
            placeholder="Email address"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#9A24F6]"
          />
          <button className="rounded-lg bg-[#4B0082] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
            Join waitlist
          </button>
        </div> */}
            </div>
        </div>
    );
}
