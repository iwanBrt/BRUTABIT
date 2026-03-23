'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store'
import { db, COLS } from '@/lib/firebase'
import { collection, query, where, onSnapshot, orderBy, getDoc, doc } from 'firebase/firestore'
import { MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

function ChatItem({ chat, userId, router }: { chat: any, userId: string, router: any }) {
  const [targetName, setTargetName] = useState('')
  const otherUid = chat.participants.find((p: string) => p !== userId)

  useEffect(() => {
    if (!otherUid) return
    getDoc(doc(db, COLS.users, otherUid)).then(snap => {
      if (snap.exists()) {
        setTargetName(snap.data().displayName || snap.data().email || 'Anonim')
      } else {
        setTargetName('Anonim')
      }
    })
  }, [otherUid])

  return (
    <div 
      onClick={() => router.push(`/dashboard/chat/${chat.id}?name=${encodeURIComponent(targetName || 'Seseorang')}`)}
      className="neo-card p-4 cursor-pointer hover:-translate-y-1 transition-all flex items-center gap-4 group hover:bg-brand-yellow dark:hover:bg-brand-purple"
    >
      <div className="w-14 h-14 bg-neo-black text-brand-yellow flex items-center justify-center font-display text-2xl border-[2px] border-neo-black flex-shrink-0 shadow-[2px_2px_0px_#0a0a0a] group-hover:shadow-[4px_4px_0px_#0a0a0a] transition-all">
        {(targetName || 'U')[0].toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <h3 className="font-display text-2xl tracking-[1px] text-neo-black dark:text-white uppercase truncate group-hover:text-neo-black">
            {targetName || 'Loading...'}
          </h3>
          {chat.updatedAt && (
            <span className="text-[10px] font-mono text-gray-500 font-bold flex-shrink-0 group-hover:text-neo-black bg-white dark:bg-neo-black px-1.5 py-0.5 border border-neo-black">
              {formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true, locale: localeId })}
            </span>
          )}
        </div>
        <p className="font-mono text-sm text-gray-600 dark:text-gray-400 truncate font-semibold group-hover:text-neo-black">
          {chat.lastMessage || 'Menunggu pesan pertama...'}
        </p>
      </div>
      <div className="text-gray-400 group-hover:text-neo-black transition-colors">
        <MessageSquare size={24} />
      </div>
    </div>
  )
}

export default function ChatsIndexPage() {
  const { userId } = useStore()
  const router = useRouter()
  const [chats, setChats] = useState<any[]>([])

  useEffect(() => {
    if (!userId) return

    const q = query(
      collection(db, COLS.chats),
      where('participants', 'array-contains', userId)
    )

    const unsub = onSnapshot(q, (snap) => {
      const fetchedChats = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      fetchedChats.sort((a: any, b: any) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
      setChats(fetchedChats)
    })

    return () => unsub()
  }, [userId])

  return (
    <div className="p-6 max-w-3xl mx-auto min-h-screen">
      <h1 className="page-title mb-8 bg-neo-black text-brand-blue p-4 border-[3px] border-brand-blue inline-block">
        DAFTAR CHAT
      </h1>

      <div className="space-y-4">
        {chats.map(chat => (
          <ChatItem key={chat.id} chat={chat} userId={userId as string} router={router} />
        ))}

        {chats.length === 0 && (
          <div className="neo-card bg-brand-pink p-8 text-center border-[3px] flex flex-col items-center justify-center gap-4">
            <MessageSquare size={48} className="text-neo-black" />
            <p className="font-mono font-bold text-neo-black text-lg max-w-md">
              Kok sepi? Kamu belum punya obrolan dengan siapapun. Sapa seseorang di Beranda!
            </p>
            <button 
              onClick={() => router.push('/dashboard/feed')}
              className="neo-btn bg-white text-neo-black mt-4"
            >
              KE BERANDA SEKARANG
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
