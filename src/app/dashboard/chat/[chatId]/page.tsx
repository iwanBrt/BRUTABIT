'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useStore } from '@/store'
import { db, COLS } from '@/lib/firebase'
import { doc, collection, addDoc, onSnapshot, query, orderBy, setDoc, updateDoc, getDoc, deleteDoc, increment } from 'firebase/firestore'
import { ArrowLeft, Send, Trash2 } from 'lucide-react'
import { clsx } from 'clsx'

export default function ChatRoomPage() {
  const { chatId } = useParams()
  const searchParams = useSearchParams()
  const targetName = searchParams.get('name') || 'Teman Chat'
  const { userId, userName } = useStore()
  const router = useRouter()
  
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!userId || !chatId) return

    // Create room if it doesn't exist just to register it
    const ensureRoom = async () => {
      const roomRef = doc(db, COLS.chats, chatId as string)
      const roomSnap = await getDoc(roomRef)
      if (!roomSnap.exists()) {
        const uids = (chatId as string).split('_')
        await setDoc(roomRef, {
          participants: uids,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          [`unreadCount.${userId}`]: 0
        })
      } else {
        await updateDoc(roomRef, {
          [`unreadCount.${userId}`]: 0
        })
      }
    }
    ensureRoom()

    // Listen to messages
    const q = query(collection(db, `${COLS.chats}/${chatId}/messages`), orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      // Auto scroll to bottom
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
      }, 100)
    })

    return () => unsub()
  }, [chatId, userId])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || !userId) return
    const msg = text.trim()
    setText('')
    
    await addDoc(collection(db, `${COLS.chats}/${chatId}/messages`), {
      senderId: userId,
      senderName: userName || 'Anonim',
      text: msg,
      createdAt: new Date().toISOString(),
    })
    
    const otherUid = (chatId as string).split('_').find(id => id !== userId)
    await updateDoc(doc(db, COLS.chats, chatId as string), {
      updatedAt: new Date().toISOString(),
      lastMessage: msg,
      ...(otherUid ? { [`unreadCount.${otherUid}`]: increment(1) } : {})
    })
  }

  const handleDeleteMessage = async (msgId: string) => {
    if (!confirm('Hapus chat dari alam semesta?')) return
    try {
      await deleteDoc(doc(db, `${COLS.chats}/${chatId}/messages`, msgId))
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-3xl mx-auto p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center gap-4 bg-neo-black border-[3px] border-brand-yellow p-4 mb-4">
        <button 
          onClick={() => router.back()}
          className="text-brand-yellow hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="font-display text-2xl tracking-[2px] text-brand-yellow uppercase">
          CHAT: {targetName}
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 bg-white dark:bg-neo-bgDark border-[3px] border-neo-black dark:border-white p-4 overflow-y-auto mb-4 flex flex-col gap-4 shadow-[5px_5px_0px_#0a0a0a]"
      >
        {messages.map((msg, i) => {
          const isMe = msg.senderId === userId
          return (
            <div key={msg.id || i} className={clsx("flex flex-col max-w-[80%]", isMe ? "self-end items-end" : "self-start items-start")}>
              <div className="text-[10px] font-mono font-bold text-gray-500 mb-1 flex items-center gap-2">
                {isMe ? 'Kamu' : msg.senderName}
                {isMe && (
                  <button onClick={() => handleDeleteMessage(msg.id)} className="text-brand-red hover:text-red-700 transition-colors" title="Hapus pesan">
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
              <div className={clsx(
                "px-4 py-2 font-mono font-semibold text-sm border-[2px] border-neo-black",
                isMe ? "bg-brand-blue text-white" : "bg-brand-yellow text-neo-black"
              )}>
                {msg.text}
              </div>
            </div>
          )
        })}
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center font-mono text-gray-500 font-bold p-8 text-center text-sm border-2 border-dashed border-gray-300">
            Belum ada pesan. Sapa {targetName} dengan gaya Neobrutalism-mu!
          </div>
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="flex gap-3">
        <input 
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ketik balasan brutalmu..."
          className="neo-input border-[3px] flex-1"
        />
        <button type="submit" disabled={!text.trim()} className="neo-btn bg-brand-pink text-neo-black border-[3px] text-lg px-6 flex items-center justify-center">
          <Send size={20} />
        </button>
      </form>
    </div>
  )
}
