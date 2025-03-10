import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Badge, Container, Row, Col, Card, InputGroup, FormControl, Tabs, Tab, Alert } from 'react-bootstrap';
import { FaEdit, FaTrashAlt, FaSync, FaUser, FaFileExport, FaPlus, FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { machineService, workerService, checkApiConnection } from '../../utils/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import './AdminManagement.css';

const AdminManagement = () => {
  // State for machines and workers
  const [machines, setMachines] = useState([]);
  const [workers, setWorkers] = useState([]);
  
  // State for loading and errors
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State to track if we're in demo mode
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  // Debug state to track worker operations
  const [debugInfo, setDebugInfo] = useState({
    lastOperation: null,
    workerCount: 0,
    lastAddedWorker: null,
    apiResponse: null
  });

  // State for modals
  const [showMachineModal, setShowMachineModal] = useState(false);
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // State for selected items
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);

  // State for form data
  const [machineFormData, setMachineFormData] = useState({ name: '', type: '', status: 'operational', assignedWorker: '' });
  const [workerFormData, setWorkerFormData] = useState({ name: '', specialty: '', assignedMachines: [] });

  // State for sorting and filtering
  const [workerSort, setWorkerSort] = useState({ field: '_id', direction: 'asc' });
  const [workerFilter, setWorkerFilter] = useState('');
  const [timestamp, setTimestamp] = useState(new Date());

  // Add state for delete confirmation modal
  const [showDeleteWorkerModal, setShowDeleteWorkerModal] = useState(false);
  const [workerToDelete, setWorkerToDelete] = useState(null);

  // Add this with the other state variables
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch machines and workers on component mount
  useEffect(() => {
    const initializeComponent = async () => {
      setIsLoading(true);
      
      // Check API connection first
      const connectionStatus = await checkApiConnection();
      
      if (connectionStatus.connected) {
        // API is available, fetch data
        try {
          await fetchMachines();
          await fetchWorkers();
        } catch (err) {
          console.error("Error fetching initial data:", err);
          setError('Erreur lors du chargement des données. Veuillez réessayer.');
        }
      } else {
        // API is not available, activate demo mode
        console.log("API not available, activating demo mode");
        setError('Impossible de se connecter au serveur. Mode démo activé automatiquement.');
        activateDemoMode();
      }
      
      setIsLoading(false);
    };
    
    initializeComponent();
    
    // Update timestamp every minute
    const interval = setInterval(() => {
      setTimestamp(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Activate demo mode
  const activateDemoMode = () => {
    setMachines([
      { _id: '1', name: 'Machine CNC-01', type: 'CNC', status: 'operational', assignedWorker: 'Jean Dupont' },
      { _id: '2', name: 'Fraiseuse F-200', type: 'Fraiseuse', status: 'maintenance', assignedWorker: 'Marie Lambert' },
      { _id: '3', name: 'Tour T-100', type: 'Tour', status: 'offline', assignedWorker: 'Pierre Martin' }
    ]);
    setWorkers([
      { _id: '1', name: 'Jean Dupont', specialty: 'Opérateur CNC', assignedMachines: ['Machine CNC-01'] },
      { _id: '2', name: 'Marie Lambert', specialty: 'Technicienne', assignedMachines: ['Fraiseuse F-200'] },
      { _id: '3', name: 'Pierre Martin', specialty: 'Mécanicien', assignedMachines: ['Tour T-100'] }
    ]);
    setIsDemoMode(true);
    setError(null);
  };

  // Fetch machines from API
  const fetchMachines = async () => {
    if (isDemoMode) return; // Skip API call in demo mode
    
    setIsLoading(true);
    try {
      console.log("Fetching machines from API...");
      const data = await machineService.getAllMachines();
      console.log("Fetched machines from API:", data);
      
      if (Array.isArray(data)) {
        // Replace the entire machines state with the API data
        // This ensures no duplicates and keeps the state in sync with the backend
        setMachines(data);
        console.log("Machines state updated from API:", data.length);
      } else {
        console.error("API did not return an array of machines:", data);
      }
    } catch (err) {
      console.error("Error fetching machines:", err);
      setError('Failed to fetch machines. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      await fetchWorkers();
    };
    initializeData();
  }, []);

  // Improve the fetchWorkers function to properly handle duplicates
  const fetchWorkers = async () => {
    if (isDemoMode) return; // Skip API call in demo mode
    
    setIsLoading(true);
    try {
      console.log("Fetching workers from API...");
      const data = await workerService.getAllWorkers();
      console.log("Fetched workers from API:", data);
      
      if (Array.isArray(data)) {
        // Replace the entire workers state with the API data
        // This ensures no duplicates and keeps the state in sync with the backend
        setWorkers(data);
        console.log("Workers state updated from API:", data.length);
      } else {
        console.error("API did not return an array of workers:", data);
      }
    } catch (err) {
      console.error("Error fetching workers:", err);
      setError('Failed to fetch workers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Format timestamp to French locale
  const formattedTimestamp = timestamp.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Machine status badge renderer
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'operational':
        return <Badge bg="success">🟢 Opérationnel</Badge>;
      case 'maintenance':
        return <Badge bg="warning" text="dark">🟡 En maintenance</Badge>;
      case 'offline':
        return <Badge bg="danger">🔴 Hors service</Badge>;
      default:
        return <Badge bg="secondary">Inconnu</Badge>;
    }
  };

  // Improve the handleMachineSubmit function to add success messages
  const handleMachineSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(''); // Clear any existing success message
    
    try {
      if (isDemoMode) {
        // Handle in demo mode
        if (selectedMachine) {
          // Update existing machine
          setMachines(machines.map(machine => 
            machine._id === selectedMachine._id ? { ...machine, ...machineFormData } : machine
          ));
          setSuccessMessage(`Machine "${machineFormData.name}" modifiée avec succès`);
        } else {
          // Add new machine
          const newMachine = {
            _id: Date.now().toString(),
            ...machineFormData
          };
          setMachines([...machines, newMachine]);
          setSuccessMessage(`Machine "${newMachine.name}" ajoutée avec succès`);
        }
      } else {
        // Handle with API
        if (selectedMachine) {
          // Update existing machine
          const updatedMachine = await machineService.updateMachine(selectedMachine._id, machineFormData);
          
          // Update the machine in the state
          setMachines(prevMachines => 
            prevMachines.map(machine => 
              machine._id === selectedMachine._id ? { ...machine, ...updatedMachine } : machine
            )
          );
          setSuccessMessage(`Machine "${machineFormData.name}" modifiée avec succès`);
        } else {
          // Add new machine
          const newMachine = await machineService.createMachine(machineFormData);
          
          if (newMachine && newMachine._id) {
            // Fetch the complete list from the server to ensure consistency
            await fetchMachines();
            setSuccessMessage(`Machine "${machineFormData.name}" ajoutée avec succès`);
          } else {
            console.error("No valid response from createMachine");
            setError("Erreur: Aucune réponse valide du serveur lors de la création de la machine");
          }
        }
      }
      
      // Close modal and reset form
      setShowMachineModal(false);
      setSelectedMachine(null);
      setMachineFormData({ name: '', type: '', status: 'operational', assignedWorker: '' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(`Erreur lors de l'enregistrement: ${err.message || 'Erreur inconnue'}`);
      console.error('Error saving machine:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Improve the handleWorkerSubmit function to add success messages
  const handleWorkerSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(''); // Clear any existing success message
    
    try {
      if (isDemoMode) {
        // Handle in demo mode
        if (selectedWorker) {
          // Update existing worker
          setWorkers(workers.map(worker => 
            worker._id === selectedWorker._id ? { ...worker, ...workerFormData } : worker
          ));
          setSuccessMessage(`Ouvrier "${workerFormData.name}" modifié avec succès`);
        } else {
          // Add new worker
          const newWorker = {
            _id: Date.now().toString(),
            ...workerFormData,
            assignedMachines: workerFormData.assignedMachines || []
          };
          
          // Add the new worker to state
          setWorkers(prevWorkers => [...prevWorkers, newWorker]);
          console.log("Added new worker in demo mode:", newWorker);
          setSuccessMessage(`Ouvrier "${newWorker.name}" ajouté avec succès`);
        }
      } else {
        // Handle with API
        if (selectedWorker) {
          // Update existing worker
          const updatedWorker = await workerService.updateWorker(selectedWorker._id, workerFormData);
          console.log("Worker updated:", updatedWorker);
          
          // Update the worker in the state
          setWorkers(prevWorkers => 
            prevWorkers.map(worker => 
              worker._id === selectedWorker._id ? { ...worker, ...updatedWorker } : worker
            )
          );
          setSuccessMessage(`Ouvrier "${workerFormData.name}" modifié avec succès`);
        } else {
          // Add new worker
          console.log("Submitting new worker:", workerFormData);
          const newWorker = await workerService.createWorker(workerFormData);
          console.log("Worker created:", newWorker);
          
          if (newWorker && newWorker._id) {
            // Fetch the complete list from the server to ensure consistency
            // This is more reliable than manually adding to state
            await fetchWorkers();
            setSuccessMessage(`Ouvrier "${workerFormData.name}" ajouté avec succès`);
          } else {
            console.error("No valid response from createWorker");
            setError("Erreur: Aucune réponse valide du serveur lors de la création de l'ouvrier");
          }
        }
      }
      
      // Close modal and reset form
      setShowWorkerModal(false);
      setSelectedWorker(null);
      setWorkerFormData({ name: '', specialty: '', assignedMachines: [] });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(`Erreur lors de l'enregistrement: ${err.message || 'Erreur inconnue'}`);
      console.error('Error saving worker:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle machine deletion
  const handleDeleteMachine = async (id) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (isDemoMode) {
        // Handle in demo mode
        setMachines(machines.filter(machine => machine._id !== id));
      } else {
        // Handle with API
        await machineService.deleteMachine(id);
        await fetchMachines();
      }
    } catch (err) {
      setError('Failed to delete machine. Please try again.');
      console.error('Error deleting machine:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle worker deletion
  const handleDeleteWorker = async (id) => {
    if (!id) {
      console.error("No worker ID provided for deletion");
      setError("Erreur: Aucun identifiant d'ouvrier fourni pour la suppression");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Attempting to delete worker with ID: ${id}`);
      
      if (isDemoMode) {
        // Handle in demo mode
        const workerToRemove = workers.find(w => w._id === id);
        if (workerToRemove) {
          console.log(`Removing worker from state: ${workerToRemove.name}`);
          setWorkers(prevWorkers => prevWorkers.filter(worker => worker._id !== id));
        } else {
          console.warn(`Worker with ID ${id} not found in state`);
        }
      } else {
        // Handle with API
        const response = await workerService.deleteWorker(id);
        console.log("Delete worker API response:", response);
        
        // Immediately update the local state to provide instant feedback
        setWorkers(prevWorkers => prevWorkers.filter(worker => worker._id !== id));
        
        // Then refresh from server to ensure consistency
        await fetchWorkers();
      }
      
      // Close modal and reset state
      setShowDeleteWorkerModal(false);
      setWorkerToDelete(null);
      
      // Show success message
      setSuccessMessage("Ouvrier supprimé avec succès");
      setTimeout(() => setSuccessMessage(""), 3000); // Clear after 3 seconds
    } catch (err) {
      const errorMsg = err.message || 'Erreur inconnue';
      setError(`Erreur lors de la suppression: ${errorMsg}`);
      console.error('Error deleting worker:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle machine edit
  const handleEditMachine = (machine) => {
    setSelectedMachine(machine);
    setMachineFormData({ 
      name: machine.name, 
      type: machine.type, 
      status: machine.status, 
      assignedWorker: machine.assignedWorker 
    });
    setShowMachineModal(true);
  };

  // Handle worker edit
  const handleEditWorker = (worker) => {
    setSelectedWorker(worker);
    setWorkerFormData({ 
      name: worker.name, 
      specialty: worker.specialty, 
      assignedMachines: worker.assignedMachines || [] 
    });
    setShowWorkerModal(true);
  };

  // Handle worker reassignment
  const handleReassignWorker = (worker) => {
    setSelectedWorker(worker);
    setShowReassignModal(true);
  };

  // Handle worker profile view
  const handleViewProfile = (worker) => {
    setSelectedWorker(worker);
    setShowProfileModal(true);
  };

  // Handle CSV export
  const handleExportCSV = () => {
    // In a real app, this would generate and download a CSV file
    console.log('Exporting workers to CSV...');
    setShowExportModal(false);
  };

  // Sort workers
  const sortedWorkers = [...(Array.isArray(workers) ? workers : [])].sort((a, b) => {
    // Make sure we have valid objects with the required field
    if (!a || !b || !a[workerSort.field] || !b[workerSort.field]) {
      return 0;
    }
    
    const aValue = a[workerSort.field];
    const bValue = b[workerSort.field];
    
    if (workerSort.direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Filter workers - Make sure we're filtering the correct data
  const filteredWorkers = sortedWorkers.filter(worker => 
    worker.name?.toLowerCase().includes(workerFilter.toLowerCase()) ||
    worker.specialty?.toLowerCase().includes(workerFilter.toLowerCase())
  );

  // Toggle sort direction
  const toggleSort = (field) => {
    if (workerSort.field === field) {
      setWorkerSort({
        field,
        direction: workerSort.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      setWorkerSort({
        field,
        direction: 'asc'
      });
    }
  };

  // Render sort icon
  const renderSortIcon = (field) => {
    if (workerSort.field !== field) {
      return <FaSort className="sort-icon" />;
    }
    return workerSort.direction === 'asc' ? <FaSortUp className="sort-icon" /> : <FaSortDown className="sort-icon" />;
  };

  // Add a function to open the delete confirmation modal
  const confirmDeleteWorker = (worker) => {
    setWorkerToDelete(worker);
    setShowDeleteWorkerModal(true);
  };

  // Handle saving reassigned worker
  const handleSaveReassignment = async () => {
    if (!selectedWorker) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (isDemoMode) {
        // Handle in demo mode
        setWorkers(workers.map(worker => 
          worker._id === selectedWorker._id ? selectedWorker : worker
        ));
      } else {
        // Handle with API
        await workerService.updateWorker(selectedWorker._id, selectedWorker);
        await fetchWorkers();
      }
      setShowReassignModal(false);
    } catch (err) {
      setError('Failed to reassign worker. Please try again.');
      console.error('Error reassigning worker:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a manual refresh button for workers
  const handleRefreshWorkers = async () => {
    try {
      await fetchWorkers();
    } catch (err) {
      setError('Impossible de rafraîchir la liste des ouvriers.');
    }
  };

  return (
    <div className={`admin-management-container ${isDemoMode ? 'demo-mode' : ''}`}>
      <Container fluid>
        <Row className="mb-4">
          <Col md={8}>
            <h1 className="page-title">
              Gestion Admin
              {isDemoMode && <span className="demo-mode-badge">Mode Démo</span>}
              {isLoading && <span className="loading-badge ms-2">Chargement...</span>}
            </h1>
            <div className="timestamp">Dernière mise à jour: {formattedTimestamp}</div>
            {successMessage && (
              <div className="success-message alert alert-success mt-2">
                {successMessage}
              </div>
            )}
            {isDemoMode && (
              <div className="demo-mode-alert">
                Les données sont gérées localement et ne seront pas persistantes. 
                Toutes les modifications seront perdues lors du rafraîchissement de la page.
                <Button 
                  variant="link" 
                  size="sm" 
                  className="ms-2"
                  onClick={activateDemoMode}
                >
                  Réinitialiser les données
                </Button>
              </div>
            )}
          </Col>
          <Col md={4} className="d-flex justify-content-end align-items-center">
            <Button 
              variant={isDemoMode ? "outline-warning" : "outline-primary"}
              onClick={() => {
                if (isDemoMode) {
                  // Try to switch back to API mode
                  setIsDemoMode(false);
                  const fetchData = async () => {
                    try {
                      await fetchMachines();
                      await fetchWorkers();
                    } catch (err) {
                      setError('Impossible de se connecter au serveur. Mode démo réactivé.');
                      activateDemoMode();
                    }
                  };
                  fetchData();
                } else {
                  // Switch to demo mode
                  activateDemoMode();
                }
              }}
              disabled={isLoading}
            >
              {isDemoMode ? "Essayer Mode API" : "Activer Mode Démo"}
            </Button>
          </Col>
        </Row>

        {/* Display error message if there is one */}
        {error && (
          <div className="mb-4">
            <ErrorMessage message={error} onDismiss={() => setError(null)} />
            {error.includes('backend') && (
              <Card className="mt-3">
                <Card.Body>
                  <Card.Title>Mode Démo</Card.Title>
                  <Card.Text>
                    Le backend n'est pas disponible. Vous pouvez utiliser le mode démo pour tester l'interface.
                  </Card.Text>
                  <Button 
                    variant="primary" 
                    onClick={activateDemoMode}
                  >
                    Activer le Mode Démo
                  </Button>
                </Card.Body>
              </Card>
            )}
          </div>
        )}

        {/* Debug information panel - only visible in development */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mb-4 debug-panel">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Informations de débogage</h5>
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={() => console.log("Current workers state:", workers)}
              >
                Log Workers
              </Button>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p><strong>Mode:</strong> {isDemoMode ? 'Démo' : 'API'}</p>
                  <p><strong>Dernière opération:</strong> {debugInfo.lastOperation}</p>
                  <p><strong>Nombre d'ouvriers:</strong> {workers.length}</p>
                </Col>
                <Col md={6}>
                  {debugInfo.lastAddedWorker && (
                    <div>
                      <p><strong>Dernier ouvrier ajouté:</strong></p>
                      <pre className="debug-json">
                        {JSON.stringify(debugInfo.lastAddedWorker, null, 2)}
                      </pre>
                    </div>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        <Tabs defaultActiveKey="machines" id="admin-tabs" className="mb-4">
          <Tab eventKey="machines" title="Machines">
            <Card className="section-card">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h2>Machines</h2>
                <Button variant="success" className="add-btn" onClick={() => {
                  setSelectedMachine(null);
                  setMachineFormData({ name: '', type: '', status: 'operational', assignedWorker: '' });
                  setShowMachineModal(true);
                }}>
                  <FaPlus /> Ajouter une Machine
                </Button>
              </Card.Header>
              <Card.Body>
                {isLoading && <LoadingSpinner text="Chargement des machines..." />}
                <div className="table-responsive">
                  {!isLoading && machines.length > 0 ? (
                    <Table striped hover className="machines-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Nom</th>
                          <th>Type</th>
                          <th>Statut</th>
                          <th>Ouvrier Assigné</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {machines.map(machine => (
                          <tr key={machine._id}>
                            <td>{machine._id.substring(0, 8)}</td>
                            <td>{machine.name}</td>
                            <td>{machine.type}</td>
                            <td>{renderStatusBadge(machine.status)}</td>
                            <td>{machine.assignedWorker}</td>
                            <td className="actions-cell">
                              <Button variant="outline-primary" size="sm" className="action-btn" onClick={() => handleEditMachine(machine)}>
                                <FaEdit /> 
                              </Button>
                              <Button variant="outline-danger" size="sm" className="action-btn" onClick={() => handleDeleteMachine(machine._id)}>
                                <FaTrashAlt />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : !isLoading && (
                    <div className="empty-state">
                      <p>Aucune machine n'a été ajoutée. Cliquez sur "Ajouter une Machine" pour commencer.</p>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Tab>

          <Tab eventKey="workers" title="Ouvriers">
            <Card className="section-card">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h2>Ouvriers</h2>
                <div className="header-actions">
                  {!isDemoMode && (
                    <Button 
                      variant="outline-info" 
                      className="me-2" 
                      onClick={handleRefreshWorkers}
                      disabled={isLoading}
                    >
                      <FaSync className={isLoading ? "fa-spin" : ""} /> Rafraîchir
                    </Button>
                  )}
                  <Button variant="outline-secondary" className="export-btn me-2" onClick={() => setShowExportModal(true)}>
                    <FaFileExport /> Exporter en CSV
                  </Button>
                  <Button variant="primary" className="add-btn" onClick={() => {
                    setSelectedWorker(null);
                    setWorkerFormData({ name: '', specialty: '', assignedMachines: [] });
                    setShowWorkerModal(true);
                  }}>
                    <FaPlus /> Ajouter un Ouvrier
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                <Row className="mb-3">
                  <Col md={6}>
                    <InputGroup>
                      <InputGroup.Text><FaSearch /></InputGroup.Text>
                      <FormControl
                        placeholder="Rechercher par nom ou spécialité..."
                        value={workerFilter}
                        onChange={(e) => setWorkerFilter(e.target.value)}
                      />
                    </InputGroup>
                  </Col>
                  {isDemoMode && (
                    <Col md={6} className="text-end">
                      <small className="text-muted">
                        Nombre d'ouvriers: {workers.length}
                      </small>
                    </Col>
                  )}
                </Row>
                {isLoading && <LoadingSpinner text="Chargement des ouvriers..." />}
                <div className="table-responsive">
                  {!isLoading && filteredWorkers.length > 0 ? (
                    <Table striped hover className="workers-table">
                      <thead>
                        <tr>
                          <th onClick={() => toggleSort('_id')} className="sortable-header">
                            ID {renderSortIcon('_id')}
                          </th>
                          <th onClick={() => toggleSort('name')} className="sortable-header">
                            Nom {renderSortIcon('name')}
                          </th>
                          <th onClick={() => toggleSort('specialty')} className="sortable-header">
                            Spécialité {renderSortIcon('specialty')}
                          </th>
                          <th>Machines Assignées</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredWorkers.map(worker => (
                          <tr key={worker._id}>
                            <td>{worker._id.substring(0, 8)}</td>
                            <td>{worker.name}</td>
                            <td>{worker.specialty}</td>
                            <td>
                              {worker.assignedMachines && worker.assignedMachines.length > 0 ? (
                                worker.assignedMachines.join(', ')
                              ) : (
                                <span className="text-muted">Aucune machine assignée</span>
                              )}
                            </td>
                            <td className="actions-cell">
                              <Button variant="outline-primary" size="sm" className="action-btn" onClick={() => handleEditWorker(worker)}>
                                <FaEdit />
                              </Button>
                              <Button variant="outline-danger" size="sm" className="action-btn" onClick={() => confirmDeleteWorker(worker)}>
                                <FaTrashAlt />
                              </Button>
                              <Button variant="outline-secondary" size="sm" className="action-btn" onClick={() => handleReassignWorker(worker)}>
                                <FaSync />
                              </Button>
                              <Button variant="outline-info" size="sm" className="action-btn" onClick={() => handleViewProfile(worker)}>
                                <FaUser />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : !isLoading && (
                    <div className="empty-state">
                      <p>Aucun ouvrier trouvé avec les critères de recherche actuels.</p>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>
      </Container>

      {/* Machine Modal */}
      <Modal show={showMachineModal} onHide={() => setShowMachineModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedMachine ? 'Modifier la Machine' : 'Ajouter une Machine'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
          {successMessage && (
            <div className="alert alert-success mt-3" role="alert">
              {successMessage}
            </div>
          )}
          <Form onSubmit={handleMachineSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom</Form.Label>
                  <Form.Control
                    type="text"
                    value={machineFormData.name}
                    onChange={(e) => setMachineFormData({ ...machineFormData, name: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Type</Form.Label>
                  <Form.Control
                    type="text"
                    value={machineFormData.type}
                    onChange={(e) => setMachineFormData({ ...machineFormData, type: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Statut</Form.Label>
                  <Form.Select
                    value={machineFormData.status}
                    onChange={(e) => setMachineFormData({ ...machineFormData, status: e.target.value })}
                    required
                  >
                    <option value="operational">🟢 Opérationnel</option>
                    <option value="maintenance">🟡 En maintenance</option>
                    <option value="offline">🔴 Hors service</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ouvrier Assigné</Form.Label>
                  <Form.Select
                    value={machineFormData.assignedWorker}
                    onChange={(e) => setMachineFormData({ ...machineFormData, assignedWorker: e.target.value })}
                  >
                    <option value="">-- Aucun ouvrier assigné --</option>
                    {Array.isArray(workers) && workers.map(worker => (
                      <option key={worker._id} value={worker.name}>{worker.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end mt-3">
              <Button variant="secondary" onClick={() => setShowMachineModal(false)} className="me-2">
                Annuler
              </Button>
              <Button variant="success" type="submit" disabled={isLoading}>
                {isLoading ? 'Chargement...' : selectedMachine ? 'Mettre à jour' : 'Ajouter'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Worker Modal */}
      <Modal show={showWorkerModal} onHide={() => setShowWorkerModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedWorker ? 'Modifier l\'Ouvrier' : 'Ajouter un Ouvrier'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
          {successMessage && (
            <div className="alert alert-success mt-3" role="alert">
              {successMessage}
            </div>
          )}
          <Form onSubmit={handleWorkerSubmit} id="workerForm">
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={workerFormData.name}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, name: e.target.value })}
                    required
                    minLength={2}
                    maxLength={50}
                  />
                  <Form.Text className="text-muted">
                    Le nom doit comporter entre 2 et 50 caractères.
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Spécialité <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={workerFormData.specialty}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, specialty: e.target.value })}
                    required
                    minLength={2}
                    maxLength={50}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Machines Assignées</Form.Label>
              <div className="machine-checkboxes">
                {Array.isArray(machines) && machines.length > 0 ? (
                  machines.map(machine => (
                    <Form.Check
                      key={machine._id}
                      type="checkbox"
                      id={`machine-${machine._id}`}
                      label={machine.name}
                      checked={workerFormData.assignedMachines.includes(machine._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setWorkerFormData({
                            ...workerFormData,
                            assignedMachines: [...workerFormData.assignedMachines, machine._id]
                          });
                        } else {
                          setWorkerFormData({
                            ...workerFormData,
                            assignedMachines: workerFormData.assignedMachines.filter((id) => id !== machine._id)
                          });
                        }
                      }}
                    />
                  ))
                ) : (
                  <p>Aucune machine disponible pour assigner.</p>
                )}
              </div>
            </Form.Group>
            <div className="d-flex justify-content-end mt-3">
              <Button variant="secondary" onClick={() => setShowWorkerModal(false)} className="me-2">
                Annuler
              </Button>
              <Button variant="success" type="submit" disabled={isLoading}>
                {isLoading ? 'Chargement...' : selectedWorker ? 'Mettre à jour' : 'Ajouter'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Worker Confirmation Modal */}
      <Modal show={showDeleteWorkerModal} onHide={() => setShowDeleteWorkerModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Supprimer l'ouvrier</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir supprimer cet ouvrier ? Cette action est irréversible.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteWorkerModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={() => handleDeleteWorker(workerToDelete._id)}>
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminManagement;