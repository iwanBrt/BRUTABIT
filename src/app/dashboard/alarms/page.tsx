'use client'
// src/app/dashboard/alarms/page.tsx

import { useState, useEffect } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { db, COLS } from '@/lib/firebase'
import { useStore } from '@/store'
import {
  requestWebNotificationPermission,
  scheduleDailyReminder,
  cancelReminder,
} from '@/lib/notifications'
import { DAYS_ID, type AlarmConfig } from '@/types'

const DEFAULT_ALARMS: AlarmConfig[] = [
  { id: 'morning', type: 'habit_reminder',  label: '🌅 MOTIVASI PAGI',   hour: 7,  minute: 0, enabled: false, days: [0,1,2,3,4,5,6] },
  { id: 'habit',   type: 'habit_reminder',  label: '💪 CEK HABIT HARIAN', hour: 8,  minute: 0, enabled: false, days: [0,1,2,3,4,5,6] },
  { id: 'mood',    type: 'mood_reminder',   label: '😊 MOOD CHECK-IN',    hour: 20, minute: 0, enabled: false, days: [0,1,2,3,4,5,6] },
  { id: 'journal', type: 'journal_reminder',label: '📓 JURNAL MALAM',     hour: 21, minute: 0, enabled: false, days: [0,1,2,3,4,5,6] },
]

const ALARM_BODIES: Record<AlarmConfig['type'], string> = {
  habit_reminder:  'Saatnya cek habit kamu hari ini! 🔥',
  journal_reminder:'Tuangkan pikiranmu sebelum tidur 📓',
  mood_reminder:   'Bagaimana perasaanmu hari ini? 😊',
  custom:          'Waktunya! ⏰',
}

