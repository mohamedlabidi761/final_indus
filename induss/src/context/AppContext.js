import React, { createContext, useState, useEffect, useContext } from 'react';

// Create context
export const AppContext = createContext();

// Sample data for machines
const initialMachines = [
  { 
    id: 1, 
    name: 'Machine A', 
    status: 'normal', 
    isRunning: true, 
    temperature: 24, 
    humidity: 45, 
    vibration: 0.5, 
    lastMaintenance: '2023-12-15',
    nextMaintenance: '2024-03-15',
    efficiency: 92
  },
  { 
    id: 2, 
    name: 'Machine B', 
    status: 'warning', 
    isRunning: true, 
    temperature: 38, 
    humidity: 30, 
    vibration: 1.2, 
    lastMaintenance: '2023-11-20',
    nextMaintenance: '2024-02-20',
    efficiency: 78
  },
  { 
    id: 3, 
    name: 'Machine C', 
    status: 'critical', 
    isRunning: false, 
    temperature: 45, 
    humidity: 25, 
    vibration: 2.5, 
    lastMaintenance: '2023-10-10',
    nextMaintenance: '2024-01-10',
    efficiency: 45
  },
  { 
    id: 4, 
    name: 'Machine D', 
    status: 'normal', 
    isRunning: true, 
    temperature: 22, 
    humidity: 50, 
    vibration: 0.3, 
    lastMaintenance: '2024-01-05',
    nextMaintenance: '2024-04-05',
    efficiency: 95
  }
];

// Sample product data
const initialProductData = {
  totalProducts: 1250,
  conformingProducts: 1125,
  nonConformingProducts: 125
};

// Sample alerts data
const initialAlerts = [
  { 
    id: 1, 
    type: 'warning', 
    message: 'Température élevée - Machine B', 
    timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
    machineId: 2,
    icon: 'temperature'
  },
  { 
    id: 2, 
    type: 'danger', 
    message: 'Panne détectée - Machine C', 
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    machineId: 3,
    icon: 'vibration'
  },
  { 
    id: 3, 
    type: 'info', 
    message: 'Niveau d\'humidité bas - Zone A', 
    timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
    machineId: null,
    icon: 'humidity'
  }
];

// Sample notification data
const initialNotifications = [
  { 
    id: 1, 
    title: 'Critical Alert', 
    message: 'Temperature exceeds threshold on Machine B', 
    type: 'critical',
    read: false, 
    timestamp: new Date(Date.now() - 25 * 60000).toISOString() 
  },
  { 
    id: 2, 
    title: 'System Update', 
    message: 'Maintenance scheduled for tomorrow at 10:00 AM', 
    type: 'info',
    read: true, 
    timestamp: new Date(Date.now() - 3 * 3600000).toISOString() 
  },
  { 
    id: 3, 
    title: 'Warning', 
    message: 'Low humidity levels detected in Zone C', 
    type: 'warning',
    read: false, 
    timestamp: new Date(Date.now() - 8 * 3600000).toISOString() 
  }
];

// Sample history data
const initialHistory = [
  { 
    id: 1, 
    event: 'Machine A démarrée', 
    timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
    machineId: 1,
    user: 'Opérateur 1'
  },
  { 
    id: 2, 
    event: 'Machine B maintenance', 
    timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
    machineId: 2,
    user: 'Technicien 3'
  },
  { 
    id: 3, 
    event: 'Machine C arrêtée', 
    timestamp: new Date(Date.now() - 36 * 3600000).toISOString(),
    machineId: 3,
    user: 'Opérateur 2'
  },
  { 
    id: 4, 
    event: 'Machine D maintenance', 
    timestamp: new Date(Date.now() - 48 * 3600000).toISOString(),
    machineId: 4,
    user: 'Technicien 1'
  },
  { 
    id: 5, 
    event: 'Machine A maintenance', 
    timestamp: new Date(Date.now() - 72 * 3600000).toISOString(),
    machineId: 1,
    user: 'Technicien 2'
  }
];

