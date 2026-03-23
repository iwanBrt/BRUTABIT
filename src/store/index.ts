'use client'
// src/store/index.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { db, COLS } from '@/lib/firebase'
import {
  doc, collection, setDoc, updateDoc,
  getDocs, onSnapshot, deleteDoc, serverTimestamp,
} from 'firebase/firestore'
import type { Habit, JournalEntry, Todo, MoodEntry, XPLogEntry, AlarmConfig } from '@/types'
import { BADGES } from '@/types'
import { format } from 'date-fns'

export const todayKey = () => format(new Date(), 'yyyy-MM-dd')

interface AppState {
  // Auth
  userId:    string | null
  userEmail: string | null
  userName:  string | null

  // Data
  habits:   Habit[]
  journals: JournalEntry[]
  todos:    Todo[]
  moods:    MoodEntry[]
  xpLog:    XPLogEntry[]
  alarms:   AlarmConfig[]

  // Stats
  xp:           number
  earnedBadges: string[]
  maxStreak:    number

  // UI
  isLoading: boolean
  theme:     'light' | 'dark'
  sidebarOpen: boolean

  // Actions
  setUser:       (uid: string | null, email: string | null, name: string | null) => void
  setHabits:     (h: Habit[]) => void
  setJournals:   (j: JournalEntry[]) => void
  setTodos:      (t: Todo[]) => void
  setMoods:      (m: MoodEntry[]) => void
  setAlarms:     (a: AlarmConfig[]) => void
  setXpLog:      (l: XPLogEntry[]) => void
  setLoading:    (v: boolean) => void
  setTheme:      (t: 'light' | 'dark') => void
  setSidebarOpen:(v: boolean) => void
  setStats:      (xp: number, badges: string[]) => void
  addXP:         (amount: number, reason: string) => Promise<void>
  checkBadges:   () => Promise<void>
  computeMaxStreak: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      userId: null, userEmail: null, userName: null,
      habits: [], journals: [], todos: [], moods: [], xpLog: [], alarms: [],
      xp: 0, earnedBadges: [], maxStreak: 0,
      isLoading: true, theme: 'light', sidebarOpen: true,

      setUser:        (uid, email, name) => set({ userId: uid, userEmail: email, userName: name }),
      setHabits:      (habits) => { set({ habits }); get().computeMaxStreak() },
      setJournals:    (journals) => set({ journals }),
      setTodos:       (todos) => set({ todos }),
      setMoods:       (moods) => set({ moods }),
      setAlarms:      (alarms) => set({ alarms }),
      setXpLog:       (xpLog) => set({ xpLog }),
      setLoading:     (v) => set({ isLoading: v }),
      setTheme:       (t) => set({ theme: t }),
      setSidebarOpen: (v) => set({ sidebarOpen: v }),
      setStats:       (xp, earnedBadges) => set({ xp, earnedBadges }),

      computeMaxStreak: () => {
        const { habits } = get()
        let max = 0
        habits.forEach(h => {
          let streak = 0
          const d = new Date()
          while (true) {
            const k = format(d, 'yyyy-MM-dd')
            if (!h.done[k]) break
            streak++
            d.setDate(d.getDate() - 1)
          }
          if (streak > max) max = streak
        })
        set({ maxStreak: max })
      },

      addXP: async (amount, reason) => {
        const { userId, xp } = get()
        if (!userId) return
        const newXP = xp + amount
        set({ xp: newXP })

        const entry: XPLogEntry = {
          id: Date.now().toString(),
          date: todayKey(),
          reason,
          amount,
        }

        // Firestore
        const statsRef = doc(db, COLS.users, userId, 'stats', 'main')
        await updateDoc(statsRef, { xp: newXP, updatedAt: new Date().toISOString() })
          .catch(() => setDoc(statsRef, { xp: newXP, earnedBadges: [], updatedAt: new Date().toISOString() }))

        await setDoc(doc(db, COLS.users, userId, 'xpLog', entry.id), entry)
        await get().checkBadges()
      },

      checkBadges: async () => {
        const state = get()
        const { userId, earnedBadges } = state
        if (!userId) return

        const newBadges: string[] = []
        BADGES.forEach(b => {
          if (!earnedBadges.includes(b.id) && b.req(state)) {
            newBadges.push(b.id)
          }
        })

        if (newBadges.length > 0) {
          const updated = [...earnedBadges, ...newBadges]
          set({ earnedBadges: updated })
          const newXP = get().xp + newBadges.length * 25
          set({ xp: newXP })
          const statsRef = doc(db, COLS.users, userId, 'stats', 'main')
          await updateDoc(statsRef, { earnedBadges: updated, xp: newXP })
            .catch(() => {})
        }
      },
    }),
    {
      name: 'brutabit-web-store',
      partialize: (s) => ({ theme: s.theme, sidebarOpen: s.sidebarOpen }),
    }
  )
)
