'use client'
import { useState, useEffect } from 'react'
import { useStore } from '@/store'
import { db, COLS } from '@/lib/firebase'
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore'
import { Heart, MessageCircle, MessageSquare, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { clsx } from 'clsx'
import { formatDistanceToNow } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

export default function FeedPage() {
  const { userId, userName } = useStore()
  const router = useRouter()
  const [posts, setPosts] = useState<any[]>([])
  const [newPost, setNewPost] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Listen to posts
  useEffect(() => {
    const q = query(collection(db, COLS.posts), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [])

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPost.trim() || !userId) return
    setIsSubmitting(true)
    try {
      await addDoc(collection(db, COLS.posts), {
        authorId: userId,
        authorName: userName || 'Anonim',
        text: newPost.trim(),
        createdAt: new Date().toISOString(),
        likes: [],
        comments: 0
      })
      setNewPost('')
      toast.success('Berhasil memposting!')
    } catch (error) {
      toast.error('Gagal memposting')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleLike = async (postId: string, hasLiked: boolean, authorId: string) => {
    if (!userId) return
    const postRef = doc(db, COLS.posts, postId)
    try {
      if (hasLiked) {
        await updateDoc(postRef, { likes: arrayRemove(userId) })
      } else {
        await updateDoc(postRef, { likes: arrayUnion(userId) })
        // Send notification
        if (authorId !== userId) {
          await addDoc(collection(db, COLS.notifications), {
            userId: authorId,
            actorId: userId,
            actorName: userName || 'Anonim',
            type: 'like',
            postId,
            read: false,
            createdAt: new Date().toISOString()
          })
        }
      }
    } catch (e) {
      toast.error('Gagal like, pastikan rules firestore sudah update')
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Yakin ingin menghapus postingan brutal ini?')) return
    try {
      await deleteDoc(doc(db, COLS.posts, postId))
      toast.success('Postingan dihapus')
    } catch (e) {
      toast.error('Gagal menghapus postingan')
    }
  }

  const startChat = async (targetId: string, targetName: string) => {
    if (targetId === userId) {
      toast.error('Tidak bisa chat dengan diri sendiri')
      return;
    }
    const chatId = [userId, targetId].sort().join('_')
    // We navigate to the chat page directly. The chat page will handle creating the room if it doesn't exist yet!
    router.push(`/dashboard/chat/${chatId}?name=${encodeURIComponent(targetName)}`)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto min-h-screen pb-24">
      <h1 className="page-title mb-6 bg-neo-black text-brand-yellow p-4 border-[3px] border-brand-yellow inline-block">BERANDA (FEED)</h1>
      
      {/* Compose */}
      <form onSubmit={handlePost} className="neo-card p-4 mb-8 bg-brand-yellow dark:bg-brand-purple">
        <textarea
          className="neo-input mb-4 min-h-[100px] resize-y bg-white dark:bg-neo-black text-neo-black dark:text-white"
          placeholder="Apa yang ada di pikiran brutalmu hari ini...?"
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
        />
        <div className="flex justify-end">
          <button type="submit" disabled={isSubmitting || !newPost.trim()} className="neo-btn bg-brand-red text-white hover:bg-white hover:text-brand-red">
            {isSubmitting ? 'MENGIRIM...' : 'POSTING'}
          </button>
        </div>
      </form>

      {/* Feed */}
      <div className="space-y-6">
        {posts.map(post => {
          const hasLiked = post.likes?.includes(userId)
          return (
            <div key={post.id} className="neo-card p-5 animate-fade-in hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-start mb-3">
                <div className="font-display text-2xl tracking-[1px] text-brand-blue dark:text-brand-green uppercase">
                  {post.authorName}
                </div>
                <div className="text-xs font-mono text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 border-[1.5px] border-black dark:border-white">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: localeId })}
                </div>
              </div>
              <p className="font-mono text-[15px] leading-relaxed mb-4 whitespace-pre-wrap font-semibold">
                {post.text}
              </p>
              
              <div className="flex gap-4 border-t-[3px] border-neo-black dark:border-white pt-4 mt-2">
                <button 
                  onClick={() => toggleLike(post.id, hasLiked, post.authorId)}
                  className={clsx("flex items-center gap-2 font-mono text-sm font-bold transition-transform hover:-translate-y-1 border-[2px] px-3 py-1 bg-white dark:bg-neo-black", hasLiked ? "text-brand-red border-brand-red" : "text-neo-black dark:text-white border-neo-black dark:border-white")}
                >
                  <Heart size={16} className={hasLiked ? "fill-current" : ""} /> {post.likes?.length || 0}
                </button>
                <button 
                  onClick={() => router.push(`/dashboard/feed/${post.id}`)}
                  className="flex items-center gap-2 font-mono text-sm font-bold text-neo-black dark:text-white transition-transform hover:-translate-y-1 hover:text-brand-blue border-[2px] border-neo-black dark:border-white px-3 py-1 bg-white dark:bg-neo-black"
                >
                  <MessageCircle size={16} /> {post.comments || 0}
                </button>
                {post.authorId !== userId ? (
                  <button 
                    onClick={() => startChat(post.authorId, post.authorName)}
                    className="flex items-center gap-2 font-mono text-sm font-bold text-neo-black dark:text-white ml-auto transition-transform hover:-translate-y-1 hover:text-brand-green border-[2px] border-neo-black dark:border-white px-3 py-1 bg-white dark:bg-neo-black"
                  >
                    <MessageSquare size={16} /> CHAT
                  </button>
                ) : (
                  <button 
                    onClick={() => handleDeletePost(post.id)}
                    className="flex items-center gap-2 font-mono text-sm font-bold text-white bg-brand-red ml-auto transition-transform hover:-translate-y-1 hover:bg-red-700 border-[2px] border-neo-black dark:border-white px-3 py-1"
                  >
                    <Trash2 size={16} /> HAPUS
                  </button>
                )}
              </div>
            </div>
          )
        })}
        {posts.length === 0 && (
          <div className="text-center font-mono p-8 text-neo-black dark:text-white font-bold neo-card bg-brand-pink">
            Belum ada postingan. Jadilah yang pertama brutal!
          </div>
        )}
      </div>
    </div>
  )
}
