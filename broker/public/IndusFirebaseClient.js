// IndusFirebaseClient.js - React component for IndusTech dashboard to receive Firebase data
// Copy this file to your React project and import it in your App.js or main component

import React, { useEffect, useState, useContext } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { NotificationContext } from './context/NotificationContext'; // Adjust this import as needed

// Firebase Configuration - Make sure it matches the ESP8266 dashboard configuration
const firebaseConfig = {
    apiKey: "AIzaSyA5cdGeJ8dyB9_RlO08qOSTUJDKmpm8LBw",
    authDomain: "dashbord-c3360.firebaseapp.com",
    projectId: "dashbord-c3360",
    storageBucket: "dashbord-c3360.firebasestorage.app",
    messagingSenderId: "240340486659",
    appId: "1:240340486659:web:096a3dd141c3129e8c9c36",
    measurementId: "G-8V808QB537",
    databaseURL: "https://dashbord-c3360-default-rtdb.firebaseio.com"
};

// Initialize Firebase if not already initialized
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app(); // if already initialized, use that one
}

const IndusFirebaseClient = () => {
    const [connected, setConnected] = useState(false);
    const [latestData, setLatestData] = useState(null);
    const [deviceStatus, setDeviceStatus] = useState({});
    const { showNotification } = useContext(NotificationContext); // Assuming you have a notification context
    
    useEffect(() => {
        // Reference to database
        const database = firebase.database();
        
        // Monitor connection state
        const connectedRef = database.ref('.info/connected');
        const connectionHandler = connectedRef.on('value', (snap) => {
            const isConnected = snap.val() === true;
            setConnected(isConnected);
            console.log('Firebase connection status:', isConnected ? 'Connected' : 'Disconnected');
        });
        
        // Listen for new notifications
        const notificationsRef = database.ref('notifications');
        const notificationHandler = notificationsRef.orderByChild('timestamp').startAt(Date.now()).on('child_added', (snapshot) => {
            const notification = snapshot.val();
            console.log('New notification received:', notification);
            
            // Show notification using the context
            if (showNotification && !notification.read) {
                showNotification(
                    notification.title || 'New Alert', 
                    notification.message || 'You have a new notification', 
                    notification.type || 'info'
                );
                
                // Mark as read
                snapshot.ref.update({ read: true });
            }
        });
        
        // Listen for sensor data
        const sensorDataRef = database.ref('sensor_data');
        const sensorDataHandler = sensorDataRef.limitToLast(1).on('child_added', (snapshot) => {
            const data = snapshot.val();
            console.log('New sensor data received:', data);
            setLatestData(data);
            
            // Check for critical values and show notifications if needed
            if (data && data.sensors) {
                if (data.sensors.temperature && data.sensors.temperature > 30) {
                    showNotification(
                        'Temperature Alert', 
                        `Temperature reading is ${data.sensors.temperature.toFixed(1)}°C, which is above threshold`, 
                        'warning'
                    );
                }
                
                if (data.sensors.vibration && data.sensors.vibration > 80) {
                    showNotification(
                        'Vibration Alert', 
                        `Vibration level is ${data.sensors.vibration.toFixed(1)}%, which is above threshold`,
                        'critical'
                    );
                }
            }
        });
        
        // Listen for device status changes
        const deviceStatusRef = database.ref('device_status');
        const deviceStatusHandler = deviceStatusRef.on('child_added', (snapshot) => {
            const status = snapshot.val();
            console.log('Device status update:', status);
            
            if (status && status.device) {
                setDeviceStatus(prev => ({
                    ...prev,
                    [status.device]: status
                }));
                
                // Show notification for offline devices
                if (status.status === 'offline') {
                    showNotification(
                        'Device Offline', 
                        `Device ${status.device} has gone offline`, 
                        'warning'
                    );
                }
            }
        });
        
        // Listen for connectivity events
        const connectivityRef = database.ref('connectivity');
        const connectivityHandler = connectivityRef.on('child_added', (snapshot) => {
            const event = snapshot.val();
            console.log('Connectivity event:', event);
            
            // Show notification when ESP8266 Dashboard connects
            if (event.device === 'ESP8266_Dashboard' && event.status === 'connected') {
                showNotification(
                    'ESP8266 Dashboard Connected', 
                    'The ESP8266 IoT Dashboard is now connected and sending data', 
                    'info'
                );
            }
        });
        
        // Cleanup function
        return () => {
            console.log('Cleaning up Firebase listeners');
            connectedRef.off('value', connectionHandler);
            notificationsRef.off('child_added', notificationHandler);
            sensorDataRef.off('child_added', sensorDataHandler);
            deviceStatusRef.off('child_added', deviceStatusHandler);
            connectivityRef.off('child_added', connectivityHandler);
        };
    }, [showNotification]); // Dependency on showNotification context function
    
    return (
        <div className="firebase-status">
            <div className={`status-indicator ${connected ? 'status-connected' : 'status-disconnected'}`}>
                Firebase: {connected ? 'Connected' : 'Disconnected'}
            </div>
            {latestData && (
                <div className="data-timestamp">
                    Last data received: {new Date(latestData.timestamp).toLocaleTimeString()}
                </div>
            )}
        </div>
    );
};

export default IndusFirebaseClient;

// How to use this component in your React app:
// 
// 1. Copy this file to your React project
// 2. Import it in your App.js or main component:
//    import IndusFirebaseClient from './IndusFirebaseClient';
// 
// 3. Add it to your render function:
//    <IndusFirebaseClient />
// 
// 4. Make sure you have a NotificationContext or modify this component
//    to use your own notification system.
//
// Example NotificationContext implementation:
/*
import React, { createContext, useState } from 'react';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    
    const showNotification = (title, message, type = 'info') => {
        const id = Date.now();
        const newNotification = { id, title, message, type };
        
        setNotifications(prev => [...prev, newNotification]);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    };
    
    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };
    
    return (
        <NotificationContext.Provider value={{ notifications, showNotification, removeNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};
*/ 