import React, { useState } from 'react';
import { Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { BsGear, BsBell, BsShield, BsGlobe, BsPersonCircle } from 'react-icons/bs';
import './Settings.css';

const Settings = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    language: 'fr',
    dataRefreshRate: '30',
    securityLevel: 'medium'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save settings logic would go here
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  return (
    <div className="settings-container">
      {showAlert && (
        <Alert variant="success" className="settings-alert">
          Paramètres enregistrés avec succès!
        </Alert>
      )}
      
      <Row className="g-4">
        <Col lg={3} md={4}>
          <Card className="settings-nav">
            <Card.Body>
              <div className="settings-nav-title">Paramètres</div>
              <div className="settings-nav-items">
                <a href="#general" className="settings-nav-item active">
                  <BsGear className="settings-nav-icon" />
                  <span>Général</span>
                </a>
                <a href="#notifications" className="settings-nav-item">
                  <BsBell className="settings-nav-icon" />
                  <span>Notifications</span>
                </a>
                <a href="#security" className="settings-nav-item">
                  <BsShield className="settings-nav-icon" />
                  <span>Sécurité</span>
                </a>
                <a href="#language" className="settings-nav-item">
                  <BsGlobe className="settings-nav-icon" />
                  <span>Langue</span>
                </a>
                <a href="#profile" className="settings-nav-item">
                  <BsPersonCircle className="settings-nav-icon" />
                  <span>Profil</span>
                </a>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={9} md={8}>
          <Form onSubmit={handleSubmit}>
            <div className="content-card" id="general">
              <h2 className="content-section-title">Paramètres Généraux</h2>
              
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Taux de rafraîchissement des données</Form.Label>
                    <Form.Select 
                      name="dataRefreshRate" 
                      value={settings.dataRefreshRate}
                      onChange={handleChange}
                    >
                      <option value="10">10 secondes</option>
                      <option value="30">30 secondes</option>
                      <option value="60">1 minute</option>
                      <option value="300">5 minutes</option>
                    </Form.Select>
                    <Form.Text className="text-muted">
                      Fréquence de mise à jour des données en temps réel
                    </Form.Text>
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Thème</Form.Label>
                    <div className="d-flex align-items-center mt-2">
                      <Form.Check 
                        type="switch"
                        id="darkMode"
                        name="darkMode"
                        label="Mode sombre"
                        checked={settings.darkMode}
                        onChange={handleChange}
                      />
                    </div>
                    <Form.Text className="text-muted">
                      Activer le mode sombre pour réduire la fatigue oculaire
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            </div>
            
            <div className="content-card" id="notifications">
              <h2 className="content-section-title">Notifications</h2>
              
              <Form.Group className="mb-3">
                <Form.Check 
                  type="switch"
                  id="notifications"
                  name="notifications"
                  label="Activer les notifications"
                  checked={settings.notifications}
                  onChange={handleChange}
                />
                <Form.Text className="text-muted">
                  Recevoir des alertes pour les événements importants
                </Form.Text>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Check 
                  type="checkbox"
                  id="alertNotifications"
                  name="alertNotifications"
                  label="Alertes critiques"
                  defaultChecked
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Check 
                  type="checkbox"
                  id="warningNotifications"
                  name="warningNotifications"
                  label="Avertissements"
                  defaultChecked
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Check 
                  type="checkbox"
                  id="infoNotifications"
                  name="infoNotifications"
                  label="Informations"
                  defaultChecked
                />
              </Form.Group>
            </div>
            
            <div className="content-card" id="security">
              <h2 className="content-section-title">Sécurité</h2>
              
              <Form.Group className="mb-3">
                <Form.Label>Niveau de sécurité</Form.Label>
                <Form.Select 
                  name="securityLevel" 
                  value={settings.securityLevel}
                  onChange={handleChange}
                >
                  <option value="low">Bas</option>
                  <option value="medium">Moyen</option>
                  <option value="high">Élevé</option>
                </Form.Select>
              </Form.Group>
              
              <Button variant="outline-secondary" className="mt-2">
                Changer le mot de passe
              </Button>
            </div>
            
            <div className="content-card" id="language">
              <h2 className="content-section-title">Langue</h2>
              
              <Form.Group className="mb-3">
                <Form.Label>Langue de l'interface</Form.Label>
                <Form.Select 
                  name="language" 
                  value={settings.language}
                  onChange={handleChange}
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="de">Deutsch</option>
                </Form.Select>
              </Form.Group>
            </div>
            
            <div className="d-flex justify-content-end mt-4">
              <Button variant="secondary" className="me-2">
                Annuler
              </Button>
              <Button variant="primary" type="submit">
                Enregistrer les modifications
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default Settings; 