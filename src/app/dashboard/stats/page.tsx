'use client'
// src/app/dashboard/stats/page.tsx

import { format, subDays, startOfWeek, addDays } from 'date-fns'
import { id } from 'date-fns/locale'
import { useStore } from '@/store'
import { todayKey } from '@/store'
import { MOOD_CONFIG, getLevel, type Habit } from '@/types'

const getStreak = (h: Habit) => {
  let s = 0; const d = new Date()
  while(true) { const k = format(d,'yyyy-MM-dd'); if(!h.done[k]) break; s++; d.setDate(d.getDate()-1) }
  return s
}
const getMonthStats = (h: Habit) => {
  const t = new Date(); let done = 0
  for (let d = 1; d <= t.getDate(); d++) {
    const k = `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    if (h.done[k]) done++
  }
  return { done, total: t.getDate(), pct: Math.round((done/t.getDate())*100) }
}

export default function StatsPage() {
  const { habits, journals, moods, todos, xp } = useStore()
  const today        = todayKey()
  const doneTodayCount = habits.filter(h => h.done[today]).length
  const totalCheckins  = habits.reduce((a,h) => a + Object.values(h.done).filter(Boolean).length, 0)
  const maxStreak      = Math.max(0, ...habits.map(getStreak))
  const completedTodos = todos.filter(t => t.done).length
  const lvl            = getLevel(xp)

  // Build heatmap 12 weeks
  const heatmapWeeks = buildHeatmap(habits)

  const STAT_CARDS = [
    { val: `${doneTodayCount}/${habits.length}`, lbl: 'Selesai Hari Ini', color: '#ff3c00' },
    { val: maxStreak,   lbl: 'Max Streak',     color: '#ffe600' },
    { val: totalCheckins, lbl: 'Total Check-in', color: '#00c2ff' },
    { val: xp,          lbl: 'Total XP',        color: '#7b2fff' },
    { val: journals.length, lbl: 'Entri Jurnal', color: '#00e676' },
    { val: moods.length,    lbl: 'Hari Mood',   color: '#ff6b9d' },
    { val: completedTodos,  lbl: 'Tugas Selesai', color: '#ff9100' },
    { val: `Lv.${lvl.levelNum}`, lbl: lvl.title, color: '#0a0a0a' },
  ]

  return (
    <div className="min-h-screen">
      <div className="page-header">
        <div>
          <h1 className="page-title">STATISTIK</h1>
          <p className="font-mono text-[10px] text-[#888] tracking-[2px] mt-0.5">PROGRESS OVERVIEW</p>
        </div>
      </div>

      <div className="p-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {STAT_CARDS.map((s, i) => (
            <div key={i} className="neo-card p-4 overflow-hidden"
                 style={{ borderTopWidth: '6px', borderTopColor: s.color }}>
              <div className="font-display text-4xl leading-none mb-1" style={{ color: s.color }}>
                {String(s.val)}
              </div>
              <div className="font-mono font-bold text-[9px] text-neo-muted uppercase tracking-[1.5px]">
                {s.lbl}
              </div>
            </div>
          ))}
        </div>

        {/* Heatmap */}
        <div className="neo-card-lg p-5 mb-6 overflow-x-auto">
          <h2 className="font-display text-xl tracking-[2px] mb-4">HEATMAP 12 MINGGU TERAKHIR</h2>
          <div className="flex gap-1 min-w-max">
            {heatmapWeeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((cell, di) => (
                  <div key={di}
                    title={`${cell.date}: ${Math.round(cell.intensity * habits.length)}/${habits.length}`}
                    className="w-3.5 h-3.5 border-[1.5px] transition-all hover:scale-125 cursor-default"
                    style={{
                      backgroundColor: cell.intensity > 0 ? `rgba(255,60,0,${0.15 + cell.intensity * 0.85})` : 'transparent',
                      borderColor: cell.intensity > 0 ? '#0a0a0a' : '#ddd',
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
          {/* Legend */}
          <div className="flex items-center gap-2 mt-3">
            <span className="font-mono text-[9px] text-neo-muted">KURANG</span>
            {[0.15, 0.4, 0.65, 0.9].map(o => (
              <div key={o} className="w-3 h-3 border border-neo-black"
                   style={{ backgroundColor: `rgba(255,60,0,${o})` }} />
            ))}
            <span className="font-mono text-[9px] text-neo-muted">BANYAK</span>
          </div>
        </div>

        {/* Per-habit breakdown */}
        {habits.length > 0 && (
          <div className="neo-card-lg overflow-hidden">
            <div className="bg-neo-black px-5 py-3">
              <span className="font-display text-xl text-brand-yellow tracking-[2px]">DETAIL PER HABIT</span>
            </div>
            <div className="divide-y-[2px] divide-neo-black">
              {habits.map(h => {
                const { pct, done, total } = getMonthStats(h)
                const st  = getStreak(h)
                const all = Object.values(h.done).filter(Boolean).length
                return (
                  <div key={h.id} className="flex items-center gap-4 p-4">
                    <span className="text-2xl">{h.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-body font-extrabold text-sm uppercase tracking-[0.5px] mb-1">{h.name}</div>
                      <div className="h-2.5 border-[2px] border-neo-black bg-neo-bg overflow-hidden mb-1">
                        <div className="h-full transition-all duration-500"
                             style={{ width: `${pct}%`, backgroundColor: h.color }} />
                      </div>
                      <div className="font-mono text-[9px] text-neo-muted">
                        {done}/{total} HARI BULAN INI · {all} TOTAL
                      </div>
                    </div>
                    <div className="font-mono font-bold text-sm text-right min-w-[52px]"
                         style={{ color: h.color }}>
                      🔥{st}d
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Mood distribution */}
        {moods.length > 0 && (
          <div className="neo-card p-5 mt-6">
            <h2 className="font-display text-xl tracking-[2px] mb-4">DISTRIBUSI MOOD</h2>
            {([5,4,3,2,1] as const).map(score => {
              const cfg   = MOOD_CONFIG[score]
              const count = moods.filter(m => m.score === score).length
              const pct   = Math.round((count / moods.length) * 100)
              return (
                <div key={score} className="flex items-center gap-3 mb-2">
                  <span className="text-xl w-7">{cfg.emoji}</span>
                  <div className="flex-1 h-5 border-[2px] border-neo-black bg-neo-bg overflow-hidden">
                    <div className="h-full border-r-[2px] border-neo-black transition-all duration-500"
                         style={{ width: `${pct}%`, backgroundColor: cfg.color }} />
                  </div>
                  <span className="font-mono font-bold text-[10px] min-w-[28px] text-right text-neo-muted">
                    {count}x
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function buildHeatmap(habits: Habit[]) {
  const today = new Date()
  const start = startOfWeek(subDays(today, 83), { weekStartsOn: 0 })
  const weeks: { date: string; intensity: number }[][] = []
  let current = new Date(start)

  while (current <= today) {
    const week: { date: string; intensity: number }[] = []
    for (let d = 0; d < 7; d++) {
      const k    = format(current, 'yyyy-MM-dd')
      const done = habits.filter(h => h.done[k]).length
      week.push({ date: k, intensity: habits.length ? done / habits.length : 0 })
      current = addDays(current, 1)
    }
    weeks.push(week)
  }
  return weeks
}
