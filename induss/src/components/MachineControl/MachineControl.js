import React, { useState } from 'react';
import { Table, Button, Badge, Card, Row, Col, Form, ProgressBar, Alert } from 'react-bootstrap';
import { FaPlay, FaStop, FaTools, FaInfoCircle, FaHistory } from 'react-icons/fa';
import { BsThermometerHalf, BsDroplet, BsLightningCharge } from 'react-icons/bs';
import { useAppContext } from '../../context/AppContext';
import './MachineControl.css';

const MachineControl = () => {
  const { machines, toggleMachineStatus, isLoading, addAlert } = useAppContext();
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [maintenanceNote, setMaintenanceNote] = useState('');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const handleSelectMachine = (machine) => {
    setSelectedMachine(machine);
  };

  const handleStartStop = (id) => {
    toggleMachineStatus(id);
  };

  const handleMaintenanceRequest = (machine) => {
    setSelectedMachine(machine);
    setShowMaintenanceModal(true);
  };

  const handleSubmitMaintenance = (e) => {
    e.preventDefault();
    
    // Add maintenance alert
    addAlert({
      type: 'info',
      message: `Maintenance programmée - ${selectedMachine.name}`,
      machineId: selectedMachine.id,
      icon: 'tools'
    });
    
    // Reset form
    setMaintenanceNote('');
    setShowMaintenanceModal(false);
    
    // Show success alert
    setShowSuccessAlert(true);
    setTimeout(() => setShowSuccessAlert(false), 3000);
  };

  const getStatusVariant = (status) => {
    switch(status) {
      case 'normal': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <div className="machine-control-container">
      {showSuccessAlert && (
        <Alert 
          variant="success" 
          className="maintenance-alert"
          onClose={() => setShowSuccessAlert(false)} 
          dismissible
        >
          Demande de maintenance enregistrée avec succès !
        </Alert>
      )}
      
      <Row className="g-4">
        <Col lg={8}>
          <Card className="shadow-lg">
            <Card.Header className="bg-light d-flex justify-content-between align-items-center">
              <h2 className="mb-0 fs-4">Contrôle des Machines</h2>
            </Card.Header>
            <Card.Body>
              <Table responsive hover className="machine-table">
                <thead className="bg-light">
                  <tr>
                    <th>ID</th>
                    <th>Nom</th>
                    <th>Statut</th>
                    <th>État</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {machines.map(machine => (
                    <tr 
                      key={machine.id} 
                      className={machine.status === 'critical' ? 'table-danger' : machine.status === 'warning' ? 'table-warning' : ''}
                      onClick={() => handleSelectMachine(machine)}
                    >
                      <td>{machine.id}</td>
                      <td>{machine.name}</td>
                      <td>
                        <Badge 
                          pill 
                          bg={machine.isRunning ? 'success' : 'danger'}
                          className="p-2"
                        >
                          {machine.isRunning ? 'En marche' : 'Arrêtée'}
                        </Badge>
                      </td>
                      <td>
                        <Badge 
                          pill 
                          bg={getStatusVariant(machine.status)}
                          className={`p-2 ${machine.status === 'critical' ? 'pulse' : ''}`}
                        >
                          {machine.status === 'normal' ? 'Normal' : 
                           machine.status === 'warning' ? 'Attention' : 'Critique'}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button 
                            variant={machine.isRunning ? 'outline-danger' : 'outline-success'}
                            onClick={() => handleStartStop(machine.id)}
                            className="d-flex align-items-center gap-2"
                            size="sm"
                            disabled={isLoading || (machine.status === 'critical' && !machine.isRunning)}
                          >
                            {machine.isRunning ? <FaStop /> : <FaPlay />}
                            {machine.isRunning ? 'Arrêter' : 'Démarrer'}
                          </Button>
                          
                          <Button 
                            variant="outline-primary"
                            size="sm"
                            className="d-flex align-items-center gap-2"
                            onClick={() => handleMaintenanceRequest(machine)}
                          >
                            <FaTools />
                            Maintenance
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          {selectedMachine ? (
            <Card className="shadow-lg machine-details">
              <Card.Header className="bg-light">
                <h3 className="mb-0 fs-5">Détails de {selectedMachine.name}</h3>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-3">
                  <Badge 
                    pill 
                    bg={selectedMachine.isRunning ? 'success' : 'danger'}
                    className="p-2"
                  >
                    {selectedMachine.isRunning ? 'En marche' : 'Arrêtée'}
                  </Badge>
                  <Badge 
                    pill 
                    bg={getStatusVariant(selectedMachine.status)}
                    className="p-2"
                  >
                    {selectedMachine.status === 'normal' ? 'Normal' : 
                     selectedMachine.status === 'warning' ? 'Attention' : 'Critique'}
                  </Badge>
                </div>
                
                <div className="machine-stat mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <div className="d-flex align-items-center">
                      <BsThermometerHalf className="me-2" />
                      <span>Température</span>
                    </div>
                    <span className={selectedMachine.temperature > 40 ? 'text-danger' : 
                                     selectedMachine.temperature > 35 ? 'text-warning' : 'text-success'}>
                      {selectedMachine.temperature}°C
                    </span>
                  </div>
                  <ProgressBar 
                    now={Math.min(100, (selectedMachine.temperature / 50) * 100)} 
                    variant={selectedMachine.temperature > 40 ? 'danger' : 
                             selectedMachine.temperature > 35 ? 'warning' : 'success'} 
                  />
                </div>
                
                <div className="machine-stat mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <div className="d-flex align-items-center">
                      <BsDroplet className="me-2" />
                      <span>Humidité</span>
                    </div>
                    <span>{selectedMachine.humidity}%</span>
                  </div>
                  <ProgressBar now={selectedMachine.humidity} variant="info" />
                </div>
                
                <div className="machine-stat mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <div className="d-flex align-items-center">
                      <BsLightningCharge className="me-2" />
                      <span>Vibration</span>
                    </div>
                    <span className={selectedMachine.vibration > 2.0 ? 'text-danger' : 
                                     selectedMachine.vibration > 1.0 ? 'text-warning' : 'text-success'}>
                      {selectedMachine.vibration}g
                    </span>
                  </div>
                  <ProgressBar 
                    now={Math.min(100, (selectedMachine.vibration / 3) * 100)} 
                    variant={selectedMachine.vibration > 2.0 ? 'danger' : 
                             selectedMachine.vibration > 1.0 ? 'warning' : 'success'} 
                  />
                </div>
                
                <div className="machine-stat mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <div className="d-flex align-items-center">
                      <FaInfoCircle className="me-2" />
                      <span>Efficacité</span>
                    </div>
                    <span>{selectedMachine.efficiency}%</span>
                  </div>
                  <ProgressBar now={selectedMachine.efficiency} variant="primary" />
                </div>
                
                <div className="machine-maintenance mt-4">
                  <h5 className="mb-3">Maintenance</h5>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Dernière maintenance:</span>
                    <span>{selectedMachine.lastMaintenance}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span>Prochaine maintenance:</span>
                    <span>{selectedMachine.nextMaintenance}</span>
                  </div>
                  
                  <div className="d-grid gap-2">
                    <Button 
                      variant="primary"
                      className="d-flex align-items-center justify-content-center gap-2"
                      onClick={() => handleMaintenanceRequest(selectedMachine)}
                    >
                      <FaTools />
                      Demander une maintenance
                    </Button>
                    
                    <Button 
                      variant="outline-secondary"
                      className="d-flex align-items-center justify-content-center gap-2"
                    >
                      <FaHistory />
                      Historique des maintenances
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          ) : (
            <Card className="shadow-lg h-100 d-flex justify-content-center align-items-center">
              <Card.Body className="text-center text-muted">
                <FaInfoCircle size={40} className="mb-3" />
                <p>Sélectionnez une machine pour voir les détails</p>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
      
      {showMaintenanceModal && selectedMachine && (
        <div className="maintenance-modal-backdrop">
          <div className="maintenance-modal">
            <div className="maintenance-modal-header">
              <h4>Demande de maintenance - {selectedMachine.name}</h4>
              <button 
                className="btn-close" 
                onClick={() => setShowMaintenanceModal(false)}
                aria-label="Close"
              ></button>
            </div>
            <div className="maintenance-modal-body">
              <Form onSubmit={handleSubmitMaintenance}>
                <Form.Group className="mb-3">
                  <Form.Label>Type de maintenance</Form.Label>
                  <Form.Select required>
                    <option value="">Sélectionnez un type</option>
                    <option value="preventive">Maintenance préventive</option>
                    <option value="corrective">Maintenance corrective</option>
                    <option value="emergency">Maintenance d'urgence</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Priorité</Form.Label>
                  <Form.Select required>
                    <option value="">Sélectionnez une priorité</option>
                    <option value="low">Basse</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                    <option value="critical">Critique</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Date souhaitée</Form.Label>
                  <Form.Control type="date" required />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={3} 
                    value={maintenanceNote}
                    onChange={(e) => setMaintenanceNote(e.target.value)}
                    placeholder="Décrivez le problème ou les besoins de maintenance..."
                  />
                </Form.Group>
                
                <div className="d-flex justify-content-end gap-2">
                  <Button 
                    variant="secondary" 
                    onClick={() => setShowMaintenanceModal(false)}
                  >
                    Annuler
                  </Button>
                  <Button variant="primary" type="submit">
                    Soumettre la demande
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MachineControl;