'use client'
// src/app/dashboard/habits/page.tsx

import { useState } from 'react'
import { format, startOfWeek, addDays, isToday, isFuture } from 'date-fns'
import { id } from 'date-fns/locale'
import {
  collection, doc, setDoc, updateDoc, deleteDoc,
} from 'firebase/firestore'
import toast from 'react-hot-toast'
import { db, COLS } from '@/lib/firebase'
import { useStore, todayKey } from '@/store'
import {
  HABIT_EMOJIS, HABIT_COLORS, HABIT_CATEGORIES,
  DAYS_ID, type Habit, type HabitCategory,
} from '@/types'

// helpers
const dateKey = (d: Date) => format(d, 'yyyy-MM-dd')
const getStreak = (habit: Habit) => {
  let s = 0; const d = new Date()
  while (true) { const k = dateKey(d); if (!habit.done[k]) break; s++; d.setDate(d.getDate()-1) }
  return s
}
const getMonthPct = (habit: Habit) => {
  const t = new Date(); let done = 0
  for (let d = 1; d <= t.getDate(); d++) {
    const k = `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    if (habit.done[k]) done++
  }
  return Math.round((done / t.getDate()) * 100)
}
const getWeekDates = () => {
  const s = startOfWeek(new Date(), { weekStartsOn: 0 })
  return Array.from({ length: 7 }, (_, i) => addDays(s, i))
}

export default function HabitsPage() {
  const { userId, habits, xp, addXP, checkBadges } = useStore()
  const today = todayKey()
  const weekDates = getWeekDates()
  const doneTodayCount = habits.filter(h => h.done[today]).length

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId]       = useState<string | null>(null)
  const [formName, setFormName]   = useState('')
  const [formCat, setFormCat]     = useState<HabitCategory>('Kesehatan')
  const [formEmoji, setFormEmoji] = useState(HABIT_EMOJIS[0])
  const [formColor, setFormColor] = useState(HABIT_COLORS[0])

  const openAdd = () => {
    setEditId(null); setFormName(''); setFormCat('Kesehatan')
    setFormEmoji(HABIT_EMOJIS[0]); setFormColor(HABIT_COLORS[0])
    setShowModal(true)
  }
  const openEdit = (h: Habit) => {
    setEditId(h.id); setFormName(h.name); setFormCat(h.category)
    setFormEmoji(h.emoji); setFormColor(h.color)
    setShowModal(true)
  }

  const saveHabit = async () => {
    if (!formName.trim() || !userId) return
    const now = new Date().toISOString()
    if (editId) {
      await updateDoc(doc(db, COLS.habits(userId), editId), {
        name: formName.trim(), category: formCat,
        emoji: formEmoji, color: formColor, updatedAt: now,
      })
      toast.success('✏ Habit diperbarui!')
    } else {
      const id = Date.now().toString()
      await setDoc(doc(db, COLS.habits(userId), id), {
        id, userId, name: formName.trim(), category: formCat,
        emoji: formEmoji, color: formColor, done: {},
        reminderEnabled: false, reminderTime: null,
        createdAt: now, updatedAt: now,
      })
      await addXP(5, `🌱 Habit baru: ${formName.trim()}`)
      await checkBadges()
      toast.success('✓ Habit ditambahkan! +5 XP')
    }
    setShowModal(false)
  }

  const deleteHabit = async (h: Habit) => {
    if (!confirm(`Hapus habit "${h.name}"?`) || !userId) return
    await deleteDoc(doc(db, COLS.habits(userId), h.id))
    toast.success('🗑 Habit dihapus')
  }

  const toggleDay = async (h: Habit, k: string) => {
    if (!userId) return
    const wasDone = !!h.done[k]
    await updateDoc(doc(db, COLS.habits(userId), h.id), {
      [`done.${k}`]: !wasDone, updatedAt: new Date().toISOString(),
    })
    if (!wasDone) {
      await addXP(10, `✓ ${h.emoji} ${h.name}`)
      await checkBadges()
      toast.success(`+10 XP ⚡`)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">HABITS</h1>
          <p className="font-mono text-[10px] text-[#888] tracking-[2px] mt-0.5">
            {format(new Date(), 'EEEE, d MMMM yyyy', { locale: id }).toUpperCase()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-brand-yellow border-[2px] border-neo-black px-3 py-1.5"
               style={{ boxShadow: '3px 3px 0 #0a0a0a' }}>
            <span className="font-mono font-bold text-[11px]">⚡ {xp} XP</span>
          </div>
          <button onClick={openAdd} className="neo-btn-primary px-4 py-2">
            ＋ HABIT BARU
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Daily progress */}
        <div className="bg-neo-black border-[3px] border-neo-black mb-6 p-4 flex items-center gap-6"
             style={{ boxShadow: '5px 5px 0 #0a0a0a' }}>
          <div className="text-center">
            <div className="font-display text-4xl text-brand-yellow leading-none">{doneTodayCount}</div>
            <div className="font-mono text-[9px] text-[#888] tracking-[1px] uppercase">Selesai</div>
          </div>
          <div className="w-[2px] bg-[#333] self-stretch" />
          <div className="text-center">
            <div className="font-display text-4xl text-brand-yellow leading-none">{habits.length}</div>
            <div className="font-mono text-[9px] text-[#888] tracking-[1px] uppercase">Total</div>
          </div>
          <div className="w-[2px] bg-[#333] self-stretch" />
          <div className="flex-1">
            <div className="font-mono text-[9px] text-[#888] tracking-[1px] uppercase mb-2">
              Progress Hari Ini
            </div>
            <div className="h-3 bg-[#222] border border-[#444] overflow-hidden">
              <div
                className="h-full bg-brand-green transition-all duration-500"
                style={{ width: habits.length > 0 ? `${(doneTodayCount/habits.length)*100}%` : '0%' }}
              />
            </div>
          </div>
          <div className="font-mono font-bold text-brand-yellow text-sm">
            {habits.length > 0 ? Math.round((doneTodayCount/habits.length)*100) : 0}%
          </div>
        </div>

        {/* Habits grid */}
        {habits.length === 0 ? (
          <div className="neo-card-lg p-16 text-center">
            <div className="font-display text-6xl mb-3">DAY ONE.</div>
            <p className="font-mono text-[11px] text-neo-muted mb-6 tracking-[1px]">
              Tambah habit pertamamu sekarang.
            </p>
            <button onClick={openAdd} className="neo-btn-primary px-8 py-3">
              ＋ MULAI SEKARANG
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            {habits.map(h => (
              <HabitCard
                key={h.id}
                habit={h}
                weekDates={weekDates}
                onToggle={toggleDay}
                onEdit={openEdit}
                onDelete={deleteHabit}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white border-[3px] border-neo-black w-full max-w-md max-h-[90vh] overflow-y-auto"
               style={{ boxShadow: '10px 10px 0 #0a0a0a' }}>
            <div className="bg-neo-black px-5 py-3 flex items-center justify-between sticky top-0">
              <span className="font-display text-2xl text-brand-yellow tracking-[3px]">
                {editId ? 'EDIT HABIT' : 'HABIT BARU'}
              </span>
              <button onClick={() => setShowModal(false)}
                className="text-brand-yellow font-bold text-xl">✕</button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="neo-label block mb-2">Nama Habit</label>
                <input value={formName} onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Olahraga pagi..." className="neo-input" maxLength={40} />
              </div>

              <div>
                <label className="neo-label block mb-2">Kategori</label>
                <div className="flex flex-wrap gap-2">
                  {HABIT_CATEGORIES.map(c => (
                    <button key={c} onClick={() => setFormCat(c)}
                      className={`font-mono font-bold text-[10px] uppercase tracking-[1px] px-3 py-1.5 border-[2px] transition-all ${
                        formCat === c
                          ? 'bg-neo-black text-brand-yellow border-neo-black'
                          : 'bg-neo-bg border-neo-black hover:bg-brand-yellow'
                      }`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="neo-label block mb-2">Emoji</label>
                <div className="flex flex-wrap gap-2">
                  {HABIT_EMOJIS.map(e => (
                    <button key={e} onClick={() => setFormEmoji(e)}
                      className={`w-10 h-10 text-xl border-[2px] transition-all ${
                        formEmoji === e
                          ? 'bg-brand-yellow border-neo-black shadow-neo-sm'
                          : 'bg-neo-bg border-neo-black hover:bg-brand-yellow'
                      }`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="neo-label block mb-2">Warna</label>
                <div className="flex flex-wrap gap-2">
                  {HABIT_COLORS.map(c => (
                    <button key={c} onClick={() => setFormColor(c)}
                      className={`w-9 h-9 border-[2px] border-neo-black transition-all relative ${
                        formColor === c ? 'scale-110 shadow-neo-sm' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}>
                      {formColor === c && (
                        <span className="absolute inset-0 flex items-center justify-center text-white font-black text-sm"
                              style={{ textShadow: '0 0 4px rgba(0,0,0,0.8)' }}>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={saveHabit}
                className="neo-btn-primary w-full py-3 text-sm mt-2">
                SIMPAN →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── HABIT CARD ─────────────────────────────────────────────
function HabitCard({ habit, weekDates, onToggle, onEdit, onDelete }: {
  habit: Habit
  weekDates: Date[]
  onToggle: (h: Habit, k: string) => void
  onEdit: (h: Habit) => void
  onDelete: (h: Habit) => void
}) {
  const streak = getStreak(habit)
  const pct    = getMonthPct(habit)
  const today  = todayKey()

  return (
    <div className="habit-card">
      {/* Color stripe */}
      <div className="h-2 border-b-[2px] border-neo-black"
           style={{ backgroundColor: habit.color }} />

      {/* Header */}
      <div className="flex items-start gap-3 p-4 border-b-[2px] border-neo-black bg-white dark:bg-neo-cardDk">
        <div className="w-11 h-11 border-[2px] border-neo-black flex items-center justify-center text-2xl flex-shrink-0"
             style={{ backgroundColor: habit.color + '22' }}>
          {habit.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-body font-extrabold text-[15px] uppercase tracking-[0.5px] truncate">
            {habit.name}
          </div>
          <div className="inline-block font-mono font-bold text-[9px] uppercase tracking-[1px] px-2 py-0.5 border-[1.5px] mt-1"
               style={{ borderColor: habit.color, backgroundColor: habit.color + '22' }}>
            {habit.category}
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={() => onEdit(habit)}
            className="w-7 h-7 border-[2px] border-neo-black bg-neo-bg flex items-center justify-center text-xs hover:bg-brand-yellow transition-colors"
            style={{ boxShadow: '2px 2px 0 #0a0a0a' }}>✏</button>
          <button onClick={() => onDelete(habit)}
            className="w-7 h-7 border-[2px] border-neo-black bg-neo-bg flex items-center justify-center text-xs hover:bg-brand-red hover:text-white transition-colors"
            style={{ boxShadow: '2px 2px 0 #0a0a0a' }}>✕</button>
        </div>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 bg-white dark:bg-neo-cardDk">
        {weekDates.map((d, i) => {
          const k     = dateKey(d)
          const isDone = !!habit.done[k]
          const isTod  = isToday(d)
          const isFut  = isFuture(d) && !isToday(d)
          return (
            <div key={i} className="border-r-[2px] border-neo-black last:border-r-0">
              <div className="text-center font-mono font-bold text-[9px] uppercase py-1.5 border-b-[2px] border-neo-black bg-neo-bg dark:bg-neo-bgDark tracking-[0.5px]">
                {DAYS_ID[i]}
              </div>
              <div
                onClick={() => !isFut && onToggle(habit, k)}
                className={`aspect-square flex items-center justify-center cursor-pointer transition-all ${
                  isTod ? 'outline outline-[3px] outline-neo-black outline-offset-[-3px]' : ''
                } ${isFut ? 'opacity-25 cursor-not-allowed' : 'hover:opacity-75'}`}
                style={isDone ? { backgroundColor: habit.color } : {}}
              >
                {isDone && <span className="text-white font-black text-sm">✓</span>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 p-3 bg-neo-bg dark:bg-neo-bgDark border-t-[2px] border-neo-black">
        <span className="font-mono font-bold text-[11px]">🔥 {streak}d</span>
        <div className="flex-1 h-2 border-[2px] border-neo-black bg-white overflow-hidden">
          <div className="h-full transition-all duration-500"
               style={{ width: `${pct}%`, backgroundColor: habit.color }} />
        </div>
        <span className="font-mono font-bold text-[11px] min-w-[36px] text-right">{pct}%</span>
      </div>
    </div>
  )
}
