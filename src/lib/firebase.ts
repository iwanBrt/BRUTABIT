// src/lib/firebase.ts
// ⚠️ Ganti dengan config Firebase kamu dari console.firebase.google.com
// Project Settings → General → Your apps → Web app → SDK setup

import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getMessaging, isSupported } from 'firebase/messaging'

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Init only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const auth = getAuth(app)
export const db   = getFirestore(app)

// Messaging (browser push notification) — only in browser, not SSR
export const getMessagingInstance = async () => {
  const supported = await isSupported()
  if (!supported) return null
  return getMessaging(app)
}

// Firestore collection paths
export const COLS = {
  users:    'users',
  habits:   (uid: string) => `users/${uid}/habits`,
  journals: (uid: string) => `users/${uid}/journals`,
  todos:    (uid: string) => `users/${uid}/todos`,
  moods:    (uid: string) => `users/${uid}/moods`,
  stats:    (uid: string) => `users/${uid}/stats`,
  xpLog:    (uid: string) => `users/${uid}/xpLog`,
  alarms:   (uid: string) => `users/${uid}/alarms`,
}
