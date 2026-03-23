'use client'
// src/components/layout/AuthProvider.tsx

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  collection, doc, onSnapshot, getDoc,
} from 'firebase/firestore'
import { db, COLS } from '@/lib/firebase'
import { onAuthStateChanged } from '@/lib/auth'
import { useStore } from '@/store'

const PUBLIC_PATHS = ['/auth/login', '/auth/register', '/auth/forgot-password', '/']

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { setUser, setHabits, setJournals, setTodos, setMoods,
          setAlarms, setXpLog, setStats, setLoading } = useStore()

  useEffect(() => {
    const unsubs: (() => void)[] = []

    const unsubAuth = onAuthStateChanged(async (user) => {
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
        )

        setLoading(false)
        if (PUBLIC_PATHS.includes(pathname)) {
          router.replace('/dashboard/habits')
        }
      } else {
        setUser(null, null, null)
        setLoading(false)
        if (!PUBLIC_PATHS.includes(pathname)) {
          router.replace('/auth/login')
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
