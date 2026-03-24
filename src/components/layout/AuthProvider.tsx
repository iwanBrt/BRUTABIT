'use client'
// src/components/layout/AuthProvider.tsx

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  collection, doc, onSnapshot, getDoc, query, where
} from 'firebase/firestore'
import { db, COLS } from '@/lib/firebase'
import { onAuthStateChanged } from '@/lib/auth'
import { useStore } from '@/store'

const PUBLIC_PATHS = ['/auth/login', '/auth/register', '/auth/forgot-password', '/']

const playNotifSound = () => {
  try {
    const audio = new Audio('/notif.mp3')
    audio.play().catch(() => {})
  } catch (e) {
    // Ignore error (e.g., if audio autoplay blocked)
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { setUser, setHabits, setJournals, setTodos, setMoods,
          setAlarms, setXpLog, setStats, setLoading,
          setUnreadChats, setNotifications } = useStore()

  useEffect(() => {
    const unsubs: (() => void)[] = []

    const unsubAuth = onAuthStateChanged(async (user) => {
      let firstLoadChat = true
      let firstLoadNotif = true
      let currentUnread = 0

      if (user) {
        setUser(user.uid, user.email, user.displayName)

        // Load stats
        const statsSnap = await getDoc(doc(db, COLS.users, user.uid, 'stats', 'main'))
        if (statsSnap.exists()) {
          const d = statsSnap.data()
          setStats(d.xp ?? 0, d.earnedBadges ?? [])
        }

        // Realtime subscriptions
        unsubs.push(
          onSnapshot(collection(db, COLS.habits(user.uid)), snap =>
            setHabits(snap.docs.map(d => ({ id: d.id, ...d.data() }) as any))
          ),
          onSnapshot(
            collection(db, COLS.journals(user.uid)),
            snap => setJournals(snap.docs.map(d => ({ id: d.id, ...d.data() }) as any)
              .sort((a: any, b: any) => b.date.localeCompare(a.date)))
          ),
          onSnapshot(collection(db, COLS.todos(user.uid)), snap =>
            setTodos(snap.docs.map(d => ({ id: d.id, ...d.data() }) as any)
              .sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt)))
          ),
          onSnapshot(collection(db, COLS.moods(user.uid)), snap =>
            setMoods(snap.docs.map(d => ({ id: d.id, ...d.data() }) as any)
              .sort((a: any, b: any) => b.date.localeCompare(a.date)))
          ),
          onSnapshot(collection(db, COLS.alarms(user.uid)), snap =>
            setAlarms(snap.docs.map(d => ({ id: d.id, ...d.data() }) as any))
          ),
          onSnapshot(collection(db, COLS.xpLog(user.uid)), snap =>
            setXpLog(snap.docs.map(d => ({ id: d.id, ...d.data() }) as any)
              .sort((a: any, b: any) => b.createdAt?.localeCompare(a.createdAt)))
          ),
          onSnapshot(
            query(collection(db, COLS.chats), where('participants', 'array-contains', user.uid)),
            snap => {
              let unread = 0
              snap.docs.forEach(d => {
                const data = d.data()
                if (data.unreadCount && data.unreadCount[user.uid]) {
                  unread += data.unreadCount[user.uid]
                }
              })
              setUnreadChats(unread)
              
              if (!firstLoadChat && unread > currentUnread) {
                playNotifSound()
              }
              currentUnread = unread
              firstLoadChat = false
            }
          ),
          onSnapshot(
            query(collection(db, COLS.notifications), where('userId', '==', user.uid)),
            snap => {
              const notifs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
              notifs.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
              setNotifications(notifs)
              
              if (!firstLoadNotif) {
                const newAdded = snap.docChanges().some(c => c.type === 'added')
                if (newAdded) playNotifSound()
              }
              firstLoadNotif = false
            },
            err => console.error("Notifications err:", err)
          )
        )

        setLoading(false)
        if (PUBLIC_PATHS.includes(pathname)) {
          router.replace('/dashboard/habits')
        }
      } else {
        setUser(null, null, null)
        setLoading(false)
        if (!PUBLIC_PATHS.includes(pathname)) {
          router.replace('/')
        }
      }
    })

    return () => {
      unsubAuth()
      unsubs.forEach(u => u())
    }
  }, [])

  return <>{children}</>
}
