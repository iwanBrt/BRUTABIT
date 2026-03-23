'use client'
// src/app/dashboard/journal/page.tsx

import { useState, useEffect } from 'react'
import { format, addDays, isToday } from 'date-fns'
import { id } from 'date-fns/locale'
import { doc, setDoc, deleteDoc } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { db, COLS } from '@/lib/firebase'
import { useStore, todayKey } from '@/store'
import { JOURNAL_TAGS } from '@/types'

export default function JournalPage() {
  const { userId, journals, addXP, checkBadges } = useStore()
  const [offset, setOffset]   = useState(0)
  const [text, setText]       = useState('')
  const [tags, setTags]       = useState<Set<string>>(new Set())
  const [saving, setSaving]   = useState(false)
  const [viewEntry, setViewEntry] = useState<any>(null)

  const viewDate = (() => { const d = new Date(); d.setDate(d.getDate() + offset); return d })()
  const dateKey  = format(viewDate, 'yyyy-MM-dd')
  const existing = journals.find(j => j.date === dateKey)

  useEffect(() => {
    setText(existing?.text ?? '')
    setTags(new Set((existing?.tags ?? []) as string[]))
  }, [dateKey, existing?.id])

  const toggleTag = (tag: string) => {
    const next = new Set(tags)
    next.has(tag) ? next.delete(tag) : next.add(tag)
    setTags(next)
  }

  const save = async () => {
    if (!userId || !text.trim()) { toast.error('Tulis sesuatu dulu!'); return }
    setSaving(true)
    const isNew = !existing
    await setDoc(doc(db, COLS.journals(userId), dateKey), {
      id: dateKey, userId, date: dateKey,
      text: text.trim(), tags: [...tags],
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    if (isNew) {
      await addXP(15, `📓 Jurnal ${format(viewDate, 'd MMM', { locale: id })}`)
      await checkBadges()
      toast.success('📓 Disimpan! +15 XP')
    } else {
      toast.success('📓 Diperbarui!')
    }
    setSaving(false)
  }

  const deleteEntry = async (k: string) => {
    if (!userId || !confirm('Hapus catatan ini?')) return
    await deleteDoc(doc(db, COLS.journals(userId), k))
    setText(''); setTags(new Set())
    toast.success('🗑 Catatan dihapus')
  }

  return (
    <div className="min-h-screen">
      <div className="page-header">
        <div>
          <h1 className="page-title">JURNAL</h1>
          <p className="font-mono text-[10px] text-[#888] tracking-[2px] mt-0.5">CATATAN HARIAN</p>
        </div>
      </div>

      <div className="p-6 max-w-3xl">
        {/* Date nav */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => setOffset(o => o - 1)}
            className="neo-btn px-3 py-2 text-lg">◀</button>
          <div className="flex-1 text-center">
            <div className="font-display text-xl tracking-[2px]">
              {format(viewDate, 'EEEE, d MMMM yyyy', { locale: id }).toUpperCase()}
            </div>
            {isToday(viewDate) && (
              <span className="font-mono text-[9px] text-brand-red font-bold tracking-[2px]">● HARI INI</span>
            )}
          </div>
          <button
            onClick={() => !isToday(viewDate) && setOffset(o => o + 1)}
            disabled={isToday(viewDate)}
            className="neo-btn px-3 py-2 text-lg disabled:opacity-30">▶</button>
        </div>

        {/* Editor card */}
        <div className="neo-card-lg overflow-hidden mb-6">
          {/* Tags toolbar */}
          <div className="flex gap-2 flex-wrap p-3 border-b-[2px] border-neo-black bg-neo-bg dark:bg-neo-bgDark items-center">
            <span className="font-mono font-bold text-[9px] text-neo-muted uppercase tracking-[1px]">TAG:</span>
            {JOURNAL_TAGS.map(tag => (
              <button key={tag} onClick={() => toggleTag(tag)}
                className={`font-mono font-bold text-[9px] uppercase tracking-[1px] px-2.5 py-1 border-[2px] transition-all ${
                  tags.has(tag)
                    ? 'bg-neo-black text-brand-yellow border-neo-black'
                    : 'bg-white border-neo-black hover:bg-brand-yellow'
                }`}>
                {tag}
              </button>
            ))}
          </div>

          {/* Textarea */}
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={
              `Tuangkan pikiranmu di sini...\n\n` +
              `💡 Ide sebelum tidur\n` +
              `📋 Rencana besok\n` +
              `🙏 Hal yang kamu syukuri\n` +
              `📝 Refleksi hari ini`
            }
            className="w-full min-h-[220px] p-5 font-body text-[15px] leading-relaxed bg-white dark:bg-neo-cardDk text-neo-black dark:text-white outline-none resize-none"
          />

          {/* Footer */}
          <div className="flex items-center justify-between p-3 border-t-[2px] border-neo-black bg-neo-bg dark:bg-neo-bgDark">
            <span className="font-mono text-[10px] text-neo-muted">{text.length} karakter</span>
            <div className="flex gap-2">
              {existing && (
                <button onClick={() => deleteEntry(dateKey)}
                  className="neo-btn px-3 py-2 text-sm hover:bg-brand-red hover:text-white">🗑</button>
              )}
              <button onClick={save} disabled={saving}
                className="neo-btn-primary px-4 py-2 text-sm disabled:opacity-60">
                {saving ? 'MENYIMPAN...' : '💾 SIMPAN'}
              </button>
            </div>
          </div>
        </div>

        {/* Past entries */}
        {journals.filter(j => j.date !== dateKey).length > 0 && (
          <div>
            <h2 className="font-display text-xl tracking-[2px] mb-4">CATATAN SEBELUMNYA</h2>
            <div className="space-y-3">
              {journals.filter(j => j.date !== dateKey).slice(0, 10).map(j => (
                <div key={j.id}
                  className="neo-card overflow-hidden cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform"
                  onClick={() => setViewEntry(j)}>
                  <div className="flex items-center justify-between px-4 py-2 border-b-[2px] border-neo-black bg-neo-bg dark:bg-neo-bgDark">
                    <span className="font-mono font-bold text-[10px] uppercase tracking-[1px]">
                      {format(new Date(j.date + 'T00:00:00'), 'd MMM yyyy', { locale: id }).toUpperCase()}
                    </span>
                    <div className="flex gap-1 flex-wrap">
                      {(j.tags ?? []).slice(0,3).map((t: string) => (
                        <span key={t} className="font-mono font-bold text-[8px] uppercase px-1.5 py-0.5 border border-neo-black tracking-[0.5px]">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="px-4 py-3 text-sm text-neo-muted line-clamp-2 font-body">
                    {j.text || '(kosong)'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* View entry modal */}
      {viewEntry && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
             onClick={() => setViewEntry(null)}>
          <div className="bg-white border-[3px] border-neo-black w-full max-w-lg max-h-[80vh] overflow-y-auto"
               style={{ boxShadow: '10px 10px 0 #0a0a0a' }}
               onClick={e => e.stopPropagation()}>
            <div className="bg-neo-black px-5 py-3 flex items-center justify-between">
              <span className="font-display text-xl text-brand-yellow tracking-[2px]">
                {format(new Date(viewEntry.date + 'T00:00:00'), 'd MMMM yyyy', { locale: id }).toUpperCase()}
              </span>
              <button onClick={() => setViewEntry(null)} className="text-brand-yellow font-bold text-xl">✕</button>
            </div>
            <div className="p-5">
              <div className="flex gap-1 flex-wrap mb-4">
                {(viewEntry.tags ?? []).map((t: string) => (
                  <span key={t} className="font-mono font-bold text-[9px] uppercase px-2 py-1 border-[2px] border-neo-black tracking-[0.5px]">{t}</span>
                ))}
              </div>
              <p className="font-body text-[15px] leading-relaxed whitespace-pre-line">{viewEntry.text}</p>
            </div>
            <div className="flex justify-between p-4 border-t-[2px] border-neo-black bg-neo-bg">
              <button onClick={() => { deleteEntry(viewEntry.id); setViewEntry(null) }}
                className="neo-btn px-4 py-2 text-sm hover:bg-brand-red hover:text-white">🗑 HAPUS</button>
              <button onClick={() => setViewEntry(null)} className="neo-btn-black px-4 py-2 text-sm">TUTUP</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
