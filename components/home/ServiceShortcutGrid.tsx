"use client"
import { useState } from "react";
import { useNavigate } from "@/lib/pages-adapter";

const dataIcon = "/data.svg";
const groupIcon = "/group.svg";
const airtimeIcon = "/airtime.svg";
const moreIcon = "/more.svg";
const predictionIcon = "/prediction.svg";
const billsIcon = "/bills.svg";

interface ServiceItem {
  label: string;
  icon: string;
  isMore?: boolean;
  route?: string;
}

const homeServices: ServiceItem[] = [
  { label: "Data", icon: dataIcon, route: "/home/airtime" },
  { label: "Group", icon: groupIcon, route: "/group/chat" },
  { label: "Airtime", icon: airtimeIcon, route: "/home/airtime" },
  { label: "More", icon: moreIcon, isMore: true },
];

const allServices: ServiceItem[] = [
  { label: "Data", icon: dataIcon, route: "/home/airtime" },
  { label: "Group", icon: groupIcon, route: "/group/chat" },
  { label: "Airtime", icon: airtimeIcon, route: "/home/airtime" },
  { label: "Prediction", icon: predictionIcon, route: "/home/3rikeAi" },
  { label: "Bills", icon: billsIcon, route: "/home/savings" },
];

interface ServiceShortcutGridProps {
  onWithdraw?: () => void;
  onDApp?: () => void;
}

const ServiceShortcutGrid: React.FC<ServiceShortcutGridProps> = ({
  onWithdraw,
  onDApp,
}) => {
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  const handleServiceClick = (service: ServiceItem) => {
    if (service.isMore) {
      setShowAll(true);
      return;
    }
    if (service.route) {
      navigate(service.route);
    }
  };

  const handleAllServiceClick = (service: ServiceItem) => {
    if (service.label === "DApp" && onDApp) {
      onDApp();
    } else if (service.label === "Withdraw" && onWithdraw) {
      onWithdraw();
    } else if (service.route) {
      setShowAll(false);
      navigate(service.route);
    }
  };

  return (
    <>
      <div className="w-full h-24 flex items-center justify-around bg-[#2d2d2d] rounded-2xl px-4">
        {homeServices.map((s) => (
          <button
            key={s.label}
            className="group flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer p-1 font-sans"
            onClick={() => handleServiceClick(s)}
            type="button"
          >
            <img src={s.icon} alt="" className="w-12 h-12 transition-transform duration-150 group-hover:scale-[1.08]" />
            <span className="text-[11px] text-[#b7b7be] font-medium">{s.label}</span>
          </button>
        ))}
      </div>

      {showAll && (
        <div className="fixed inset-0 bg-black/45 z-100 flex items-center justify-center animate-[fadeIn_0.25s_ease_forwards]" onClick={() => setShowAll(false)}>
          <div className="w-[90%] max-w-[340px] bg-[#1f1f1f] rounded-[24px] p-6 animate-[slideUp_0.35s_cubic-bezier(0.4,0,0.2,1)_forwards]" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[17px] font-bold text-[#f3f3f5]">All Services</h3>
              <button
                className="w-8 h-8 rounded-full bg-[#252525] border-none text-[#b7b7be] text-base cursor-pointer flex items-center justify-center transition-colors duration-150 hover:bg-[#2b2b2b]"
                onClick={() => setShowAll(false)}
                type="button"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-4 gap-5">
              {allServices.map((s) => (
                <button
                  key={s.label}
                  className="group flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer p-1 font-sans"
                  type="button"
                  onClick={() => handleAllServiceClick(s)}
                >
                  <img src={s.icon} alt="" className="w-12 h-12 transition-transform duration-150 group-hover:scale-[1.08]" />
                  <span className="text-[11px] text-[#b7b7be] font-medium">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ServiceShortcutGrid;
