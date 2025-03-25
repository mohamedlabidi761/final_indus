const WebSocket = require('ws');

// Connect to WebSocket server
const ws = new WebSocket('ws://localhost:3000');

// Test device data
const deviceData = {
    type: 'register',
    deviceId: 'test_device_001',
    name: 'Test Sensor Device',
    fcmToken: 'test_fcm_token_123'
};

// Function to generate random sensor data with occasional critical values
function generateSensorData() {
    // 20% chance of generating critical values
    const isCritical = Math.random() < 0.2;
    
    if (isCritical) {
        // Generate critical values
        return {
            temperature: 30 + Math.random() * 10,    // 30-40°C (critical)
            vibration: 80 + Math.random() * 20,      // 80-100% (critical)
            light: Math.random() * 20,               // 0-20% (critical)
            humidity: 70 + Math.random() * 30        // 70-100% (high humidity)
        };
    } else {
        // Generate normal values
        return {
            temperature: 20 + Math.random() * 9,     // 20-29°C (normal)
            vibration: Math.random() * 79,           // 0-79% (normal)
            light: 21 + Math.random() * 79,          // 21-100% (normal)
            humidity: 30 + Math.random() * 40        // 30-70% (normal humidity)
        };
    }
}

// Handle connection open
ws.on('open', () => {
    console.log('Connected to server');

    // Register device
    ws.send(JSON.stringify(deviceData));
    console.log('Sent registration:', deviceData);

    // Send sensor data every 3 seconds
    setInterval(() => {
        const sensors = generateSensorData();
        const sensorData = {
            type: 'sensor_data',
            device: deviceData.deviceId,
            sensors,
            system: {
                uptime: Math.floor(process.uptime()),
                freeHeap: Math.floor(Math.random() * 1000000),
                rssi: -1 * Math.floor(Math.random() * 60 + 40) // Random RSSI between -40 and -100
            },
            receivedAt: new Date().toISOString()
        };
        
        ws.send(JSON.stringify(sensorData));
        console.log('Sent sensor data:', sensorData);

        // Check for critical conditions
        const isCritical = 
            sensors.temperature >= 30 ||
            sensors.vibration >= 80 ||
            sensors.light <= 20;

        if (isCritical) {
            console.log('Critical state detected!');
        }
    }, 3000);
});

// Handle messages from server
ws.on('message', (data) => {
    const message = JSON.parse(data);
    console.log('Received from server:', message);
});

// Handle errors
ws.on('error', (error) => {
    console.error('WebSocket error:', error);
});

// Handle connection close
ws.on('close', () => {
    console.log('Disconnected from server');
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('\nClosing connection...');
    ws.close();
    process.exit();
}); 