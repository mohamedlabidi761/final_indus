import React, { useState, useEffect } from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { 
  BsSpeedometer2, 
  BsGear, 
  BsClockHistory, 
  BsPersonGear,
  BsToggleOn,
  BsX,
  BsSun,
  BsMoon
} from 'react-icons/bs'; 
import { FaBars, FaIndustry } from 'react-icons/fa';
import './Navigation.css';

const Navigation = () => {
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth <= 768);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const location = useLocation();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      if (mobile) {
        // Always start collapsed on mobile
        setIsCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Effect to handle body overflow when nav is open on mobile
  useEffect(() => {
    if (isMobile && !isCollapsed) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isCollapsed]);
  
  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('darkMode', 'false');
    }
    
    return () => {
      // Cleanup
      document.body.classList.remove('dark-mode');
    };
  }, [darkMode]);

  const toggleNav = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsHovered(false);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const closeNav = () => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`nav-overlay ${!isCollapsed && isMobile ? 'active' : ''}`} 
        onClick={closeNav}
      ></div>
      
      {/* Mobile Hamburger Button */}
      {isMobile && (
        <button 
          className="hamburger-btn" 
          onClick={toggleNav} 
          aria-label={isCollapsed ? "Open menu" : "Close menu"}
        >
          {isCollapsed ? <FaBars /> : <BsX />}
        </button>
      )}
      
      {/* Side Navigation */}
      <div
        className={`side-nav ${isCollapsed ? 'collapsed' : ''} ${isHovered ? 'hovered' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="nav-header">
          <div className="nav-logo">
            <FaIndustry className="nav-logo-icon" />
            <span className="nav-logo-text">IndusTech</span>
          </div>
          {isMobile && !isCollapsed && (
            <button 
              className="close-nav-btn" 
              onClick={closeNav}
              aria-label="Close menu"
            >
              <BsX />
            </button>
          )}
        </div>
        
        <div className="mode-toggle-wrapper">
          <div className="mode-toggle" onClick={toggleDarkMode} aria-label="Toggle dark mode">
            {darkMode ? <BsSun /> : <BsMoon />}
            <span className="mode-toggle-text">{darkMode ? 'Clair' : 'Sombre'}</span>
          </div>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Principal</div>
          <Nav className="flex-column">
            <Nav.Link 
              as={Link} 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
              onClick={closeNav}
            >
              <BsSpeedometer2 className="nav-icon" />
              <span className="nav-text">Tableau de Bord</span>
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/machine-control" 
              className={`nav-link ${isActive('/machine-control') ? 'active' : ''}`}
              onClick={closeNav}
            >
              <BsGear className="nav-icon" />
              <span className="nav-text">Contrôle Machines</span>
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/history" 
              className={`nav-link ${isActive('/history') ? 'active' : ''}`}
              onClick={closeNav}
            >
              <BsClockHistory className="nav-icon" />
              <span className="nav-text">Historique</span>
            </Nav.Link>
          </Nav>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Administration</div>
          <Nav className="flex-column">
            <Nav.Link 
              as={Link} 
              to="/admin" 
              className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
              onClick={closeNav}
            >
              <BsPersonGear className="nav-icon" />
              <span className="nav-text">Gestion Admin</span>
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/settings" 
              className={`nav-link ${isActive('/settings') ? 'active' : ''}`}
              onClick={closeNav}
            >
              <BsToggleOn className="nav-icon" />
              <span className="nav-text">Paramètres</span>
            </Nav.Link>
          </Nav>
        </div>
      </div>
    </>
  );
};

export default Navigation; 