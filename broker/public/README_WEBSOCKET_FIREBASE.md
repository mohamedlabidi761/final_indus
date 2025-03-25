# WebSocket to Firebase Data Transmission

This document explains how data is transmitted from the ESP8266 IoT Dashboard's WebSocket connection to Firebase Realtime Database for consumption by the IndusTech dashboard.

## Overview

The system implements a data pipeline with the following flow:

1. **Sensor Data Collection**: ESP8266 devices collect sensor data and send it to the WebSocket server
2. **WebSocket Server**: Receives the data and broadcasts it to connected clients 
3. **ESP8266 IoT Dashboard**: Acts as a bridge between WebSocket and Firebase
4. **Firebase Realtime Database**: Stores the data in structured collections
5. **IndusTech Dashboard**: Consumes data from Firebase to display notifications and real-time metrics

## Implementation Details

### WebSocket Data Reception

The ESP8266 IoT Dashboard receives data via WebSocket connection and processes it based on the message type:

```javascript
socket.addEventListener('message', (event) => {
    try {
        const data = JSON.parse(event.data);
        // Forward data to Firebase based on type
        if (firebaseInitialized) {
            forwardWebSocketDataToFirebase(data);
        }
        
        // Also handle data locally
        // ...
    } catch (error) {
        console.error('Error parsing WebSocket message:', error);
    }
});
```

### Firebase Data Transmission

The data is forwarded to Firebase Realtime Database according to the message type:

```javascript
function forwardWebSocketDataToFirebase(data) {
    switch(data.type) {
        case 'sensor_data':
            // Send to sensor_data collection
            break;
        case 'critical_state':
            // Send to notifications collection
            break;
        case 'device_status':
            // Send to device_status collection
            break;
        default:
            // Send to events collection
    }
}
```

### Database Structure

The Firebase Realtime Database is organized into the following collections:

- `sensor_data`: Contains all sensor readings with timestamps
- `notifications`: Stores critical alerts that should be displayed to users
- `device_status`: Tracks when devices connect/disconnect
- `events`: Captures all other system events
- `connectivity`: Shows connection status between systems

### Monitoring

The ESP8266 IoT Dashboard displays a status indicator showing the Firebase connection status:

- **Connected**: Successfully transmitting data to Firebase
- **Disconnected**: Unable to reach Firebase
- **Error**: Problem with data transmission
- **Pending**: Initializing connection

## Troubleshooting

If data isn't appearing in the IndusTech dashboard:

1. Check the Firebase status indicator on the ESP8266 IoT Dashboard
2. Verify WebSocket connection is active
3. Look for console errors in the browser developer tools
4. Confirm the Firebase configuration is correct in both dashboards
5. Check Firebase Realtime Database rules to ensure write permission
6. Verify the IndusTech dashboard is correctly subscribed to Firebase updates

## WebSocket Message Types

The system processes these message types:

- `sensor_data`: Regular sensor readings (temperature, humidity, etc.)
- `critical_state`: Alerts about devices exceeding thresholds
- `device_status`: Connection status changes for devices
- `connection`: WebSocket connection events
- Other types are forwarded to the `events` collection

## IndusTech Dashboard Integration

The IndusTech dashboard should:

1. Initialize Firebase with the same configuration
2. Subscribe to the appropriate collections
3. Process and display notifications from the `notifications` collection
4. Update UI elements based on real-time data from `sensor_data`

## Sample Code for IndusTech Dashboard

```javascript
// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA5cdGeJ8dyB9_RlO08qOSTUJDKmpm8LBw",
    authDomain: "dashbord-c3360.firebaseapp.com",
    projectId: "dashbord-c3360",
    databaseURL: "https://dashbord-c3360-default-rtdb.firebaseio.com"
    // ... other config values
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Listen for new notifications
const notificationsRef = database.ref('notifications');
notificationsRef.on('child_added', (snapshot) => {
    const notification = snapshot.val();
    
    // Display notification in UI
    showNotification(
        notification.title, 
        notification.message, 
        notification.type
    );
    
    // Mark as read in database
    snapshot.ref.update({ read: true });
});

// Listen for sensor data
const sensorDataRef = database.ref('sensor_data');
sensorDataRef.limitToLast(1).on('child_added', (snapshot) => {
    const data = snapshot.val();
    
    // Update dashboard with latest values
    updateDashboardMetrics(data);
});
```

## Security Considerations

- Firebase Database Rules should restrict read/write access appropriately
- Consider adding authentication for production environments
- Data validation should be implemented on both sending and receiving sides
- Sensitive information should not be transmitted through this channel 