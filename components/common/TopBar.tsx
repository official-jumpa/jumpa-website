import React from 'react';
import './TopBar.css';
const hamburgerIcon = '/assets/icons/actions/hamburger.svg';
const settingsIcon = '/assets/icons/actions/settings.svg';
const notificationIcon = '/assets/icons/actions/notification.svg';
const userAvatar = '/assets/images/avatars/user-default.svg';

interface TopBarProps {
  onMenuClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <button className="icon-btn icon-btn--plain" onClick={onMenuClick} aria-label="Menu" type="button">
          <img src={hamburgerIcon} alt="" className="icon-image icon-image--hamburger" />
        </button>
        <div className="user-avatar">
          <img src={userAvatar} alt="User" />
        </div>
      </div>
      <div className="top-bar-right">
        <button className="icon-btn icon-btn--surface" aria-label="Settings" type="button">
          <img src={settingsIcon} alt="" className="icon-image icon-image--settings" />
        </button>
        <button className="icon-btn icon-btn--surface" aria-label="Notifications" type="button">
          <img src={notificationIcon} alt="" className="icon-image icon-image--notification" />
        </button>
      </div>
    </div>
  );
};

export default TopBar;
