import React, { useState } from 'react';
import { Table, Card, Form, InputGroup, Button, Badge, Row, Col, Tabs, Tab } from 'react-bootstrap';
import { FaSearch, FaFilter, FaDownload, FaHistory, FaBell } from 'react-icons/fa';
import { useAppContext } from '../../context/AppContext';
import './History.css';

const History = () => {
  const { history, alerts, machines, formatTimestamp } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMachine, setFilterMachine] = useState('all');
  const [activeTab, setActiveTab] = useState('events');
  
  // Filter history based on search term and machine filter
  const filteredHistory = history.filter(entry => {
    const matchesSearch = entry.event.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMachine = filterMachine === 'all' || entry.machineId === parseInt(filterMachine);
    return matchesSearch && matchesMachine;
  });
  
  // Filter alerts based on search term and machine filter
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMachine = filterMachine === 'all' || alert.machineId === parseInt(filterMachine);
    return matchesSearch && matchesMachine;
  });
  
  // Get alert type badge
  const getAlertBadge = (type) => {
    switch(type) {
      case 'danger': return <Badge bg="danger">Critique</Badge>;
      case 'warning': return <Badge bg="warning">Attention</Badge>;
      case 'info': return <Badge bg="info">Information</Badge>;
      default: return <Badge bg="secondary">Autre</Badge>;
    }
  };
  
  // Handle export to CSV
  const handleExport = () => {
    const dataToExport = activeTab === 'events' ? filteredHistory : filteredAlerts;
    
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add headers
    if (activeTab === 'events') {
      csvContent += "ID,Événement,Date/Heure,Machine,Utilisateur\n";
    } else {
      csvContent += "ID,Type,Message,Date/Heure,Machine\n";
    }
    
    // Add data rows
    dataToExport.forEach(item => {
      if (activeTab === 'events') {
        const machineName = item.machineId ? machines.find(m => m.id === item.machineId)?.name || '-' : '-';
        csvContent += `${item.id},"${item.event}","${formatTimestamp(item.timestamp)}","${machineName}","${item.user}"\n`;
      } else {
        const machineName = item.machineId ? machines.find(m => m.id === item.machineId)?.name || '-' : '-';
        csvContent += `${item.id},"${item.type}","${item.message}","${formatTimestamp(item.timestamp)}","${machineName}"\n`;
      }
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeTab === 'events' ? 'historique' : 'alertes'}_export.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
  };

  return (
    <div className="history-container">
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={6} lg={4}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            
            <Col md={6} lg={4} className="mt-3 mt-md-0">
              <InputGroup>
                <InputGroup.Text>
                  <FaFilter />
                </InputGroup.Text>
                <Form.Select
                  value={filterMachine}
                  onChange={(e) => setFilterMachine(e.target.value)}
                >
                  <option value="all">Toutes les machines</option>
                  {machines.map(machine => (
                    <option key={machine.id} value={machine.id}>
                      {machine.name}
                    </option>
                  ))}
                </Form.Select>
              </InputGroup>
            </Col>
            
            <Col lg={4} className="mt-3 mt-lg-0 text-end">
              <Button 
                variant="outline-primary" 
                onClick={handleExport}
                className="d-inline-flex align-items-center gap-2"
              >
                <FaDownload />
                Exporter CSV
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4 history-tabs"
      >
        <Tab eventKey="events" title={<span><FaHistory className="me-2" />Événements</span>}>
          <Card className="shadow-sm">
            <Card.Body>
              <Table responsive hover className="history-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Événement</th>
                    <th>Date/Heure</th>
                    <th>Machine</th>
                    <th>Utilisateur</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        Aucun événement trouvé
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map(entry => (
                      <tr key={entry.id}>
                        <td>{entry.id}</td>
                        <td>{entry.event}</td>
                        <td>{formatTimestamp(entry.timestamp)}</td>
                        <td>
                          {entry.machineId ? 
                            machines.find(m => m.id === entry.machineId)?.name || '-' : 
                            '-'}
                        </td>
                        <td>{entry.user}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="alerts" title={<span><FaBell className="me-2" />Alertes</span>}>
          <Card className="shadow-sm">
            <Card.Body>
              <Table responsive hover className="history-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Message</th>
                    <th>Date/Heure</th>
                    <th>Machine</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlerts.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        Aucune alerte trouvée
                      </td>
                    </tr>
                  ) : (
                    filteredAlerts.map(alert => (
                      <tr key={alert.id} className={alert.type === 'danger' ? 'table-danger' : alert.type === 'warning' ? 'table-warning' : ''}>
                        <td>{alert.id}</td>
                        <td>{getAlertBadge(alert.type)}</td>
                        <td>{alert.message}</td>
                        <td>{formatTimestamp(alert.timestamp)}</td>
                        <td>
                          {alert.machineId ? 
                            machines.find(m => m.id === alert.machineId)?.name || '-' : 
                            '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};

export default History; 