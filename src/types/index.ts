// src/types/index.ts

export interface User {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

export interface Habit {
  id: string
  userId: string
  name: string
  category: HabitCategory
  emoji: string
  color: string
  done: Record<string, boolean>
  reminderEnabled: boolean
  reminderTime: { hour: number; minute: number } | null
  createdAt: string
  updatedAt: string
}

export type HabitCategory =
  | 'Kesehatan' | 'Produktivitas' | 'Mindfulness'
  | 'Belajar' | 'Keuangan' | 'Sosial' | 'Lainnya'

export interface JournalEntry {
  id: string
  userId: string
  date: string
  text: string
  tags: string[]
  mood?: number
  createdAt: string
  updatedAt: string
}

export interface Todo {
  id: string
  userId: string
  text: string
  priority: 'high' | 'medium' | 'low'
  done: boolean
  date: string
  createdAt: string
  completedAt?: string
}

export interface MoodEntry {
  id: string
  userId: string
  date: string
  score: 1 | 2 | 3 | 4 | 5
  emoji: string
  label: string
  note: string
  createdAt: string
}

export interface XPLogEntry {
  id: string
  date: string
  reason: string
  amount: number
}

export interface AlarmConfig {
  id: string
  type: 'habit_reminder' | 'journal_reminder' | 'mood_reminder' | 'custom'
  label: string
  hour: number
  minute: number
  enabled: boolean
  days: number[]
}

export const MOOD_CONFIG = {
  5: { emoji: '😄', label: 'Luar Biasa', color: '#00e676', bg: '#00e67618' },
  4: { emoji: '😊', label: 'Senang',     color: '#ffe600', bg: '#ffe60018' },
  3: { emoji: '😐', label: 'Biasa',      color: '#00c2ff', bg: '#00c2ff18' },
  2: { emoji: '😟', label: 'Kurang',     color: '#ff9100', bg: '#ff910018' },
  1: { emoji: '😢', label: 'Buruk',      color: '#ff3c00', bg: '#ff3c0018' },
} as const

export const HABIT_EMOJIS = [
  '💪','🏃','🧘','📚','💧','🥗','😴','✍️',
  '🎯','🎸','💰','🌿','🧠','🏋️','🚴','🧹',
  '💊','🎨','🎤','🐦','🌅','🍎','☕','🎮',
]

export const HABIT_COLORS = [
  '#ff3c00','#ffe600','#00c2ff','#7b2fff',
  '#ff6b9d','#00e676','#ff9100','#e91e63',
  '#00bcd4','#8bc34a','#ff5722','#9c27b0',
]

export const HABIT_CATEGORIES: HabitCategory[] = [
  'Kesehatan','Produktivitas','Mindfulness',
  'Belajar','Keuangan','Sosial','Lainnya',
]

export const JOURNAL_TAGS = [
  '💡 IDE', '📋 BESOK', '😴 PRA-TIDUR',
  '🙏 SYUKUR', '📝 REFLEKSI', '🔥 GOALS',
]

export const DAYS_ID = ['Min','Sen','Sel','Rab','Kam','Jum','Sab']

export const LEVEL_CONFIG = [
  { min: 0,    title: 'PEMULA',       icon: '🌱' },
  { min: 50,   title: 'NOVICE',       icon: '🌿' },
  { min: 150,  title: 'APPRENTICE',   icon: '⚡' },
  { min: 350,  title: 'PRACTITIONER', icon: '🌟' },
  { min: 700,  title: 'ADEPT',        icon: '🔥' },
  { min: 1200, title: 'EXPERT',       icon: '💫' },
  { min: 2000, title: 'MASTER',       icon: '💎' },
  { min: 3000, title: 'GRANDMASTER',  icon: '👑' },
  { min: 5000, title: 'LEGEND',       icon: '🏆' },
]

export function getLevel(xp: number) {
  let level = LEVEL_CONFIG[0]
  for (const l of LEVEL_CONFIG) {
    if (xp >= l.min) level = l
  }
  const idx = LEVEL_CONFIG.indexOf(level)
  const next = LEVEL_CONFIG[idx + 1]
  const pct = next
    ? Math.min(100, Math.round(((xp - level.min) / (next.min - level.min)) * 100))
    : 100
  return { ...level, levelNum: idx + 1, nextMin: next?.min ?? level.min, pct }
}

export const BADGES = [
  { id: 'fh',   icon: '🌱', name: 'FIRST STEP',      desc: 'Tambah habit pertama',         req: (s: any) => s.habits.length >= 1 },
  { id: '3h',   icon: '🌿', name: 'MULTI-TASKER',     desc: 'Punya 3+ habit aktif',         req: (s: any) => s.habits.length >= 3 },
  { id: 'w7',   icon: '🔥', name: 'WEEK WARRIOR',     desc: 'Streak 7 hari berturut',       req: (s: any) => s.maxStreak >= 7 },
  { id: 'm30',  icon: '💎', name: 'CONSISTENCY KING', desc: 'Streak 30 hari',               req: (s: any) => s.maxStreak >= 30 },
  { id: 'fj',   icon: '📓', name: 'JOURNALER',        desc: 'Tulis catatan pertama',        req: (s: any) => s.journals.length >= 1 },
  { id: '10j',  icon: '✍️', name: 'WRITER',           desc: '10+ entri jurnal',             req: (s: any) => s.journals.length >= 10 },
  { id: 'ft',   icon: '✅', name: 'ORGANIZED',         desc: 'Selesaikan tugas pertama',     req: (s: any) => s.todos.some((t: any) => t.done) },
  { id: 'm7',   icon: '😊', name: 'SELF-AWARE',       desc: 'Catat mood 7 hari berbeda',    req: (s: any) => s.moods.length >= 7 },
  { id: 'x100', icon: '⚡', name: 'POWER UP',         desc: 'Capai 100 XP',                req: (s: any) => s.xp >= 100 },
  { id: 'x500', icon: '💫', name: 'SUPERCHARGED',     desc: 'Capai 500 XP',                req: (s: any) => s.xp >= 500 },
  { id: 'x1k',  icon: '👑', name: 'LEGEND',           desc: 'Capai 1000 XP',               req: (s: any) => s.xp >= 1000 },
]
