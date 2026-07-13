import React from "react";
import { useRouter } from "next/navigation";
const hamburgerIcon = "/assets/icons/actions/hamburger.svg";
const settingsIcon = "/assets/icons/actions/settings.svg";
const notificationIcon = "/assets/icons/actions/notification.svg";
const userAvatar = "/assets/images/avatars/user-default.svg";

interface TopBarProps {
  onMenuClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const router = useRouter();

  return (
    <div className="flex justify-between items-center px-6 pb-3 pt-15 bg-[#171717]">
      <div className="flex items-center gap-2">
        <button
          className="w-8 h-8 p-0 border-none cursor-pointer flex items-center justify-center rounded-full transition-all duration-150 ease-out active:opacity-[0.78] bg-transparent"
          onClick={onMenuClick}
          aria-label="Menu"
          type="button"
        >
          <img src={hamburgerIcon} alt="" className="block w-6.5 h-6.5" />
        </button>
        <div className="w-8 h-8 rounded-full overflow-hidden bg-[#252525] flex items-center justify-center">
          <img
            src={userAvatar}
            alt="User"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="w-8 h-8 p-0 border-none cursor-pointer flex items-center justify-center rounded-full transition-all duration-150 ease-out active:opacity-[0.78] bg-[#252525] hover:bg-[#2b2b2b]"
          aria-label="Settings"
          type="button"
          onClick={() => router.push("/settings")}
        >
          <img src={settingsIcon} alt="" className="block w-5.5 h-5.5" />
        </button>
        <button
          className="w-8 h-8 p-0 border-none cursor-pointer flex items-center justify-center rounded-full transition-all duration-150 ease-out active:opacity-[0.78] bg-[#252525] hover:bg-[#2b2b2b]"
          aria-label="Notifications"
          type="button"
        >
          <img src={notificationIcon} alt="" className="block w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default TopBar;
