const sendIcon = "/send.svg";
const receiveIcon = "/receive.svg";
const swapIcon = "/swap.svg";

interface QuickActionRowProps {
  onSend?: () => void;
  onReceive?: () => void;
  onSwap?: () => void;
}

const QuickActionRow: React.FC<QuickActionRowProps> = ({
  onSend,
  onReceive,
  onSwap,
}) => {
  const actions = [
    { label: "Send", icon: sendIcon, action: onSend },
    { label: "Receive", icon: receiveIcon, action: onReceive },
    { label: "Dex", icon: swapIcon, action: onSwap },
  ];

  return (
    <div className="w-full flex gap-[6px] justify-center">
      {actions.map((a) => (
        <button
          key={a.label}
          className="flex-1 min-w-0 h-[60px] flex items-center gap-3 justify-center p-[15px] bg-[#2d2d2d] border-none rounded-[14px] text-[#b7b7be] text-base font-medium font-sans cursor-pointer transition-all duration-150 hover:bg-[#353535] hover:text-[#f3f3f5] active:scale-[0.97]"
          type="button"
          onClick={a.action}
        >
          <span>{a.label}</span>
          <img src={a.icon} alt="" width="16" height="16" />
        </button>
      ))}
    </div>
  );
};

export default QuickActionRow;
