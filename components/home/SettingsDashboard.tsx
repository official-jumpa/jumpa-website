"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  FaArrowLeft,
  FaWallet,
  FaMoon,
  FaBell,
  FaAddressBook,
  FaLock,
  FaKey,
  FaHeadset,
  FaTwitter,
  FaSignOutAlt,
  FaChevronRight,
  FaDownload,
} from "react-icons/fa";
import WalletEditModal from "@/components/modal/WalletEditModal";
import NotificationModal from "@/components/modal/NotificationModal";
import SignOutModal from "@/components/modal/SignOutModal";
import ExportWalletModal from "@/components/modal/ExportWalletModal";

export default function SettingsDashboard() {
  const router = useRouter();

  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [walletName, setWalletName] = useState("Wallet");
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(walletName);

  const handleSaveWallet = () => {
    setWalletName(tempName);
    setEditingName(false);
    setIsWalletModalOpen(false);
  };

  const openWalletModal = () => {
    setTempName(walletName);
    setEditingName(false);
    setIsWalletModalOpen(true);
  };

  const openNotificationModal = () => {
    setIsNotificationModalOpen(true);
  };

  const handleConfirmSignOut = () => {
    setIsSignOutModalOpen(false);
    router.push("/onboarding");
  };

  const CustomSwitch = ({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: () => void;
  }) => (
    <div
      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${checked ? "bg-[#9853F5]" : "bg-gray-600"}`}
      onClick={onChange}
    >
      <div
        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${checked ? "translate-x-6" : "translate-x-0"}`}
      />
    </div>
  );

  return (
    <div className="relative h-full text-white flex flex-col font-sans">
      {/* Header */}
      <div className="px-6 pt-6 pb-6 flex items-center gap-4">
        <button
          onClick={() => router.push("/home")}
          className="w-9 h-9 rounded-full bg-[#1f1f1f] hover:bg-[#2c2c2c] flex items-center justify-center transition-colors cursor-pointer border-none"
          aria-label="Back to home"
          type="button"
        >
          <FaArrowLeft className="w-4 h-4 text-white" />
        </button>
        <h1 className="text-[28px] font-semibold tracking-tight">Settings</h1>
      </div>

      <div className="flex-1 px-6 pb-24 overflow-y-auto scrollbar-none">
        {/* General Section */}
        <div className="mb-8">
          <h2 className="text-[#8e8e93] text-sm font-medium mb-4 px-1">
            General
          </h2>
          <div className="flex flex-col gap-1">
            <div
              className="flex items-center justify-between p-3 active:bg-[#2C2C2E] rounded-xl cursor-pointer transition-colors"
              onClick={openWalletModal}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#6A59CE] flex items-center justify-center">
                  <FaWallet className="w-4 h-4 text-black" />
                </div>
                <span className="text-[16px] font-medium">Edit wallet</span>
              </div>
              <FaChevronRight className="w-5 h-5 text-gray-400" />
            </div>

            <div
              className="flex items-center justify-between p-3 active:bg-[#2C2C2E] rounded-xl cursor-pointer transition-colors"
              onClick={() => setIsExportModalOpen(true)}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#7c5cfc] flex items-center justify-center">
                  <FaDownload className="w-4 h-4 text-black" />
                </div>
                <span className="text-[16px] font-medium">Export wallet</span>
              </div>
              <FaChevronRight className="w-5 h-5 text-gray-400" />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#25AD3E] flex items-center justify-center">
                  <FaMoon className="w-4 h-4 text-black" />
                </div>
                <span className="text-[16px] font-medium">Dark mode</span>
              </div>
              <CustomSwitch
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
            </div>

            <div
              className="flex items-center justify-between p-3 active:bg-[#2C2C2E] rounded-xl cursor-pointer transition-colors"
              onClick={openNotificationModal}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#EE9C2E] flex items-center justify-center">
                  <FaBell className="w-4 h-4 text-black" />
                </div>
                <span className="text-[16px] font-medium">Notification</span>
              </div>
              <FaChevronRight className="w-5 h-5 text-gray-400" />
            </div>

            <div
              className="flex items-center justify-between p-3 active:bg-[#2C2C2E] rounded-xl cursor-pointer transition-colors"
              onClick={() => router.push("/settings/address-book")}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#1969FE] flex items-center justify-center">
                  <FaAddressBook className="w-4 h-4 text-black" />
                </div>
                <span className="text-[16px] font-medium">Address book</span>
              </div>
              <FaChevronRight className="w-5 h-5 text-gray-400" />
            </div>

            <div
              className="flex items-center justify-between p-3 active:bg-[#2C2C2E] rounded-xl cursor-pointer transition-colors"
              onClick={() => router.push("/settings/price-limit")}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#FF2524] flex items-center justify-center">
                  <FaLock className="w-4 h-4 text-black" />
                </div>
                <span className="text-[16px] font-medium">Price Limit</span>
              </div>
              <FaChevronRight className="w-5 h-5 text-gray-400" />
            </div>

            <div
              className="flex items-center justify-between p-3 active:bg-[#2C2C2E] rounded-xl cursor-pointer transition-colors"
              onClick={() => router.push("/settings/forgot-pin")}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#FF2E9B] flex items-center justify-center">
                  <FaKey className="w-4 h-4 text-black" />
                </div>
                <span className="text-[16px] font-medium">Forgot Pin</span>
              </div>
              <FaChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* About Section */}
        <div>
          <h2 className="text-[#8e8e93] text-sm font-medium mb-4 px-1">
            About
          </h2>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between p-3 active:bg-[#2C2C2E] rounded-xl cursor-pointer transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#25AD3E] flex items-center justify-center">
                  <FaHeadset className="w-4 h-4 text-black" />
                </div>
                <span className="text-[16px] font-medium">Contact support</span>
              </div>
              <FaChevronRight className="w-5 h-5 text-gray-400" />
            </div>

            <div className="flex items-center justify-between p-3 active:bg-[#2C2C2E] rounded-xl cursor-pointer transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#FF2E9B] flex items-center justify-center">
                  <FaTwitter className="w-4 h-4 text-black" />
                </div>
                <span className="text-[16px] font-medium">Follow @JumpaHQ</span>
              </div>
              <FaChevronRight className="w-5 h-5 text-gray-400" />
            </div>

            <div
              className="flex items-center justify-between p-3 active:bg-[#2C2C2E] rounded-xl cursor-pointer transition-colors"
              onClick={() => setIsSignOutModalOpen(true)}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#EE9C2E] flex items-center justify-center">
                  <FaSignOutAlt className="w-4 h-4 text-black" />
                </div>
                <span className="text-[16px] font-medium">Sign out</span>
              </div>
              <FaChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <WalletEditModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        walletName={walletName}
        tempName={tempName}
        editingName={editingName}
        setTempName={setTempName}
        setEditingName={setEditingName}
        onSave={handleSaveWallet}
      />

      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notificationsEnabled={notifications}
        setNotificationsEnabled={setNotifications}
      />

      <SignOutModal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        onConfirm={handleConfirmSignOut}
      />

      <ExportWalletModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}
