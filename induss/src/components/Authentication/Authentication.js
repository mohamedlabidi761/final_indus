import React from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import './Authentication.css';

const Authentication = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle authentication
  };

  return (
    <div className="auth-container">
      <Card className="auth-card shadow-lg">
        <Card.Body>
          <h2 className="text-center mb-4">Connexion</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nom d'utilisateur</Form.Label>
              <Form.Control
                type="text"
                placeholder="Entrez votre nom d'utilisateur"
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Mot de passe</Form.Label>
              <Form.Control
                type="password"
                placeholder="Entrez votre mot de passe"
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
              Se connecter
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Authentication; 