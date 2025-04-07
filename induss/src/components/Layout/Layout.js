import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import Navigation from '../Navigation/Navigation';
import NotificationBell from '../common/NotificationBell';
import { useAppContext } from '../../context/AppContext';
import './Layout.css';

const Layout = ({ children }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();
  const { user } = useAppContext();
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Get page title based on current route
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Tableau de Bord';
      case '/machine-control':
        return 'Contrôle des Machines';
      case '/history':
        return 'Historique';
      case '/admin':
        return 'Administration';
      default:
        return 'IndusTech';
    }
  };

  return (
    <div className="layout-container">
      <Navigation />
      
      <div className="main-content">
        <header className="main-header">
          <div className="header-left">
            <h1 className="current-page-title">{getPageTitle()}</h1>
          </div>
          
          <div className="header-right">
            <NotificationBell />
            
            <div className="user-profile">
              <div className="user-avatar">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="user-info">
                <div className="user-name">{user?.name || 'User'}</div>
                <div className="user-role">{user?.role || 'Admin'}</div>
              </div>
            </div>
          </div>
        </header>
        
        <main className="content">
          {children}
        </main>
        
        <footer className="main-footer">
          <div className="footer-content">
            © {new Date().getFullYear()} IndusTech - Industrial Monitoring Dashboard
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout; 