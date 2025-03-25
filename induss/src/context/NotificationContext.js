import React, { createContext, useState, useEffect, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Create context
export const NotificationContext = createContext();

// Notification Provider Component
export const NotificationProvider = ({ children }) => {
  const [fcmToken, setFcmToken] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [pushNotificationsSupported, setPushNotificationsSupported] = useState(
    'serviceWorker' in navigator && 'PushManager' in window
  );

  // Initialize Firebase
  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        // Fetch Firebase config from server
        const response = await fetch('/api/firebase-config');
        const firebaseConfig = await response.json();
        
        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const messaging = getMessaging(app);
        
        // Set up message listener for foreground messages
        onMessage(messaging, (payload) => {
          console.log('Message received in foreground:', payload);
          
          const { title, body } = payload.notification;
          showNotification(title, body, payload.data?.type || 'info');
        });
        
        setIsInitialized(true);
        console.log('Firebase initialized for push notifications');
      } catch (error) {
        console.error('Error initializing Firebase:', error);
      }
    };
    
    initializeFirebase();
  }, []);
  
  // Request notification permission and get FCM token
  const requestPermissionAndToken = async () => {
    if (!isInitialized || !pushNotificationsSupported) {
      console.log('Firebase not initialized or push notifications not supported');
      return;
    }
    
    try {
      console.log('Requesting notification permission...');
      const permission = await Notification.requestPermission();
      setPermissionGranted(permission === 'granted');
      
      if (permission === 'granted') {
        // Get app from initialized apps
        const app = initializeApp({}, 'fcm-app');
        const messaging = getMessaging(app);
        
        // Get FCM token
        const currentToken = await getToken(messaging, {
          vapidKey: (await fetch('/api/firebase-config').then(res => res.json())).vapidKey
        });
        
        if (currentToken) {
          console.log('FCM token obtained:', currentToken);
          setFcmToken(currentToken);
          
          // Store token in localStorage
          localStorage.setItem('fcmToken', currentToken);
          
          // Register with WebSocket server
          registerWithWebSocketServer(currentToken);
          
          return currentToken;
        } else {
          console.log('No token received');
          return null;
        }
      } else {
        console.log('Permission denied');
        return null;
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      return null;
    }
  };
  
  // Register token with WebSocket server
  const registerWithWebSocketServer = (token) => {
    try {
      const ws = new WebSocket('ws://localhost:3000');
      
      ws.onopen = () => {
        console.log('WebSocket connection opened, registering FCM token');
        ws.send(JSON.stringify({
          type: 'web_client',
          fcmToken: token
        }));
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      ws.onclose = () => {
        console.log('WebSocket connection closed');
      };
    } catch (error) {
      console.error('Error connecting to WebSocket server:', error);
    }
  };
  
  // Show notification
  const showNotification = (title, message, type = 'info') => {
    // If browser notification is supported and permission granted, show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body: message,
        icon: '/favicon.ico'
      });
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
    
    // You can also implement an in-app notification system here
    // For example, by setting state and displaying a toast or alert component
    console.log('Notification:', { title, message, type });
    
    // You could also dispatch an event to add this to your app context
    const event = new CustomEvent('app-notification', {
      detail: { title, message, type, timestamp: new Date().toISOString() }
    });
    window.dispatchEvent(event);
  };
  
  // Send test notification
  const sendTestNotification = async () => {
    if (!fcmToken) {
      console.error('No FCM token available');
      return false;
    }
    
    try {
      const response = await fetch('/api/test-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: fcmToken })
      });
      
      const result = await response.json();
      console.log('Test notification result:', result);
      return result.success;
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
    }
  };
  
  return (
    <NotificationContext.Provider value={{
      fcmToken,
      isInitialized,
      permissionGranted,
      pushNotificationsSupported,
      requestPermissionAndToken,
      showNotification,
      sendTestNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use the NotificationContext
export const useNotificationContext = () => useContext(NotificationContext); 