// Production data for charts
const generateProductionData = () => {
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  const currentYear = new Date().getFullYear();
  
  // Get current month index (0-11)
  const currentMonthIndex = new Date().getMonth();
  
  // Get last 6 months
  const last6Months = [];
  for (let i = 5; i >= 0; i--) {
    const monthIndex = (currentMonthIndex - i + 12) % 12;
    last6Months.push(months[monthIndex]);
  }
  
  return {
    labels: last6Months,
    datasets: [
      {
        label: `Production ${currentYear}`,
        data: [65, 59, 80, 81, 56, 55].map(val => val + Math.floor(Math.random() * 10)),
        borderColor: 'rgba(52, 152, 219, 1)',
        backgroundColor: 'rgba(52, 152, 219, 0.2)',
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: 'rgba(52, 152, 219, 1)',
        tension: 0.4
      },
      {
        label: `Production ${currentYear - 1}`,
        data: [45, 70, 65, 60, 70, 40].map(val => val + Math.floor(Math.random() * 10)),
        borderColor: 'rgba(149, 165, 166, 1)',
        backgroundColor: 'rgba(149, 165, 166, 0.2)',
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: 'rgba(149, 165, 166, 1)',
        tension: 0.4,
        borderDash: [5, 5]
      }
    ]
  };
};

