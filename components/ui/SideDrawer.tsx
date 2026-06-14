import React from "react";
import { navItems } from "../../data/navItems";
const logoMarkImage = "/assets/logos/brand/jumpa-logo-mark.png";
const homeIcon = "/home.svg";
const homeActiveIcon = "/home.svg";
const dappIcon = "/dapps.svg";
const dappActiveIcon = "/dapps-active.svg";
const tradeIcon = "/trade.svg";
const tradeActiveIcon = "/trade-active.svg";

// Handle StaticImageData from next/image
const logoMark =
  typeof logoMarkImage === "string"
    ? logoMarkImage
    : (logoMarkImage as any).src || "/assets/logos/brand/jumpa-logo-mark.png";

const iconMap: Record<string, { inactive: string; active: string }> = {
  home: { inactive: homeIcon, active: homeActiveIcon },
  dapp: { inactive: dappIcon, active: dappActiveIcon },
  trade: { inactive: tradeIcon, active: tradeActiveIcon },
};

interface SideDrawerProps {
  isOpen: boolean;
  currentPage: string;
  onNavigate: (pageId: string) => void;
  onClose: () => void;
}

const SideDrawer: React.FC<SideDrawerProps> = ({
  isOpen,
  currentPage,
  onNavigate,
  onClose,
}) => {
  return (
    <div className={`@container absolute top-0 left-0 w-[260px] h-full bg-[#171717] z-100 transition-transform duration-350 ease-[cubic-bezier(0.4,0,0.2,1)] pt-[60px] px-6 pb-0 flex flex-col border-r border-[#34343a] ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logoMark} alt="Jumpa" className="w-10 h-10 rounded-lg" />
          <span className="font-bold text-white text-lg @xs:text-[22px]">Jumpa</span>
        </div>
        <button
          className="bg-white/8 border-none text-white w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-sm"
          onClick={onClose}
          aria-label="Close menu"
          type="button"
        >
          ✕
        </button>
      </div>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`flex items-center gap-3 py-3 px-4 rounded-[14px] bg-transparent border border-transparent font-sans font-medium cursor-pointer transition-all duration-150 text-left text-sm @xs:text-base hover:not-disabled:bg-white/4 disabled:opacity-50 disabled:cursor-not-allowed ${
              currentPage === item.id
                ? "bg-[rgba(124,92,252,0.15)] text-[#f3f3f5] !border-[rgba(124,92,252,0.3)]"
                : "text-[#b7b7be]"
            }`}
            onClick={() => item.enabled && onNavigate(item.id)}
            disabled={!item.enabled}
            type="button"
          >
            <img
              src={
                currentPage === item.id
                  ? iconMap[item.icon].active
                  : iconMap[item.icon].inactive
              }
              alt=""
              width="18"
              height="18"
              className={currentPage === item.id ? "opacity-100" : "opacity-70"}
            />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default SideDrawer;
