'use client'
// src/app/auth/login/page.tsx

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { loginWithEmail, loginWithGoogle, getFriendlyError } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { toast.error('Isi email dan password dulu!'); return }
    setLoading(true)
    try {
      await loginWithEmail(email, password)
      toast.success('✓ Berhasil masuk!')
      router.replace('/dashboard/habits')
    } catch (err: any) {
      toast.error(getFriendlyError(err.code))
    } finally { setLoading(false) }
  }

  const handleGoogle = async () => {
    setLoading(true)
    try {
      await loginWithGoogle()
      toast.success('✓ Berhasil masuk dengan Google!')
      router.replace('/dashboard/habits')
    } catch (err: any) {
      toast.error(getFriendlyError(err.code))
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-neo-bg flex items-center justify-center p-5">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block bg-neo-black px-8 py-4 border-[3px] border-neo-black mb-4"
               style={{ boxShadow: '8px 8px 0 #0a0a0a' }}>
            <span className="font-display text-5xl text-brand-yellow tracking-[5px]">BRUTABIT</span>
          </div>
          <p className="font-mono text-[11px] text-neo-muted tracking-[2px] uppercase">
            Habit OS — Track. Journal. Win.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border-[3px] border-neo-black overflow-hidden"
             style={{ boxShadow: '8px 8px 0 #0a0a0a' }}>
          <div className="h-2 bg-brand-red border-b-[2px] border-neo-black" />

          <div className="p-7">
            <h1 className="font-display text-4xl tracking-[3px] mb-6 border-b-[2px] border-neo-black pb-4">
              LOGIN
            </h1>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="neo-label block mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="kamu@email.com"
                  className="neo-input"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="neo-label block mb-2">Password</label>
                <div className="flex border-[2px] border-neo-black">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="flex-1 font-body text-sm px-3 py-2.5 bg-neo-bg outline-none"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="w-12 flex items-center justify-center border-l-[2px] border-neo-black bg-neo-bg hover:bg-brand-yellow transition-colors"
                  >
                    {showPass ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <Link href="/auth/forgot-password"
                  className="font-mono text-[10px] text-neo-muted hover:text-brand-red underline tracking-[1px] uppercase">
                  Lupa password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="neo-btn-primary w-full py-3 text-sm disabled:opacity-60"
              >
                {loading ? 'MEMUAT...' : 'MASUK →'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-[2px] bg-neo-black" />
              <span className="font-mono font-bold text-[10px] text-neo-muted tracking-[2px]">ATAU</span>
              <div className="flex-1 h-[2px] bg-neo-black" />
            </div>

            {/* Google */}
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="neo-btn w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <span className="font-black text-lg text-brand-red">G</span>
              <span>LANJUT DENGAN GOOGLE</span>
            </button>
          </div>
        </div>

        {/* Register link */}
        <p className="text-center mt-6 font-mono text-[11px] text-neo-muted">
          Belum punya akun?{' '}
          <Link href="/auth/register"
            className="font-bold text-brand-red hover:underline tracking-[1px] uppercase">
            Daftar Sekarang →
          </Link>
        </p>
      </div>
    </div>
  )
}
