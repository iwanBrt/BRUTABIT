'use client'
// src/app/dashboard/mood/page.tsx

import { useState, useEffect } from 'react'
import { format, subDays } from 'date-fns'
import { id } from 'date-fns/locale'
import { doc, setDoc } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { db, COLS } from '@/lib/firebase'
import { useStore, todayKey } from '@/store'
import { MOOD_CONFIG, DAYS_ID, type MoodEntry } from '@/types'

export default function MoodPage() {
  const { userId, moods, addXP, checkBadges } = useStore()
  const [selScore, setSelScore] = useState<number | null>(null)
  const [note, setNote]         = useState('')
  const [saving, setSaving]     = useState(false)

  const today    = todayKey()
  const todayMood = moods.find(m => m.date === today)

  useEffect(() => {
    if (todayMood) { setSelScore(todayMood.score); setNote(todayMood.note) }
  }, [todayMood?.date])

  const saveMood = async () => {
    if (!userId || !selScore) { toast.error('Pilih mood dulu!'); return }
    setSaving(true)
    const cfg   = MOOD_CONFIG[selScore as keyof typeof MOOD_CONFIG]
    const isNew = !todayMood
    await setDoc(doc(db, COLS.moods(userId), today), {
      id: today, userId, date: today,
      score: selScore, emoji: cfg.emoji, label: cfg.label,
      note: note.trim(), createdAt: todayMood?.createdAt ?? new Date().toISOString(),
    })
    if (isNew) {
      await addXP(5, `😊 Mood: ${cfg.label}`)
      await checkBadges()
      toast.success(`😊 Mood disimpan! +5 XP`)
    } else { toast.success('😊 Mood diperbarui!') }
    setSaving(false)
  }

  // 7-day chart data
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i)
    const k = format(d, 'yyyy-MM-dd')
    return { key: k, day: DAYS_ID[d.getDay()], mood: moods.find(m => m.date === k) }
  })

  const history = [...moods].slice(0, 14)

  return (
    <div className="min-h-screen">
      <div className="page-header">
        <div>
          <h1 className="page-title">MOOD</h1>
          <p className="font-mono text-[10px] text-[#888] tracking-[2px] mt-0.5">PELACAK SUASANA HATI</p>
        </div>
      </div>

      <div className="p-6 max-w-2xl">
        {/* 7-day chart */}
        <div className="neo-card p-5 mb-6">
          <p className="font-mono font-bold text-[10px] uppercase tracking-[2px] text-neo-muted mb-4">
            MOOD 7 HARI TERAKHIR
          </p>
          <div className="flex items-end gap-3 h-24">
            {last7.map(({ day, mood }) => {
              const h   = mood ? (mood.score / 5) * 100 : 0
              const col = mood ? MOOD_CONFIG[mood.score as keyof typeof MOOD_CONFIG].color : '#ddd'
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-sm">{mood?.emoji ?? ''}</span>
                  <div className="w-full flex flex-col justify-end border-[1.5px] border-neo-black bg-neo-bg"
                       style={{ height: '64px' }}>
                    <div className="w-full border-t-[1.5px] border-neo-black transition-all duration-500"
                         style={{ height: `${Math.max(h, mood ? 12 : 3)}%`, backgroundColor: col }} />
                  </div>
                  <span className="font-mono font-bold text-[8px] uppercase text-neo-muted">{day}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Today mood */}
        <div className="neo-card-lg overflow-hidden mb-6">
          <div className="bg-neo-black px-4 py-2 flex items-center justify-between">
            <span className="font-mono font-bold text-[10px] text-brand-yellow tracking-[1px] uppercase">
              MOOD HARI INI — {format(new Date(), 'd MMMM', { locale: id }).toUpperCase()}
            </span>
            {todayMood && (
              <span className="font-mono font-bold text-[9px] text-brand-green tracking-[1px]">✓ TERSIMPAN</span>
            )}
          </div>

          {/* Mood options */}
          <div className="grid grid-cols-5 border-b-[2px] border-neo-black">
            {([5,4,3,2,1] as const).map(score => {
              const cfg      = MOOD_CONFIG[score]
              const selected = selScore === score
              return (
                <button key={score} onClick={() => setSelScore(score)}
                  className={`flex flex-col items-center py-5 gap-2 border-r-[2px] border-neo-black last:border-r-0 transition-all ${
                    selected ? 'outline outline-[3px] outline-offset-[-3px] outline-neo-black' : 'hover:opacity-80'
                  }`}
                  style={selected ? { backgroundColor: cfg.bg } : {}}>
                  <span className="text-3xl">{cfg.emoji}</span>
                  <span className={`font-mono font-bold text-[8px] uppercase tracking-[0.5px] text-center ${selected ? '' : 'text-neo-muted'}`}>
                    {cfg.label}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Note + save */}
          <div className="p-4">
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Ceritakan sedikit perasaanmu hari ini..."
              className="w-full font-body text-sm p-3 border-[2px] border-neo-black bg-neo-bg dark:bg-neo-bgDark outline-none resize-none min-h-[80px] mb-3"
            />
            <button onClick={saveMood} disabled={!selScore || saving}
              className="neo-btn-primary w-full py-3 text-sm disabled:opacity-50">
              {saving ? 'MENYIMPAN...' : 'SIMPAN MOOD →'}
            </button>
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div>
            <h2 className="font-display text-xl tracking-[2px] mb-4">RIWAYAT MOOD</h2>
            <div className="space-y-2">
              {history.map(m => {
                const cfg = MOOD_CONFIG[m.score as keyof typeof MOOD_CONFIG]
                return (
                  <div key={m.id} className="flex items-center gap-4 neo-card px-4 py-3">
                    <span className="font-mono font-bold text-[10px] text-neo-muted min-w-[70px]">
                      {format(new Date(m.date + 'T00:00:00'), 'd MMM', { locale: id }).toUpperCase()}
                    </span>
                    <span className="text-xl">{m.emoji}</span>
                    <span className="font-mono font-bold text-[10px] uppercase tracking-[1px] min-w-[80px]"
                          style={{ color: cfg.color }}>
                      {m.label}
                    </span>
                    <span className="font-body text-sm text-neo-muted truncate flex-1">{m.note}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
