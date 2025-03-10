import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import Navigation from '../Navigation/Navigation';
import './Layout.css';

const Layout = ({ children }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();
  
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
      case '/settings':
        return 'Paramètres';
      default:
        return 'IndusTech';
    }
  };

  return (
    <div className="layout-wrapper">
      <Navigation />
      
      <div className="content-wrapper">
        <Container fluid className="main-content">
          <div className="page-header">
            <h1 className="page-title">{getPageTitle()}</h1>
            <div className="page-actions">
              {/* Page-specific actions can be added here */}
            </div>
          </div>
          
          {children}
        </Container>
      </div>
    </div>
  );
};

export default Layout; 