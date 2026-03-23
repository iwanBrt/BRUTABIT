// public/firebase-messaging-sw.js
// Service Worker untuk Firebase Cloud Messaging (background notifications)
// File ini harus ada di folder /public

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// ⚠️ Ganti dengan config Firebase kamu
firebase.initializeApp({
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(payload => {
  const { title, body, icon } = payload.notification ?? {};
  self.registration.showNotification(title ?? 'BRUTABIT', {
    body: body ?? '',
    icon: icon ?? '/icon.png',
    badge: '/icon.png',
    vibrate: [200, 100, 200],
    data: payload.data,
  });
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
