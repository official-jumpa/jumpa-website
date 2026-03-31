import React from 'react';
import './Modals.css';
const closeIcon = '/assets/icons/actions/close.svg';
const virtualGraphic = '/assets/images/illustrations/virtual-account-graphic.svg';


interface VirtualAccountModalProps {
  onClose: () => void;
}

const VirtualAccountModal: React.FC<VirtualAccountModalProps> = ({ onClose }) => {
  return (
    <div className="virtual-modal-card" onClick={(e) => e.stopPropagation()}>
      <button className="virtual-close" onClick={onClose} aria-label="Close" type="button">
        <img src={closeIcon} alt="" width="11.72" height="11.72" />
      </button>

      <div className="virtual-modal-content">
        <div className="virtual-graphic">
          <img src={virtualGraphic} alt="Virtual Account" />
        </div>
        <p className="virtual-modal-desc">
          Get a virtual account to send, store and receive money on your Jumpa wallet.
        </p>
        <button className="virtual-modal-cta" type="button">
          Continue
        </button>
      </div>
    </div>
  );
};

export default VirtualAccountModal;
