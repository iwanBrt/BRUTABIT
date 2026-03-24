'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useStore } from '@/store'
import { db, COLS } from '@/lib/firebase'
import { doc, getDoc, collection, addDoc, onSnapshot, query, orderBy, updateDoc, increment, deleteDoc } from 'firebase/firestore'
import { ArrowLeft, MessageCircle, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

export default function PostDetailPage() {
  const { id } = useParams()
  const { userId, userName } = useStore()
  const router = useRouter()
  
  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Listen to Post changes
  useEffect(() => {
    if (!id) return;
    const unsubPost = onSnapshot(doc(db, COLS.posts, id as string), (doc) => {
      if (doc.exists()) {
        setPost({ id: doc.id, ...doc.data() })
      } else {
        router.push('/dashboard/feed')
        toast.error('Postingan tidak ditemukan')
      }
    })

    const q = query(collection(db, `${COLS.posts}/${id}/comments`), orderBy('createdAt', 'asc'))
    const unsubComments = onSnapshot(q, (snap) => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })

    return () => {
      unsubPost()
      unsubComments()
    }
  }, [id])

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !userId) return
    setIsSubmitting(true)

    try {
      // Add comment subcollection
      await addDoc(collection(db, `${COLS.posts}/${id}/comments`), {
        authorId: userId,
        authorName: userName || 'Anonim',
        text: newComment.trim(),
        createdAt: new Date().toISOString(),
      })
      
      // Update comment count
      await updateDoc(doc(db, COLS.posts, id as string), {
        comments: increment(1)
      })

      // Send notification if commenting on someone else's post
      if (post && post.authorId !== userId) {
        await addDoc(collection(db, COLS.notifications), {
          userId: post.authorId,
          actorId: userId,
          actorName: userName || 'Anonim',
          type: 'comment',
          postId: id as string,
          read: false,
          createdAt: new Date().toISOString()
        })
      }

      setNewComment('')
      toast.success('Komentar berhasil ditambahkan')
    } catch (e) {
      toast.error('Gagal mengirim komentar')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Yakin hapus komentar ini?')) return
    try {
      await deleteDoc(doc(db, `${COLS.posts}/${id}/comments`, commentId))
      await updateDoc(doc(db, COLS.posts, id as string), {
        comments: increment(-1)
      })
      toast.success('Komentar dihapus')
    } catch (e) {
      toast.error('Gagal menghapus komentar')
    }
  }

  if (!post) return <div className="p-8 font-mono text-center">Loading be brutal...</div>

  return (
    <div className="p-6 max-w-2xl mx-auto min-h-screen pb-24">
      <button 
        onClick={() => router.push('/dashboard/feed')}
        className="flex items-center gap-2 mb-6 font-mono font-bold text-sm neo-btn bg-white dark:bg-neo-black border-[3px]"
      >
        <ArrowLeft size={16} /> KEMBALI
      </button>

      {/* Original Post */}
      <div className="neo-card p-6 mb-8 border-[4px] bg-brand-yellow dark:bg-brand-purple">
        <div className="font-display text-3xl tracking-[1px] text-neo-black dark:text-white uppercase mb-1">
          {post.authorName}
        </div>
        <div className="text-xs font-mono text-black dark:text-white/80 mb-4 bg-white/20 inline-block px-2 py-1 border-[1.5px] border-neo-black">
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: localeId })}
        </div>
        <p className="font-mono text-lg leading-relaxed mb-4 whitespace-pre-wrap font-semibold text-neo-black dark:text-white bg-white/50 dark:bg-black/20 p-4 border-[2px] border-neo-black">
          {post.text}
        </p>
      </div>

      <h3 className="font-display text-2xl mb-4 bg-neo-black text-white inline-block px-4 py-1 border-[2px] border-white">KOMENTAR ({comments.length})</h3>

      {/* Reply Box */}
      <form onSubmit={handleComment} className="flex gap-4 mb-8">
        <input 
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Brutalkan komentarmu..."
          className="neo-input flex-1 border-[3px]"
        />
        <button type="submit" disabled={isSubmitting || !newComment.trim()} className="neo-btn bg-brand-green border-[3px] text-neo-black">
          KIRIM
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map(comment => (
          <div key={comment.id} className="neo-card p-4 flex flex-col gap-2">
            <div className="flex justify-between">
              <div className="flex items-center gap-3">
                <span className="font-display text-lg tracking-[1px] text-brand-blue dark:text-brand-yellow uppercase">
                  {comment.authorName}
                </span>
                {comment.authorId === userId && (
                  <button onClick={() => handleDeleteComment(comment.id)} className="text-brand-red hover:text-red-700 transition-colors">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <span className="text-[10px] font-mono font-bold text-gray-500">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: localeId })}
              </span>
            </div>
            <p className="font-mono text-sm font-semibold">{comment.text}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="font-mono text-sm text-center p-4 bg-gray-100 dark:bg-neo-black border-[2px] border-dashed border-gray-400">
            Jadilah yang pertama untuk melemparkan komentar.
          </p>
        )}
      </div>
    </div>
  )
}