export default function AlarmsPage() {
  const { userId, alarms, setAlarms } = useStore()
  const [permGranted, setPermGranted] = useState(false)
  const [editHour, setEditHour]       = useState<Record<string, string>>({})
  const [editMin, setEditMin]         = useState<Record<string, string>>({})

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPermGranted(Notification.permission === 'granted')
      if (alarms.length === 0) setAlarms(DEFAULT_ALARMS)
    }
  }, [])

  const requestPerm = async () => {
    const ok = await requestWebNotificationPermission()
    setPermGranted(ok)
    if (ok) toast.success('✓ Izin notifikasi diberikan!')
    else toast.error('Izin notifikasi ditolak.')
  }

  const toggleAlarm = async (alarm: AlarmConfig) => {
    const h   = parseInt(editHour[alarm.id] ?? String(alarm.hour))
    const m   = parseInt(editMin[alarm.id]  ?? String(alarm.minute))
    const updated: AlarmConfig = {
      ...alarm, enabled: !alarm.enabled, hour: h, minute: m,
    }

    if (updated.enabled) {
      scheduleDailyReminder(alarm.id, h, m, updated.label, ALARM_BODIES[alarm.type])
      toast.success(`⏰ Alarm aktif — ${fmtTime(h, m)}`)
    } else {
      cancelReminder(alarm.id)
      toast.success('⏰ Alarm dimatikan')
    }

    const newAlarms = alarms.map(a => a.id === alarm.id ? updated : a)
    setAlarms(newAlarms)
    if (userId) {
      await setDoc(doc(db, COLS.alarms(userId), alarm.id), updated)
    }
  }

  const fmtTime = (h: number, m: number) =>
    `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`

  const sendTest = async () => {
    const ok = await requestWebNotificationPermission()
    if (!ok) { toast.error('Aktifkan izin notifikasi dulu!'); return }
    new Notification('🔥 BRUTABIT — Test Notifikasi!', {
      body: 'Notifikasi browser berfungsi dengan baik.',
      icon: '/icon.png',
    })
    toast.success('✓ Notifikasi dikirim!')
  }

  return (
    <div className="min-h-screen">
      <div className="page-header">
        <div>
          <h1 className="page-title">ALARM</h1>
          <p className="font-mono text-[10px] text-[#888] tracking-[2px] mt-0.5">NOTIFIKASI BROWSER</p>
        </div>
        <button onClick={sendTest} className="neo-btn-yellow px-4 py-2 text-sm">
          🔔 TEST NOTIF
        </button>
      </div>

      <div className="p-6 max-w-2xl">
        {/* Permission banner */}
        {!permGranted && (
          <button onClick={requestPerm}
            className="w-full neo-card-lg p-4 text-left mb-6 bg-brand-red text-white border-brand-red hover:opacity-90 transition-opacity">
            <div className="font-mono font-bold text-sm tracking-[1px] mb-1">⚠️ IZIN NOTIFIKASI DIPERLUKAN</div>
            <div className="font-mono text-[10px] opacity-80">Klik di sini untuk mengaktifkan notifikasi browser →</div>
          </button>
        )}

        {/* Browser note */}
        <div className="neo-card p-4 mb-6 bg-neo-bg">
          <div className="font-mono font-bold text-[10px] tracking-[1px] uppercase mb-2">💡 CATATAN NOTIFIKASI WEB</div>
          <div className="font-mono text-[10px] text-neo-muted leading-relaxed space-y-1">
            <p>• Notifikasi hanya berfungsi selama tab browser terbuka</p>
            <p>• Untuk notifikasi background, gunakan app mobile (Android/iOS)</p>
            <p>• Pastikan browser tidak dalam mode senyap/Do Not Disturb</p>
            <p>• Chrome, Edge, dan Firefox mendukung notifikasi web</p>
          </div>
        </div>

        {/* Alarm list */}
        <h2 className="font-mono font-bold text-[10px] uppercase tracking-[2px] text-neo-muted mb-4">
          PENGINGAT HARIAN
        </h2>

        <div className="space-y-4">
          {alarms.map(alarm => (
            <div key={alarm.id} className="neo-card overflow-hidden">
              <div className="h-1.5 border-b-[2px] border-neo-black"
                   style={{ backgroundColor: alarm.enabled ? '#00e676' : '#888' }} />
              <div className="p-5 flex items-start gap-4">
                <div className="flex-1">
                  <div className="font-mono font-bold text-sm uppercase tracking-[1px] mb-3">
                    {alarm.label}
                  </div>

                  {/* Time inputs */}
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="number" min="0" max="23"
                      value={editHour[alarm.id] ?? String(alarm.hour).padStart(2,'0')}
                      onChange={e => setEditHour(p => ({ ...p, [alarm.id]: e.target.value }))}
                      className="w-16 font-display text-3xl text-center border-[2px] border-neo-black bg-neo-bg outline-none p-1"
                    />
                    <span className="font-display text-3xl">:</span>
                    <input
                      type="number" min="0" max="59"
                      value={editMin[alarm.id] ?? String(alarm.minute).padStart(2,'0')}
                      onChange={e => setEditMin(p => ({ ...p, [alarm.id]: e.target.value }))}
                      className="w-16 font-display text-3xl text-center border-[2px] border-neo-black bg-neo-bg outline-none p-1"
                    />
                  </div>

                  {/* Days */}
                  <div className="flex gap-1.5 flex-wrap">
                    {DAYS_ID.map((d, i) => (
                      <div key={i}
                        className={`font-mono font-bold text-[9px] uppercase px-2 py-1 border-[1.5px] border-neo-black tracking-[0.5px] ${
                          alarm.days.includes(i)
                            ? 'bg-neo-black text-brand-yellow'
                            : 'bg-neo-bg text-neo-muted'
                        }`}>
                        {d}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Toggle */}
                <button
                  onClick={() => toggleAlarm(alarm)}
                  className={`relative w-14 h-7 border-[2px] border-neo-black transition-colors flex-shrink-0 mt-1 ${
                    alarm.enabled ? 'bg-brand-green' : 'bg-neo-bg'
                  }`}
                  style={{ boxShadow: '2px 2px 0 #0a0a0a' }}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-neo-black border border-[#fff] transition-transform ${
                    alarm.enabled ? 'translate-x-[30px]' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
