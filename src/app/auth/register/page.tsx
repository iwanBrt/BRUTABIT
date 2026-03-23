'use client'
// src/app/auth/register/page.tsx

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { registerWithEmail, loginWithGoogle, getFriendlyError } from '@/lib/auth'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password || !confirm) { toast.error('Semua field wajib diisi!'); return }
    if (password !== confirm) { toast.error('Password tidak cocok!'); return }
    if (password.length < 6)  { toast.error('Password minimal 6 karakter!'); return }
    setLoading(true)
    try {
      await registerWithEmail(email, password, name)
      toast.success('✓ Akun berhasil dibuat!')
      router.replace('/dashboard/habits')
    } catch (err: any) {
      toast.error(getFriendlyError(err.code))
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-neo-bg flex items-center justify-center p-5">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-block bg-neo-black px-8 py-4 border-[3px] border-neo-black mb-4"
               style={{ boxShadow: '8px 8px 0 #0a0a0a' }}>
            <span className="font-display text-5xl text-brand-yellow tracking-[5px]">BRUTABIT</span>
          </div>
          <p className="font-mono text-[11px] text-neo-muted tracking-[2px] uppercase">
            Buat akun gratis sekarang
          </p>
        </div>

        <div className="bg-white border-[3px] border-neo-black overflow-hidden"
             style={{ boxShadow: '8px 8px 0 #0a0a0a' }}>
          <div className="h-2 bg-brand-yellow border-b-[2px] border-neo-black" />

          <div className="p-7">
            <div className="flex items-center justify-between mb-6 pb-4 border-b-[2px] border-neo-black">
              <h1 className="font-display text-4xl tracking-[3px]">DAFTAR</h1>
              <Link href="/auth/login"
                className="font-mono font-bold text-[10px] uppercase tracking-[1px] border-[2px] border-neo-black px-3 py-1.5 hover:bg-neo-bg transition-colors"
                style={{ boxShadow: '2px 2px 0 #0a0a0a' }}>
                ← LOGIN
              </Link>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              {[
                { label: 'Nama Kamu', value: name, setter: setName, type: 'text', placeholder: 'John Doe' },
                { label: 'Email', value: email, setter: setEmail, type: 'email', placeholder: 'kamu@email.com' },
                { label: 'Password', value: password, setter: setPassword, type: 'password', placeholder: '••••••••' },
                { label: 'Ulangi Password', value: confirm, setter: setConfirm, type: 'password', placeholder: '••••••••' },
              ].map(f => (
                <div key={f.label}>
                  <label className="neo-label block mb-2">{f.label}</label>
                  <input
                    type={f.type}
                    value={f.value}
                    onChange={e => f.setter(e.target.value)}
                    placeholder={f.placeholder}
                    className="neo-input"
                  />
                </div>
              ))}

              <div className="border-[2px] border-neo-black bg-neo-bg p-3 mt-2">
                <p className="font-mono text-[10px] text-neo-muted leading-relaxed">
                  Dengan mendaftar, kamu setuju data habitmu tersimpan di cloud Firebase
                  dan dapat diakses dari perangkat manapun.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="neo-btn-yellow w-full py-3 text-sm disabled:opacity-60 mt-2"
              >
                {loading ? 'MEMBUAT AKUN...' : 'BUAT AKUN →'}
              </button>
            </form>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-[2px] bg-neo-black" />
              <span className="font-mono font-bold text-[10px] text-neo-muted tracking-[2px]">ATAU</span>
              <div className="flex-1 h-[2px] bg-neo-black" />
            </div>

            <button
              onClick={async () => {
                setLoading(true)
                try {
                  await loginWithGoogle()
                  router.replace('/dashboard/habits')
                } catch (err: any) {
                  toast.error(getFriendlyError(err.code))
                } finally { setLoading(false) }
              }}
              disabled={loading}
              className="neo-btn w-full py-3 flex items-center justify-center gap-2"
            >
              <span className="font-black text-lg text-brand-red">G</span>
              <span>DAFTAR DENGAN GOOGLE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
