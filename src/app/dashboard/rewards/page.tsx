'use client'
// src/app/dashboard/rewards/page.tsx

import { useStore } from '@/store'
import { getLevel, BADGES } from '@/types'

export default function RewardsPage() {
  const { xp, earnedBadges, xpLog, userName, userEmail } = useStore()
  const lvl     = getLevel(xp)
  const levelIcon = lvl.levelNum >= 9 ? '👑' : lvl.levelNum >= 7 ? '💫' : lvl.levelNum >= 5 ? '⚡' : lvl.levelNum >= 3 ? '🌟' : '🌱'

  return (
    <div className="min-h-screen">
      <div className="page-header">
        <div>
          <h1 className="page-title">REWARDS</h1>
          <p className="font-mono text-[10px] text-[#888] tracking-[2px] mt-0.5">LEVEL & PENCAPAIAN</p>
        </div>
      </div>

      <div className="p-6 max-w-3xl">
        {/* Profile card */}
        <div className="neo-card flex items-center gap-4 p-5 mb-6">
          <div className="w-14 h-14 bg-brand-yellow border-[3px] border-neo-black flex items-center justify-center font-display text-3xl text-neo-black flex-shrink-0">
            {(userName ?? userEmail ?? 'U')[0].toUpperCase()}
          </div>
          <div>
            <div className="font-body font-extrabold text-lg uppercase tracking-[0.5px]">{userName ?? 'Pengguna'}</div>
            <div className="font-mono text-[11px] text-neo-muted">{userEmail}</div>
          </div>
        </div>

        {/* Level hero */}
        <div className="bg-neo-black border-[3px] border-neo-black mb-6 overflow-hidden"
             style={{ boxShadow: '8px 8px 0 #0a0a0a' }}>
          <div className="flex items-center gap-6 p-7">
            <div className="flex-1">
              <div className="font-mono font-bold text-[11px] text-brand-yellow tracking-[3px] uppercase mb-1">
                LEVEL {lvl.levelNum}
              </div>
              <div className="font-display text-5xl text-white tracking-[3px] mb-5">
                {lvl.title}
              </div>
              <div className="h-4 border-[2px] border-brand-yellow bg-[#111] overflow-hidden mb-2">
                <div className="h-full bg-brand-yellow transition-all duration-700"
                     style={{ width: `${lvl.pct}%` }} />
              </div>
              <div className="font-mono text-[10px] text-[#888]">
                {xp} / {lvl.nextMin} XP — {lvl.pct}%
              </div>
            </div>
            <div className="text-7xl flex-shrink-0">{levelIcon}</div>
          </div>
        </div>

        {/* XP breakdown */}
        <div className="neo-card overflow-hidden mb-6">
          <div className="bg-neo-black px-5 py-3">
            <span className="font-display text-xl text-brand-yellow tracking-[2px]">CARA DAPAT XP</span>
          </div>
          <div className="divide-y-[1.5px] divide-[#eee]">
            {[
              ['✓ Habit harian', '+10 XP'],
              ['📓 Menulis jurnal', '+15 XP'],
              ['😊 Catat mood', '+5 XP'],
              ['✅ Selesaikan tugas', '+5 XP'],
              ['🌱 Tambah habit baru', '+5 XP'],
              ['🏆 Unlock lencana', '+25 XP'],
            ].map(([act, pts]) => (
              <div key={act} className="flex items-center justify-between px-5 py-3">
                <span className="font-body text-sm">{act}</span>
                <span className="font-mono font-bold text-sm text-brand-red">{pts}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        <h2 className="font-display text-2xl tracking-[2px] mb-4">LENCANA</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {BADGES.map(b => {
            const unlocked = earnedBadges.includes(b.id)
            return (
              <div key={b.id}
                className={`neo-card p-4 text-center relative transition-all ${
                  !unlocked ? 'opacity-35 grayscale' : 'hover:-translate-x-0.5 hover:-translate-y-0.5'
                }`}>
                <div className="text-3xl mb-2">{b.icon}</div>
                <div className="font-mono font-bold text-[10px] uppercase tracking-[1px] mb-1">{b.name}</div>
                <div className="font-body text-[11px] text-neo-muted">{b.desc}</div>
                {unlocked && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-brand-green border-[2px] border-neo-black flex items-center justify-center">
                    <span className="text-white font-black text-[10px]">✓</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* XP Log */}
        <h2 className="font-display text-2xl tracking-[2px] mb-4">LOG XP TERBARU</h2>
        {xpLog.length === 0 ? (
          <div className="neo-card p-8 text-center">
            <span className="font-mono text-[11px] text-neo-muted tracking-[1px] uppercase">
              Log XP kosong — mulai track habitmu!
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            {xpLog.slice(0, 15).map((l, i) => (
              <div key={i} className="flex items-center gap-4 neo-card px-4 py-3">
                <span className="font-mono font-bold text-[10px] text-neo-muted min-w-[75px]">{l.date}</span>
                <span className="flex-1 font-body text-sm">{l.reason}</span>
                <span className="font-mono font-bold text-sm text-brand-red">+{l.amount} XP</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
