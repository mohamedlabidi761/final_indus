import React from 'react';
import { Alert } from 'react-bootstrap';

const ErrorMessage = ({ message, onDismiss, variant = 'danger' }) => {
  return (
    <Alert variant={variant} onClose={onDismiss} dismissible>
      <Alert.Heading>Une erreur est survenue</Alert.Heading>
      <p>{message || "Une erreur inattendue s'est produite. Veuillez réessayer plus tard."}</p>
    </Alert>
  );
};

export default ErrorMessage; 