// Provider component
export const AppProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [machines, setMachines] = useState(initialMachines);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [history, setHistory] = useState(initialHistory);
  const [productionData, setProductionData] = useState(generateProductionData());
  const [productData, setProductData] = useState(initialProductData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', !darkMode);
  };
  
  // Start or stop a machine
  const toggleMachineStatus = (id) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setMachines(machines.map(machine => {
        if (machine.id === id) {
          const isRunning = !machine.isRunning;
          
          // Add to history
          const newHistoryEntry = {
            id: history.length + 1,
            event: `Machine ${machine.name} ${isRunning ? 'démarrée' : 'arrêtée'}`,
            timestamp: new Date().toISOString(),
            machineId: machine.id,
            user: 'Utilisateur actuel'
          };
          
          setHistory([newHistoryEntry, ...history]);
          
          return { 
            ...machine, 
            isRunning,
            // If machine is stopped, set status to normal when restarted
            status: isRunning && machine.status === 'critical' ? 'warning' : machine.status
          };
        }
        return machine;
      }));
      
      setIsLoading(false);
    }, 800);
  };
  
  // Add a new alert
  const addAlert = (alert) => {
    const newAlert = {
      id: alerts.length + 1,
      timestamp: new Date().toISOString(),
      ...alert
    };
    
    setAlerts([newAlert, ...alerts]);
  };
  
  // Refresh production data
  const refreshProductionData = () => {
    setProductionData(generateProductionData());
    
    // Also update product data with some random variation
    setProductData(prevData => {
      const totalChange = Math.floor(Math.random() * 20) - 5; // -5 to +15
      const newTotal = prevData.totalProducts + totalChange;
      
      // Calculate new conforming/non-conforming with slight random variation in ratio
      const conformingRatio = Math.min(0.95, Math.max(0.85, (prevData.conformingProducts / prevData.totalProducts) + (Math.random() * 0.02 - 0.01)));
      const newConforming = Math.floor(newTotal * conformingRatio);
      const newNonConforming = newTotal - newConforming;
      
      return {
        totalProducts: newTotal,
        conformingProducts: newConforming,
        nonConformingProducts: newNonConforming
      };
    });
  };
  
  // Add new notification
  const addNotification = (title, message, type = 'info') => {
    const newNotification = {
      id: Date.now(), // Simple unique ID
      title,
      message,
      type,
      read: false,
      timestamp: new Date().toISOString()
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Optional: Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico'
      });
    }
    
    return newNotification;
  };
  
  // Mark notification as read
  const markNotificationAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };
  
  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };
  
  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly update machine data
      setMachines(prevMachines => {
        return prevMachines.map(machine => {
          // Only update running machines
          if (machine.isRunning) {
            // Random temperature fluctuation
            const tempChange = (Math.random() - 0.5) * 2;
            let newTemp = machine.temperature + tempChange;
            
            // Random vibration fluctuation
            const vibChange = (Math.random() - 0.5) * 0.2;
            let newVib = machine.vibration + vibChange;
            if (newVib < 0) newVib = 0;
            
            // Random humidity fluctuation
            const humChange = (Math.random() - 0.5) * 2;
            let newHum = machine.humidity + humChange;
            if (newHum < 0) newHum = 0;
            if (newHum > 100) newHum = 100;
            
            // Determine status based on temperature and vibration
            let newStatus = 'normal';
            if (newTemp > 35 || newVib > 1.0) newStatus = 'warning';
            if (newTemp > 42 || newVib > 2.0) newStatus = 'critical';
            
            // If status changed to critical, generate alert
            if (newStatus === 'critical' && machine.status !== 'critical') {
              addAlert({
                type: 'danger',
                message: `Alerte critique - ${machine.name}`,
                machineId: machine.id,
                icon: newTemp > 42 ? 'temperature' : 'vibration'
              });
            }
            // If status changed to warning, generate alert
            else if (newStatus === 'warning' && machine.status === 'normal') {
              addAlert({
                type: 'warning',
                message: `Avertissement - ${machine.name}`,
                machineId: machine.id,
                icon: newTemp > 35 ? 'temperature' : 'vibration'
              });
            }
            
            return {
              ...machine,
              temperature: parseFloat(newTemp.toFixed(1)),
              vibration: parseFloat(newVib.toFixed(2)),
              humidity: parseFloat(newHum.toFixed(1)),
              status: newStatus
            };
          }
          return machine;
        });
      });
    }, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  // Apply dark mode to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);
  
  // Format timestamp to readable format
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('fr-FR');
  };
  
  // Calculate time ago from timestamp
  const timeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}mo ago`;
  };
  
  // Listen for WebSocket notifications
  useEffect(() => {
    // This function would connect to your WebSocket server and listen for notifications
    const connectToWebSocketServer = () => {
      try {
        const ws = new WebSocket('ws://localhost:3000');
        
        ws.onopen = () => {
          console.log('Connected to WebSocket server');
          
          // Register as a web client with FCM token if available
          const fcmToken = localStorage.getItem('fcmToken');
          if (fcmToken) {
            ws.send(JSON.stringify({
              type: 'web_client',
              fcmToken: fcmToken
            }));
          }
        };
        
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          
          // Handle different message types
          if (data.type === 'critical_state') {
            addNotification(
              'Critical Alert',
              data.message,
              'critical'
            );
          } else if (data.type === 'sensor_data') {
            // Process sensor data (you might want to check for thresholds here)
            const sensorData = data.data;
            
            // Example: Check for temperature threshold
            if (sensorData.sensors && sensorData.sensors.temperature > 35) {
              addNotification(
                'High Temperature',
                `Temperature on ${sensorData.device} is ${sensorData.sensors.temperature.toFixed(1)}°C`,
                'warning'
              );
            }
          }
        };
        
        ws.onclose = () => {
          console.log('Disconnected from WebSocket server. Reconnecting in 5s...');
          setTimeout(connectToWebSocketServer, 5000);
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
        
        return ws;
      } catch (error) {
        console.error('Error connecting to WebSocket:', error);
        setTimeout(connectToWebSocketServer, 5000);
      }
    };
    
    // Connect to WebSocket server
    const ws = connectToWebSocketServer();
    
    // Clean up on unmount
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);
  
  // Request notification permission
  useEffect(() => {
    const requestNotificationPermission = async () => {
      if ('Notification' in window) {
        try {
          // Check if permission is already granted
          if (Notification.permission === 'granted') {
            console.log('Notification permission already granted');
            return;
          }

          // Check if permission is denied
          if (Notification.permission === 'denied') {
            console.log('Notification permission denied');
            // Add a notification to inform the user they need to enable notifications in browser settings
            addNotification(
              'Notification Permission Required',
              'Please enable notifications in your browser settings to receive critical updates.',
              'warning'
            );
            return;
          }

          // Request permission
          const permission = await Notification.requestPermission();
          console.log('Notification permission result:', permission);

          if (permission === 'granted') {
            console.log('Notification permission granted');
            // Add a success notification
            addNotification(
              'Notifications Enabled',
              'You will now receive notifications for critical updates.',
              'success'
            );
          } else if (permission === 'denied') {
            console.log('Notification permission denied');
            // Add a warning notification
            addNotification(
              'Notification Permission Required',
              'Please enable notifications in your browser settings to receive critical updates.',
              'warning'
            );
          }
        } catch (error) {
          console.error('Error requesting notification permission:', error);
          // Add an error notification
          addNotification(
            'Notification Error',
            'There was an error setting up notifications. Please try again later.',
            'error'
          );
        }
      } else {
        console.log('Notifications not supported in this browser');
        // Add an info notification
        addNotification(
          'Notifications Not Supported',
          'Your browser does not support notifications.',
          'info'
        );
      }
    };
    
    requestNotificationPermission();
  }, []);
  
  return (
    <AppContext.Provider value={{
      darkMode,
      toggleDarkMode,
      machines,
      setMachines,
      toggleMachineStatus,
      alerts,
      setAlerts,
      addAlert,
      history,
      setHistory,
      productionData,
      refreshProductionData,
      productData,
      isLoading,
      error,
      user,
      setUser,
      formatTimestamp,
      timeAgo,
      notifications,
      addNotification,
      markNotificationAsRead,
      clearAllNotifications
    }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => useContext(AppContext); 