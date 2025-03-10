import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import './MachineStatus.css';

const MachineStatus = ({ machines }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'normal':
        return 'success';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'normal':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'critical':
        return '❌';
      default:
        return '';
    }
  };

  return (
    <Card className="machine-status-card">
      <Card.Body>
        <Card.Title>Statut des Machines</Card.Title>
        <div className="machine-list">
          {machines.map((machine, index) => (
            <div key={index} className={`machine-item ${machine.status}`}>
              <div className="machine-info">
                <span className="machine-name">{machine.name}</span>
                <Badge bg={getStatusColor(machine.status)}>
                  {getStatusIcon(machine.status)} {machine.status}
                </Badge>
              </div>
              {machine.status !== 'normal' && (
                <div className="machine-alert">
                  {machine.message}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

export default MachineStatus; 