'use client'
import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/store'
import { Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { db, COLS } from '@/lib/firebase'
import { doc, updateDoc, writeBatch } from 'firebase/firestore'
import { formatDistanceToNow } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { clsx } from 'clsx'

export function NotificationMenu() {
  const { notifications, userId } = useStore()
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const menuRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.read).length

  // Close when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const markAllAsRead = async () => {
    if (!userId) return
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
    if (unreadIds.length === 0) return

    const batch = writeBatch(db)
    unreadIds.forEach(id => {
      const ref = doc(db, COLS.notifications, id)
      batch.update(ref, { read: true })
    })
    try {
      await batch.commit()
    } catch (e) {
      console.error('Error marking as read', e)
    }
  }

  const handleOpen = () => {
    if (!isOpen) {
      markAllAsRead()
    }
    setIsOpen(!isOpen)
  }

  const handleNotifClick = (notif: any) => {
    setIsOpen(false)
    if (notif.postId) {
      router.push(`/dashboard/feed/${notif.postId}`)
    }
  }

  return (
    <div className="fixed top-3 right-4 lg:top-6 lg:right-6 z-50 float-right" ref={menuRef}>
      <button 
        onClick={handleOpen}
        className="relative neo-btn bg-brand-yellow border-[3px] p-2 hover:-translate-y-1 transition-transform"
      >
        <Bell size={24} className="text-neo-black" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-brand-red text-white font-mono font-bold text-[10px] w-5 h-5 flex items-center justify-center border-[2px] border-neo-black rounded-full shadow-[2px_2px_0px_#0a0a0a]">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 lg:right-0 w-80 max-h-96 overflow-y-auto bg-white dark:bg-neo-bgDark border-[3px] border-neo-black dark:border-white shadow-[6px_6px_0px_#0a0a0a] flex flex-col">
          <div className="p-3 bg-neo-black text-brand-yellow font-display text-xl tracking-[1px] border-b-[3px] border-neo-black dark:border-white flex justify-between items-center">
            <span>NOTIFIKASI</span>
          </div>
          
          <div className="flex flex-col">
            {notifications.map(notif => (
              <div 
                key={notif.id}
                onClick={() => handleNotifClick(notif)}
                className={clsx(
                  "p-3 border-b-[2px] border-gray-200 dark:border-gray-800 cursor-pointer hover:bg-brand-yellow dark:hover:bg-brand-purple hover:text-neo-black transition-colors font-mono space-y-1",
                  !notif.read ? "bg-amber-50 dark:bg-amber-900/20 font-bold" : "text-gray-700 dark:text-gray-300"
                )}
              >
                <div className="text-sm">
                  <span className="text-brand-blue dark:text-brand-green uppercase font-bold">{notif.actorName}</span>
                  {' '}
                  {notif.type === 'like' ? 'menyukai postinganmu' : 'mengomentari postinganmu'}
                </div>
                {notif.createdAt && (
                  <div className="text-[10px] text-gray-500 font-semibold">
                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: localeId })}
                  </div>
                )}
              </div>
            ))}
            
            {notifications.length === 0 && (
              <div className="p-6 text-center font-mono font-bold text-gray-500 text-sm">
                Belum ada notifikasi.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
