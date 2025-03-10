import React, { useEffect, useState } from 'react';
import { Card, Row, Col, ProgressBar, Button } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { 
  BsThermometerHalf, 
  BsDroplet, 
  BsLightningCharge, 
  BsBrightnessHigh,
  BsArrowUp,
  BsArrowDown,
  BsArrowRepeat,
  BsCheckCircle,
  BsXCircle
} from 'react-icons/bs';
import { useAppContext } from '../../context/AppContext';
import './Dashboard.css';

const Dashboard = () => {
  const { 
    machines, 
    alerts, 
    productionData, 
    refreshProductionData, 
    timeAgo,
    isLoading,
    toggleMachineStatus,
    productData
  } = useAppContext();
  
  const [averageTemp, setAverageTemp] = useState(0);
  const [averageHumidity, setAverageHumidity] = useState(0);
  const [averageVibration, setAverageVibration] = useState(0);
  const [efficiency, setEfficiency] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Calculate averages from machine data
  useEffect(() => {
    if (machines.length > 0) {
      // Only include running machines in calculations
      const runningMachines = machines.filter(m => m.isRunning);
      
      if (runningMachines.length > 0) {
        const tempSum = runningMachines.reduce((sum, machine) => sum + machine.temperature, 0);
        const humiditySum = runningMachines.reduce((sum, machine) => sum + machine.humidity, 0);
        const vibrationSum = runningMachines.reduce((sum, machine) => sum + machine.vibration, 0);
        const efficiencySum = runningMachines.reduce((sum, machine) => sum + machine.efficiency, 0);
        
        setAverageTemp(parseFloat((tempSum / runningMachines.length).toFixed(1)));
        setAverageHumidity(parseFloat((humiditySum / runningMachines.length).toFixed(1)));
        setAverageVibration(parseFloat((vibrationSum / runningMachines.length).toFixed(2)));
        setEfficiency(parseFloat((efficiencySum / runningMachines.length).toFixed(1)));
      } else {
        // Default values if no machines are running
        setAverageTemp(0);
        setAverageHumidity(0);
        setAverageVibration(0);
        setEfficiency(0);
      }
    }
  }, [machines]);

  // Handle refresh of production data
  const handleRefreshData = () => {
    setRefreshing(true);
    refreshProductionData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  // Get temperature status class
  const getTempStatusClass = (temp) => {
    if (temp > 40) return 'danger';
    if (temp > 35) return 'warning';
    return 'normal';
  };

  // Get vibration status class
  const getVibrationStatusClass = (vib) => {
    if (vib > 2.0) return 'danger';
    if (vib > 1.0) return 'warning';
    return 'normal';
  };

  return (
    <div className="dashboard-container">
      <Row className="g-4 mb-4">
        <Col md={3}>
          <div className={`dashboard-stat temperature ${getTempStatusClass(averageTemp)}`}>
            <BsThermometerHalf className="dashboard-stat-icon" />
            <div className="dashboard-stat-title">Température</div>
            <div className="dashboard-stat-value">{averageTemp}°C</div>
            <ProgressBar 
              now={Math.min(100, (averageTemp / 50) * 100)} 
              variant={getTempStatusClass(averageTemp) === 'danger' ? 'danger' : 'info'} 
              className="dashboard-stat-progress" 
            />
          </div>
        </Col>
        
        <Col md={3}>
          <div className="dashboard-stat humidity">
            <BsDroplet className="dashboard-stat-icon" />
            <div className="dashboard-stat-title">Humidité</div>
            <div className="dashboard-stat-value">{averageHumidity}%</div>
            <ProgressBar 
              now={averageHumidity} 
              variant="success" 
              className="dashboard-stat-progress" 
            />
          </div>
        </Col>
        
        <Col md={3}>
          <div className={`dashboard-stat vibration ${getVibrationStatusClass(averageVibration)}`}>
            <BsLightningCharge className="dashboard-stat-icon" />
            <div className="dashboard-stat-title">Vibration</div>
            <div className="dashboard-stat-value">{averageVibration}g</div>
            <ProgressBar 
              now={Math.min(100, (averageVibration / 3) * 100)} 
              variant={getVibrationStatusClass(averageVibration) === 'danger' ? 'danger' : 'warning'} 
              className="dashboard-stat-progress" 
            />
          </div>
        </Col>
        
        <Col md={3}>
          <div className="dashboard-stat light">
            <BsBrightnessHigh className="dashboard-stat-icon" />
            <div className="dashboard-stat-title">Efficacité</div>
            <div className="dashboard-stat-value">{efficiency}%</div>
            <ProgressBar 
              now={efficiency} 
              variant="primary" 
              className="dashboard-stat-progress" 
            />
          </div>
        </Col>
      </Row>

      {/* New Product Data Section */}
      <Row className="g-4 mb-4">
        <Col md={12}>
          <Card className="dashboard-card">
            <Card.Header className="dashboard-card-header">
              <h2 className="dashboard-card-title">Production de Produits</h2>
            </Card.Header>
            <Card.Body className="dashboard-card-body">
              <Row>
                <Col md={4} className="text-center">
                  <div className="product-stat">
                    <h3 className="product-stat-title">Quantité Totale</h3>
                    <div className="product-stat-value">{productData.totalProducts}</div>
                    <div className="product-stat-label">produits</div>
                  </div>
                </Col>
                <Col md={4} className="text-center">
                  <div className="product-stat">
                    <h3 className="product-stat-title">Produits Conformes</h3>
                    <div className="product-stat-value text-success">
                      {((productData.conformingProducts / productData.totalProducts) * 100).toFixed(1)}%
                    </div>
                    <div className="product-stat-label">
                      <BsCheckCircle className="text-success me-1" />
                      {productData.conformingProducts} produits
                    </div>
                    <ProgressBar 
                      now={(productData.conformingProducts / productData.totalProducts) * 100} 
                      variant="success" 
                      className="mt-2" 
                    />
                  </div>
                </Col>
                <Col md={4} className="text-center">
                  <div className="product-stat">
                    <h3 className="product-stat-title">Produits Non Conformes</h3>
                    <div className="product-stat-value text-danger">
                      {((productData.nonConformingProducts / productData.totalProducts) * 100).toFixed(1)}%
                    </div>
                    <div className="product-stat-label">
                      <BsXCircle className="text-danger me-1" />
                      {productData.nonConformingProducts} produits
                    </div>
                    <ProgressBar 
                      now={(productData.nonConformingProducts / productData.totalProducts) * 100} 
                      variant="danger" 
                      className="mt-2" 
                    />
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={8}>
          <Card className="dashboard-card">
            <Card.Header className="dashboard-card-header d-flex justify-content-between align-items-center">
              <h2 className="dashboard-card-title">Tendance de Production</h2>
              <Button 
                variant="outline-secondary" 
                size="sm" 
                onClick={handleRefreshData}
                disabled={refreshing || isLoading}
                className="d-flex align-items-center gap-2"
              >
                <BsArrowRepeat className={refreshing ? 'spin' : ''} />
                Actualiser
              </Button>
            </Card.Header>
            <Card.Body className="dashboard-card-body">
              <div className="chart-container">
                <Line data={productionData} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="dashboard-card machine-status-container">
            <Card.Header className="dashboard-card-header">
              <h2 className="dashboard-card-title">État des Machines</h2>
            </Card.Header>
            <Card.Body className="dashboard-card-body">
              {machines.map((machine) => (
                <div key={machine.id} className="machine-status-item">
                  <div className={`machine-status-indicator ${machine.status}`}></div>
                  <div className="machine-status-info">
                    <div className="d-flex justify-content-between align-items-center">
                      <h3 className="machine-status-name">{machine.name}</h3>
                      <span className={`badge ${machine.isRunning ? 'bg-success' : 'bg-danger'}`}>
                        {machine.isRunning ? 'En marche' : 'Arrêtée'}
                      </span>
                    </div>
                    <p className="machine-status-message">
                      {machine.status === 'normal' ? 'Fonctionnement normal' : 
                       machine.status === 'warning' ? 'Attention requise' : 
                       'Maintenance urgente requise'}
                    </p>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <small className="text-muted">T: {machine.temperature}°C | H: {machine.humidity}% | V: {machine.vibration}g</small>
                      <Button 
                        size="sm" 
                        variant={machine.isRunning ? "outline-danger" : "outline-success"}
                        onClick={() => toggleMachineStatus(machine.id)}
                      >
                        {machine.isRunning ? 'Arrêter' : 'Démarrer'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="g-4 mt-4">
        <Col md={6}>
          <Card className="dashboard-card">
            <Card.Header className="dashboard-card-header">
              <h2 className="dashboard-card-title">Performances</h2>
            </Card.Header>
            <Card.Body className="dashboard-card-body">
              <Row>
                <Col xs={6} className="mb-3">
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      <BsArrowUp className="text-success" size={24} />
                    </div>
                    <div>
                      <div className="text-muted small">Efficacité</div>
                      <div className="fw-bold">{efficiency}%</div>
                    </div>
                  </div>
                </Col>
                <Col xs={6} className="mb-3">
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      <BsArrowDown className="text-danger" size={24} />
                    </div>
                    <div>
                      <div className="text-muted small">Temps d'arrêt</div>
                      <div className="fw-bold">{100 - efficiency}%</div>
                    </div>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      <BsArrowUp className="text-success" size={24} />
                    </div>
                    <div>
                      <div className="text-muted small">Production</div>
                      <div className="fw-bold">+{Math.floor(efficiency / 10)}%</div>
                    </div>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      <BsArrowDown className="text-success" size={24} />
                    </div>
                    <div>
                      <div className="text-muted small">Consommation</div>
                      <div className="fw-bold">-{Math.floor(efficiency / 12)}%</div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className="dashboard-card">
            <Card.Header className="dashboard-card-header">
              <h2 className="dashboard-card-title">Alertes Récentes</h2>
            </Card.Header>
            <Card.Body className="dashboard-card-body">
              {alerts.length === 0 ? (
                <p className="text-center text-muted">Aucune alerte récente</p>
              ) : (
                alerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className="d-flex align-items-center mb-3 pb-3 border-bottom">
                    <div className="me-3">
                      <div className={`bg-${alert.type} text-white rounded-circle d-flex align-items-center justify-content-center`} style={{width: '40px', height: '40px'}}>
                        {alert.icon === 'temperature' ? <BsThermometerHalf size={20} /> : 
                         alert.icon === 'vibration' ? <BsLightningCharge size={20} /> : 
                         <BsDroplet size={20} />}
                      </div>
                    </div>
                    <div>
                      <div className="fw-bold">{alert.message}</div>
                      <div className="text-muted small">{timeAgo(alert.timestamp)}</div>
                    </div>
                  </div>
                ))
              )}
              
              {alerts.length > 3 && (
                <div className="text-center mt-3">
                  <Button variant="outline-primary" size="sm" as="a" href="/history">
                    Voir toutes les alertes
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;