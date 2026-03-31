import React from 'react';
const sendIcon = '/send.svg';
const receiveIcon = '/receive.svg';
const swapIcon = '/swap.svg';

interface QuickActionRowProps {
  onSend?: () => void;
  onReceive?: () => void;
  onSwap?: () => void;
}

const QuickActionRow: React.FC<QuickActionRowProps> = ({ onSend, onReceive, onSwap }) => {
  const actions = [
    { label: 'Send', icon: sendIcon, action: onSend },
    { label: 'Receive', icon: receiveIcon, action: onReceive },
    { label: 'Swap', icon: swapIcon, action: onSwap },
  ];

  return (
    <div className="quick-actions">
      {actions.map((a) => (
        <button key={a.label} className="quick-action-btn" type="button" onClick={a.action}>
          <span>{a.label}</span>
          <img src={a.icon} alt="" width="16" height="16" />
        </button>
      ))}
    </div>
  );
};

export default QuickActionRow;
