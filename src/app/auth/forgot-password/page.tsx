'use client'
// src/app/auth/forgot-password/page.tsx

import { useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { forgotPassword, getFriendlyError } from '@/lib/auth'

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]     = useState(false)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { toast.error('Masukkan email kamu!'); return }
    setLoading(true)
    try {
      await forgotPassword(email)
      setSent(true)
    } catch (err: any) {
      toast.error(getFriendlyError(err.code))
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-neo-bg flex items-center justify-center p-5">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link href="/auth/login"
            className="inline-block font-mono font-bold text-[10px] uppercase tracking-[1px] border-[2px] border-neo-black px-3 py-2 bg-white hover:bg-neo-bg transition-colors"
            style={{ boxShadow: '3px 3px 0 #0a0a0a' }}>
            ← KEMBALI
          </Link>
        </div>

        <div className="bg-white border-[3px] border-neo-black overflow-hidden"
             style={{ boxShadow: '8px 8px 0 #0a0a0a' }}>
          <div className="h-2 bg-brand-blue border-b-[2px] border-neo-black" />
          <div className="p-7">
            <h1 className="font-display text-4xl tracking-[3px] mb-6 pb-4 border-b-[2px] border-neo-black">
              LUPA PASSWORD
            </h1>

            {sent ? (
              <div className="text-center space-y-4 py-4">
                <div className="text-5xl">📨</div>
                <div className="font-display text-2xl text-brand-green tracking-[2px]">EMAIL TERKIRIM!</div>
                <p className="font-mono text-[11px] text-neo-muted leading-relaxed">
                  Cek inbox kamu dan klik link untuk reset password.
                </p>
                <Link href="/auth/login"
                  className="neo-btn-black inline-block px-6 py-3 text-sm mt-4">
                  ← KEMBALI KE LOGIN
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSend} className="space-y-5">
                <p className="font-mono text-[11px] text-neo-muted leading-relaxed">
                  Masukkan email yang terdaftar. Kami akan kirim link reset password.
                </p>
                <div>
                  <label className="neo-label block mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="kamu@email.com"
                    className="neo-input"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="neo-btn w-full py-3 bg-brand-blue text-white border-brand-blue disabled:opacity-60"
                  style={{ boxShadow: '3px 3px 0 #0a0a0a' }}
                >
                  {loading ? 'MENGIRIM...' : 'KIRIM LINK RESET →'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
