import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ size = 'md', variant = 'primary', text = 'Chargement...' }) => {
  return (
    <div className="text-center my-4">
      <Spinner
        animation="border"
        role="status"
        variant={variant}
        size={size}
        className="mb-2"
      >
        <span className="visually-hidden">{text}</span>
      </Spinner>
      {text && <div className="mt-2 text-muted">{text}</div>}
    </div>
  );
};

export default LoadingSpinner; 