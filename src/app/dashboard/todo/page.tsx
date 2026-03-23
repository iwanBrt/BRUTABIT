'use client'
// src/app/dashboard/todo/page.tsx

import { useState } from 'react'
import { format } from 'date-fns'
import { doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { db, COLS } from '@/lib/firebase'
import { useStore, todayKey } from '@/store'
import type { Todo } from '@/types'

type Filter   = 'all' | 'active' | 'done' | 'high'
type Priority = 'high' | 'medium' | 'low'

const PRI_CFG = {
  high:   { label: 'TINGGI', cls: 'bg-brand-red text-white' },
  medium: { label: 'SEDANG', cls: 'bg-brand-yellow text-neo-black' },
  low:    { label: 'RENDAH', cls: 'bg-brand-green text-neo-black' },
}

export default function TodoPage() {
  const { userId, todos, addXP, checkBadges } = useStore()
  const [input, setInput]   = useState('')
  const [pri, setPri]       = useState<Priority>('medium')
  const [filter, setFilter] = useState<Filter>('all')

  const addTodo = async () => {
    if (!input.trim() || !userId) return
    const id  = Date.now().toString()
    const now = new Date().toISOString()
    await setDoc(doc(db, COLS.todos(userId), id), {
      id, userId, text: input.trim(), priority: pri,
      done: false, date: todayKey(), createdAt: now,
    })
    setInput('')
    toast.success('✅ Tugas ditambahkan!')
  }

  const toggleTodo = async (t: Todo) => {
    if (!userId) return
    await updateDoc(doc(db, COLS.todos(userId), t.id), {
      done: !t.done, completedAt: !t.done ? new Date().toISOString() : null,
    })
    if (!t.done) {
      await addXP(5, `✅ ${t.text}`)
      await checkBadges()
      toast.success('+5 XP ⚡')
    }
  }

  const deleteTodo = async (t: Todo) => {
    if (!userId) return
    await deleteDoc(doc(db, COLS.todos(userId), t.id))
  }

  const clearDone = async () => {
    if (!userId) return
    await Promise.all(todos.filter(t => t.done).map(t => deleteDoc(doc(db, COLS.todos(userId!), t.id))))
    toast.success('🗑 Tugas selesai dihapus')
  }

  const filtered = [...todos]
    .filter(t => {
      if (filter === 'active') return !t.done
      if (filter === 'done')   return t.done
      if (filter === 'high')   return t.priority === 'high'
      return true
    })
    .sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1
      const o: Record<Priority, number> = { high: 0, medium: 1, low: 2 }
      return o[a.priority] - o[b.priority]
    })

  const activeCount = todos.filter(t => !t.done).length

  return (
    <div className="min-h-screen">
      <div className="page-header">
        <div>
          <h1 className="page-title">TO-DO</h1>
          <p className="font-mono text-[10px] text-[#888] tracking-[2px] mt-0.5">DAFTAR TUGAS</p>
        </div>
        <div className="bg-brand-red border-[2px] border-neo-black px-3 py-1.5"
             style={{ boxShadow: '3px 3px 0 #0a0a0a' }}>
          <span className="font-mono font-bold text-[11px] text-white">{activeCount} AKTIF</span>
        </div>
      </div>

      <div className="p-6 max-w-2xl">
        {/* Input */}
        <div className="flex border-[3px] border-neo-black mb-1 overflow-hidden"
             style={{ boxShadow: '5px 5px 0 #0a0a0a' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTodo()}
            placeholder="Tambah tugas baru..."
            className="flex-1 font-body text-sm px-4 py-3 bg-white dark:bg-neo-cardDk text-neo-black dark:text-white outline-none"
          />
          <button onClick={addTodo}
            className="px-5 bg-brand-red border-l-[2px] border-neo-black font-body font-black text-white text-xl hover:bg-red-700 transition-colors">
            ＋
          </button>
        </div>

        {/* Priority selector */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <span className="font-mono font-bold text-[10px] text-neo-muted uppercase tracking-[1px]">Prioritas:</span>
          {(['high','medium','low'] as Priority[]).map(p => (
            <button key={p} onClick={() => setPri(p)}
              className={`font-mono font-bold text-[10px] uppercase tracking-[1px] px-3 py-1 border-[2px] transition-all ${
                pri === p
                  ? `${PRI_CFG[p].cls} border-neo-black`
                  : 'bg-neo-bg border-neo-black hover:bg-brand-yellow'
              }`}>
              {PRI_CFG[p].label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap mb-4">
          {([['all','SEMUA'],['active','AKTIF'],['done','SELESAI'],['high','🔴 TINGGI']] as [Filter,string][]).map(([f,l]) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`font-mono font-bold text-[10px] uppercase tracking-[1px] px-3 py-1.5 border-[2px] border-neo-black transition-all ${
                filter === f ? 'bg-neo-black text-brand-yellow' : 'bg-white hover:bg-brand-yellow'
              }`}
              style={{ boxShadow: '2px 2px 0 #0a0a0a' }}>
              {l}
            </button>
          ))}
          <button onClick={clearDone}
            className="font-mono font-bold text-[10px] uppercase tracking-[1px] px-3 py-1.5 border-[2px] border-neo-black bg-white hover:bg-brand-red hover:text-white transition-all ml-auto"
            style={{ boxShadow: '2px 2px 0 #0a0a0a' }}>
            🗑 HAPUS SELESAI
          </button>
        </div>

        {/* List */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="neo-card p-10 text-center">
              <span className="font-mono font-bold text-[11px] text-neo-muted tracking-[2px] uppercase">
                {filter === 'done' ? 'Belum ada tugas selesai' : 'Tidak ada tugas 🎉'}
              </span>
            </div>
          ) : filtered.map(t => (
            <div key={t.id} className={`todo-item ${t.done ? 'opacity-60' : ''}`}>
              <button onClick={() => toggleTodo(t)}
                className={`w-12 h-12 border-r-[2px] border-neo-black flex items-center justify-center text-lg flex-shrink-0 transition-colors ${
                  t.done ? 'bg-brand-green' : 'hover:bg-brand-yellow'
                }`}>
                {t.done ? '✓' : ''}
              </button>
              <span className={`flex-1 px-4 font-body text-sm font-medium ${t.done ? 'line-through text-neo-muted' : ''}`}>
                {t.text}
              </span>
              <div className={`px-3 py-0.5 border-l-[2px] border-neo-black font-mono font-bold text-[9px] uppercase tracking-[1px] self-stretch flex items-center min-w-[60px] justify-center ${PRI_CFG[t.priority].cls}`}>
                {PRI_CFG[t.priority].label}
              </div>
              <button onClick={() => deleteTodo(t)}
                className="w-10 h-12 border-l-[2px] border-neo-black flex items-center justify-center text-neo-muted hover:bg-brand-red hover:text-white transition-colors flex-shrink-0">
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
