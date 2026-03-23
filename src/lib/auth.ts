'use client'
// src/lib/auth.ts

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged as _onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db, COLS } from './firebase'

const googleProvider = new GoogleAuthProvider()

export const loginWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password)

export const registerWithEmail = async (
  email: string,
  password: string,
  displayName: string
) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(cred.user, { displayName })
  await setDoc(doc(db, COLS.users, cred.user.uid), {
    uid: cred.user.uid, email, displayName,
    photoURL: null, createdAt: new Date().toISOString(),
  })
  await setDoc(doc(db, COLS.users, cred.user.uid, 'stats', 'main'), {
    xp: 0, earnedBadges: [], updatedAt: new Date().toISOString(),
  })
  return cred
}

export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider)
  const isNew = (result as any).additionalUserInfo?.isNewUser
  if (isNew) {
    await setDoc(doc(db, COLS.users, result.user.uid), {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
      createdAt: new Date().toISOString(),
    })
    await setDoc(doc(db, COLS.users, result.user.uid, 'stats', 'main'), {
      xp: 0, earnedBadges: [], updatedAt: new Date().toISOString(),
    })
  }
  return result
}

export const forgotPassword = (email: string) =>
  sendPasswordResetEmail(auth, email)

export const logout = () => signOut(auth)

export const onAuthStateChanged = (cb: (user: User | null) => void) =>
  _onAuthStateChanged(auth, cb)

export const getFriendlyError = (code: string): string => {
  const map: Record<string, string> = {
    'auth/user-not-found':          'Akun tidak ditemukan.',
    'auth/wrong-password':          'Password salah.',
    'auth/invalid-email':           'Format email tidak valid.',
    'auth/email-already-in-use':    'Email sudah digunakan.',
    'auth/weak-password':           'Password minimal 6 karakter.',
    'auth/too-many-requests':       'Terlalu banyak percobaan. Coba lagi nanti.',
    'auth/network-request-failed':  'Gagal terhubung ke internet.',
    'auth/popup-closed-by-user':    'Login dibatalkan.',
    'auth/invalid-credential':      'Email atau password salah.',
  }
  return map[code] ?? 'Terjadi kesalahan. Coba lagi.'
}
