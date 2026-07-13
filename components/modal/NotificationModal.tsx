"use client";

import { X } from "lucide-react";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
}

export default function NotificationModal({
  isOpen,
  onClose,
  notificationsEnabled,
  setNotificationsEnabled,
}: NotificationModalProps) {
  if (!isOpen) return null;

  const CustomSwitch = ({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: () => void;
  }) => (
    <div
      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${checked ? "bg-[#9853F5]" : "bg-[#48484A]"}`}
      onClick={onChange}
    >
      <div
        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${checked ? "translate-x-6" : "translate-x-0"}`}
      />
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-200 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-112.5 bg-[#1C1C1E] rounded-t-4xl px-6 pt-6 pb-12 animate-[slideUp_0.35s_cubic-bezier(0.4,0,0.2,1)_forwards] shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#2C2C2E] flex items-center justify-center hover:bg-[#3A3A3C] transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>

        {/* Content */}
        <div className="mt-6 mb-8 text-center">
          <h2 className="text-[20px] font-semibold text-white mb-3">
            Notification
          </h2>
          <p className="text-[#8E8E93] text-[14px] leading-relaxed max-w-65 mx-auto">
            Get notified about receiving assets, product update and more
          </p>
        </div>

        {/* Toggle Row */}
        <div className="flex items-center justify-between py-2">
          <span className="text-white text-[16px] font-medium">
            Allow notifications
          </span>
          <CustomSwitch
            checked={notificationsEnabled}
            onChange={() => setNotificationsEnabled(!notificationsEnabled)}
          />
        </div>
      </div>
    </div>
  );
}
