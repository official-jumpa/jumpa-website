import React from "react";
import { quickTransfers } from "@/data/quickTransfers";

const QuickTransferList: React.FC = () => {
  return (
    <div className="quick-transfer">
      <h3 className="section-title">Quick transfer</h3>
      <div className="transfer-list">
        {quickTransfers.map((c) => (
          <button key={c.id} className="transfer-item" type="button">
            <div className="transfer-avatar">
              <img src={c.avatar} alt={c.name} />
            </div>
            <span className="transfer-name">{c.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickTransferList;
