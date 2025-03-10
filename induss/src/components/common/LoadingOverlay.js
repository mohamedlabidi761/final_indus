import React from 'react';
import { Spinner } from 'react-bootstrap';
import { useAppContext } from '../../context/AppContext';
import './LoadingOverlay.css';

const LoadingOverlay = () => {
  const { isLoading } = useAppContext();

  if (!isLoading) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Chargement en cours...</p>
      </div>
    </div>
  );
};

export default LoadingOverlay; 