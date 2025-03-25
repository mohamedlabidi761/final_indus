import React, { useState, useEffect, useRef } from 'react';
import { BsBell, BsBellFill } from 'react-icons/bs';
import './NotificationBell.css';
import { useAppContext } from '../../context/AppContext';

const NotificationBell = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { notifications, markNotificationAsRead, clearAllNotifications } = useAppContext();
  const dropdownRef = useRef(null);

  // Count unread notifications
  const unreadCount = notifications.filter(notification => !notification.read).length;

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to format timestamp as relative time (e.g. "2 min ago")
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'critical':
        return <span className="notification-icon critical">❗</span>;
      case 'warning':
        return <span className="notification-icon warning">⚠️</span>;
      case 'success':
        return <span className="notification-icon success">✅</span>;
      default:
        return <span className="notification-icon info">ℹ️</span>;
    }
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <div 
        className={`notification-bell ${showDropdown ? 'notification-bell-active' : ''}`}
        onClick={() => setShowDropdown(!showDropdown)}
      >
        {unreadCount > 0 ? <BsBellFill /> : <BsBell />}
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </div>
      
      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {notifications.length > 0 && (
              <button 
                className="clear-all-btn"
                onClick={() => clearAllNotifications()}
              >
                Clear All
              </button>
            )}
          </div>
          
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => markNotificationAsRead(notification.id)}
                >
                  {getNotificationIcon(notification.type)}
                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <span className="notification-time">
                      {formatTimeAgo(notification.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {notifications.length > 5 && (
            <div className="notification-footer">
              <button className="view-all-btn">View All</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 