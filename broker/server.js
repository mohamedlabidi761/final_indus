const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Create express app
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected devices and sensor data
const connectedDevices = new Map();
const sensorData = new Map();
const sensorHistory = new Map();
const MAX_HISTORY_ITEMS = 1000;

// WebSocket connection handler
wss.on('connection', (ws, req) => {
  const ip = req.socket.remoteAddress;
  console.log(`New connection from ${ip}`);
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connection',
    message: 'Connected to IoT WebSocket Server',
    timestamp: new Date().toISOString()
  }));
  
  // Handle messages from devices
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      // Check if this is a device registration message
      if (data.type === 'register') {
        handleDeviceRegistration(ws, data, ip);
        return;
      }
      
      // Handle sensor data
      if (data.device && data.sensors) {
        handleSensorData(ws, data);
        return;
      }
      
      // Handle other message types
      console.log('Received message:', data);
      ws.send(JSON.stringify({
        type: 'ack',
        message: 'Message received',
        timestamp: new Date().toISOString()
      }));
      
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format',
        timestamp: new Date().toISOString()
      }));
    }
  });
  
  // Handle disconnection
  ws.on('close', () => {
    // Find and remove the device
    for (const [deviceId, device] of connectedDevices.entries()) {
      if (device.ws === ws) {
        console.log(`Device ${deviceId} disconnected`);
        device.connected = false;
        device.lastSeen = new Date().toISOString();
        // Keep the device in the map but mark as disconnected
        break;
      }
    }
  });
  
  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Handle device registration
function handleDeviceRegistration(ws, data, ip) {
  const deviceId = data.deviceId || `esp8266_${Date.now()}`;
  
  // Store device information
  connectedDevices.set(deviceId, {
    ws: ws,
    ip: ip,
    deviceId: deviceId,
    name: data.name || deviceId,
    type: data.type || 'unknown',
    connected: true,
    firstSeen: new Date().toISOString(),
    lastSeen: new Date().toISOString()
  });
  
  // Initialize sensor history for this device
  if (!sensorHistory.has(deviceId)) {
    sensorHistory.set(deviceId, []);
  }
  
  console.log(`Device registered: ${deviceId}`);
  
  // Send confirmation
  ws.send(JSON.stringify({
    type: 'registered',
    deviceId: deviceId,
    timestamp: new Date().toISOString()
  }));
}

// Handle sensor data
function handleSensorData(ws, data) {
  const deviceId = data.device;
  const timestamp = new Date().toISOString();
  
  // Check if device is registered
  if (!connectedDevices.has(deviceId)) {
    // Auto-register device if not registered
    handleDeviceRegistration(ws, { deviceId: deviceId }, ws._socket.remoteAddress);
  }
  
  // Update device's last seen time
  const device = connectedDevices.get(deviceId);
  device.lastSeen = timestamp;
  
  // Store the latest sensor data
  const sensorDataWithTimestamp = {
    ...data,
    receivedAt: timestamp
  };
  
  sensorData.set(deviceId, sensorDataWithTimestamp);
  
  // Add to history
  const history = sensorHistory.get(deviceId);
  history.unshift(sensorDataWithTimestamp);
  
  // Limit history size
  if (history.length > MAX_HISTORY_ITEMS) {
    history.pop();
  }
  
  // Send acknowledgment
  ws.send(JSON.stringify({
    type: 'data_received',
    timestamp: timestamp
  }));
  
  // Broadcast to all web clients
  broadcastSensorData(deviceId, sensorDataWithTimestamp);
  
  // Log data receipt
  console.log(`Received sensor data from ${deviceId}`);
}

// Broadcast sensor data to all web clients
function broadcastSensorData(deviceId, data) {
  wss.clients.forEach(client => {
    // Don't send back to the originating device
    const clientInfo = findClientDevice(client);
    
    // Only send to web clients (not sensor devices)
    if (!clientInfo || clientInfo.deviceId !== deviceId) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'sensor_data',
          data: data
        }));
      }
    }
  });
}

// Find device info for a WebSocket client
function findClientDevice(ws) {
  for (const [deviceId, device] of connectedDevices.entries()) {
    if (device.ws === ws) {
      return device;
    }
  }
  return null;
}

// API Routes

// Get list of all devices
app.get('/api/devices', (req, res) => {
  const devices = [];
  
  for (const [deviceId, device] of connectedDevices.entries()) {
    devices.push({
      deviceId: deviceId,
      name: device.name,
      type: device.type,
      connected: device.connected,
      ip: device.ip,
      firstSeen: device.firstSeen,
      lastSeen: device.lastSeen
    });
  }
  
  res.json({
    count: devices.length,
    devices: devices
  });
});

// Get latest data for a specific device
app.get('/api/devices/:deviceId/data', (req, res) => {
  const deviceId = req.params.deviceId;
  
  if (!connectedDevices.has(deviceId)) {
    return res.status(404).json({
      error: 'Device not found'
    });
  }
  
  const data = sensorData.get(deviceId) || { message: 'No data available' };
  
  res.json(data);
});

// Get history for a specific device
app.get('/api/devices/:deviceId/history', (req, res) => {
  const deviceId = req.params.deviceId;
  const limit = parseInt(req.query.limit) || 100;
  
  if (!connectedDevices.has(deviceId)) {
    return res.status(404).json({
      error: 'Device not found'
    });
  }
  
  const history = sensorHistory.get(deviceId) || [];
  
  res.json({
    deviceId: deviceId,
    count: Math.min(history.length, limit),
    data: history.slice(0, limit)
  });
});

// Get latest data for all devices
app.get('/api/data', (req, res) => {
  const allData = {};
  
  for (const [deviceId, data] of sensorData.entries()) {
    allData[deviceId] = data;
  }
  
  res.json({
    timestamp: new Date().toISOString(),
    devices: Object.keys(allData).length,
    data: allData
  });
});

// Serve the dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`IoT Server running on port ${PORT}`);
  console.log(`WebSocket server available at ws://localhost:${PORT}`);
  console.log(`Dashboard available at http://localhost:${PORT}`);
}); 