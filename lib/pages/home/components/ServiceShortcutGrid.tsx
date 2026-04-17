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
      <div className="service-grid">
        {homeServices.map((s) => (
          <button
            key={s.label}
            className="service-item"
            onClick={() => handleServiceClick(s)}
            type="button"
          >
            <img src={s.icon} alt="" className="service-icon" />
            <span className="service-label">{s.label}</span>
          </button>
        ))}
      </div>

      {showAll && (
        <div className="services-overlay" onClick={() => setShowAll(false)}>
          <div className="services-screen" onClick={(e) => e.stopPropagation()}>
            <div className="services-screen-header">
              <h3>All Services</h3>
              <button
                className="services-close"
                onClick={() => setShowAll(false)}
                type="button"
              >
                ✕
              </button>
            </div>
            <div className="services-screen-grid">
              {allServices.map((s) => (
                <button
                  key={s.label}
                  className="service-item"
                  type="button"
                  onClick={() => handleAllServiceClick(s)}
                >
                  <img src={s.icon} alt="" className="service-icon" />
                  <span className="service-label">{s.label}</span>
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
