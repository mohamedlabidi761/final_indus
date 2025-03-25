// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase configuration with VAPID key - DON'T CHANGE THIS
const firebaseConfig = {
  apiKey: "AIzaSyA5cdGeJ8dyB9_RlO08qOSTUJDKmpm8LBw",
  authDomain: "dashbord-c3360.firebaseapp.com",
  projectId: "dashbord-c3360",
  storageBucket: "dashbord-c3360.firebasestorage.app",
  messagingSenderId: "240340486659",
  appId: "1:240340486659:web:096a3dd141c3129e8c9c36",
  databaseURL: "https://dashbord-c3360-default-rtdb.firebaseio.com",
  // VAPID key for web push
  vapidKey: "BJY7UoVDI9eqXVZdI0RDVLdTF5PeqZiYXoSXu9Mv_LD4c2HQfP58zBOLUgK_L60fYrVqmMgPjV89bzQ0JLa-EPE"
};

// Initialize Firebase
console.log('[firebase-messaging-sw.js] Service worker starting up');
console.log('[firebase-messaging-sw.js] Initializing Firebase with config');

let app;
let messaging;

try {
  // Clean up any existing Firebase instances first
  if (firebase.apps.length) {
    console.log('[firebase-messaging-sw.js] Firebase app already exists, using existing instance');
    app = firebase.app();
  } else {
    app = firebase.initializeApp(firebaseConfig);
    console.log('[firebase-messaging-sw.js] Firebase initialized with new app instance');
  }
  
  // Initialize Firebase messaging
  messaging = firebase.messaging();
  console.log('[firebase-messaging-sw.js] Firebase messaging initialized');

  // Handle background messages
  messaging.onBackgroundMessage(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);
    
    // Extract notification data
    const notificationTitle = payload.notification?.title || 'IndusTech Notification';
    const notificationOptions = {
      body: payload.notification?.body || 'New alert from IndusTech Dashboard',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'industech-notification-' + new Date().getTime(),
      renotify: true,
      requireInteraction: true,
      data: {
        url: '/',
        time: new Date().getTime(),
        ...payload.data
      }
    };
    
    // Show notification
    console.log('[firebase-messaging-sw.js] Showing notification:', notificationTitle, notificationOptions);
    return self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (error) {
  console.error('[firebase-messaging-sw.js] Error initializing Firebase:', error);
}

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  console.log('[firebase-messaging-sw.js] Notification clicked');
  event.notification.close();
  
  // Get the notification data
  const clickedNotification = event.notification;
  const url = clickedNotification.data?.url || '/';
  
  // Open or focus the main dashboard
  event.waitUntil(
    self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(clientList) {
      // Check if a window is already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        // If already open, focus it
        if ('focus' in client) {
          return client.focus();
        }
      }
      // If not, open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

// Service worker installation event
self.addEventListener('install', function(event) {
  console.log('[firebase-messaging-sw.js] Service worker installed');
  self.skipWaiting(); // Activate immediately
});

// Service worker activation event
self.addEventListener('activate', function(event) {
  console.log('[firebase-messaging-sw.js] Service worker activated');
  return self.clients.claim(); // Take control of all clients
});

// Handle messages sent to the service worker
self.addEventListener('message', function(event) {
  console.log('[firebase-messaging-sw.js] Received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[firebase-messaging-sw.js] Skipping waiting and activating now');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLAIM_CLIENTS') {
    console.log('[firebase-messaging-sw.js] Claiming all clients as requested');
    event.waitUntil(self.clients.claim());
  }
});

// Log any errors
self.addEventListener('error', function(event) {
    console.error('[firebase-messaging-sw.js] Service worker error:', event.error);
}); 