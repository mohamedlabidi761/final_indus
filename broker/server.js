const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

// Critical thresholds
const CRITICAL_TEMP = 30;      // °C
const CRITICAL_VIBRATION = 80; // %
const CRITICAL_LIGHT = 20;     // %

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

// Store critical states
const criticalStates = {};

// Store web clients for notifications
const webClients = new Map(); // Map to store web clients and their FCM tokens

// Initialize Firebase Admin SDK
let firebaseEnabled = false;
console.log('Firebase notifications disabled for testing');

// Function to send push notification
async function sendPushNotification(fcmToken, title, body, data = {}) {
    console.log('WebSocket notification:', { title, body, data });
    
    // Send to all connected web clients via WebSocket
    webClients.forEach((token, client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'notification',
                title: title,
                body: body,
                data: data,
                timestamp: new Date().toISOString()
            }));
        }
    });
}

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
            
            // Check if this is a web client registration with FCM token
            if (data.type === 'web_client') {
                webClients.set(ws, data.fcmToken);
                console.log('Web client registered with FCM token');
                return;
            }
            
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
        webClients.delete(ws);
        // Find and remove the device
        for (const [deviceId, device] of connectedDevices.entries()) {
            if (device.ws === ws) {
                console.log(`Device ${deviceId} disconnected`);
                device.connected = false;
                device.lastSeen = new Date().toISOString();
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

    // Check for critical conditions
    if (data.sensors) {
        const isCritical = 
            data.sensors.temperature >= CRITICAL_TEMP ||
            data.sensors.vibration >= CRITICAL_VIBRATION ||
            data.sensors.light <= CRITICAL_LIGHT;

        // Update critical state
        criticalStates[deviceId] = isCritical;

        // If state is critical, notify all web clients
        if (isCritical) {
            const criticalMessage = {
                type: 'critical_state',
                device: deviceId,
                deviceName: device.name,
                timestamp: timestamp,
                sensors: data.sensors,
                message: `Critical state detected for ${device.name}:` +
                    (data.sensors.temperature >= CRITICAL_TEMP ? ` Temperature: ${data.sensors.temperature.toFixed(1)}°C` : '') +
                    (data.sensors.vibration >= CRITICAL_VIBRATION ? ` Vibration: ${data.sensors.vibration.toFixed(1)}%` : '') +
                    (data.sensors.light <= CRITICAL_LIGHT ? ` Light: ${data.sensors.light.toFixed(1)}%` : '')
            };

            // Send notification to all web clients with FCM tokens
            webClients.forEach((fcmToken, client) => {
                if (fcmToken) {
                    sendPushNotification(
                        fcmToken,
                        'État Critique Détecté',
                        criticalMessage.message,
                        {
                            deviceId: deviceId,
                            type: 'critical_state',
                            timestamp: timestamp
                        }
                    );
                }
            });

            // Also send WebSocket message for real-time updates
            webClients.forEach((fcmToken, client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(criticalMessage));
                }
            });
        }
    }
    
    // Send acknowledgment
    ws.send(JSON.stringify({
        type: 'data_received',
        timestamp: timestamp
    }));
    
    // Broadcast to all web clients
    broadcastSensorData(deviceId, sensorDataWithTimestamp);
    
    console.log(`Received sensor data from ${deviceId}`);
}

// Broadcast sensor data to all web clients
function broadcastSensorData(deviceId, data) {
    webClients.forEach((fcmToken, client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'sensor_data',
                data: data
            }));
        }
    });
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

// Add a test endpoint for push notifications
app.post('/api/test-notification', async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    console.error('Test notification request missing FCM token');
    return res.status(400).json({ 
      error: 'FCM Token is required',
      timestamp: new Date().toISOString()
    });
  }
  
  if (!firebaseEnabled) {
    console.error('Test notification request failed - Firebase not initialized');
    return res.status(500).json({ 
      error: 'Firebase not initialized on the server',
      timestamp: new Date().toISOString()
    });
  }
  
  console.log('Sending test notification to token:', token.substring(0, 10) + '...');
  
  try {
    // Send test notification
    await sendPushNotification(
      token,
      'Test Notification',
      'This is a test notification from the IoT Server',
      { type: 'test', timestamp: new Date().toISOString() }
    );
    
    console.log('Test notification sent successfully');
    res.json({ 
      success: true, 
      message: 'Test notification sent',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint to serve Firebase config
app.get('/api/firebase-config', (req, res) => {
  // Make sure we're providing the full necessary configuration
  // The VAPID key must be a valid public key from your Firebase project
  res.json({
    apiKey: "AIzaSyA5cdGeJ8dyB9_RlO08qOSTUJDKmpm8LBw",
    authDomain: "dashbord-c3360.firebaseapp.com",
    projectId: "dashbord-c3360",
    storageBucket: "dashbord-c3360.firebasestorage.app",
    messagingSenderId: "240340486659",
    appId: "1:240340486659:web:096a3dd141c3129e8c9c36",
    databaseURL: "https://dashbord-c3360-default-rtdb.firebaseio.com", // Add databaseURL if missing
    vapidKey: "BJY7UoVDI9eqXVZdI0RDVLdTF5PeqZiYXoSXu9Mv_LD4c2HQfP58zBOLUgK_L60fYrVqmMgPjV89bzQ0JLa-EPE"
  });
});

// Serve the notification test page
app.get('/notification-test', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'notification-test.html'));
});

// Serve the service worker registration page
app.get('/register-sw', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register-sw.html'));
});

// Serve the FCM debug page
app.get('/fcm-debug', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'fcm-debug.html'));
});

// Serve the dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
const startServer = (port) => {
    server.listen(port, () => {
        console.log(`Server is running on port ${port}`);
        console.log(`WebSocket server available at ws://localhost:${port}`);
        console.log(`Dashboard available at http://localhost:${port}`);
        console.log(`Notification test page available at http://localhost:${port}/notification-test`);
        console.log(`Service worker registration page available at http://localhost:${port}/register-sw`);
        console.log(`FCM Debug page available at http://localhost:${port}/fcm-debug`);
        
        if (firebaseEnabled) {
            console.log('Firebase messaging is ENABLED for push notifications');
        } else {
            console.warn('Firebase messaging is DISABLED - using WebSocket notifications only');
        }
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is busy, trying ${port + 1}...`);
            startServer(port + 1);
        } else {
            console.error('Server error:', err);
            process.exit(1); // Exit if there's a non-port-related error
        }
    });
};

// Kill any existing processes on port 3000 before starting
const killProcess = (port) => {
    return new Promise((resolve) => {
        const cmd = process.platform === 'win32' 
            ? `netstat -ano | findstr :${port}`
            : `lsof -i :${port} -t`;
            
        require('child_process').exec(cmd, (err, stdout) => {
            if (err) {
                console.log(`No process found on port ${port}`);
                resolve();
                return;
            }
            
            const pid = process.platform === 'win32'
                ? stdout.split('\r\n')[0].split(/\s+/)[4]
                : stdout.trim();
                
            if (pid) {
                const killCmd = process.platform === 'win32'
                    ? `taskkill /F /PID ${pid}`
                    : `kill -9 ${pid}`;
                    
                require('child_process').exec(killCmd, (err) => {
                    if (err) {
                        console.error(`Failed to kill process on port ${port}:`, err);
                    } else {
                        console.log(`Killed process ${pid} on port ${port}`);
                    }
                    resolve();
                });
            } else {
                resolve();
            }
        });
    });
};

// Start the server after killing any existing process
killProcess(PORT).then(() => {
    startServer(PORT);
}); 