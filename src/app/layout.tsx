// src/app/layout.tsx
import type { Metadata } from 'next'
import { Bebas_Neue, Space_Mono, DM_Sans } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/components/layout/AuthProvider'
import './globals.css'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
})

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
})

const dmSans = DM_Sans({
  weight: ['400', '500', '700', '800'],
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'BRUTABIT — Habit OS',
  description: 'Track habits. Journal daily. Win.',
  manifest: '/manifest.json',
  themeColor: '#0a0a0a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${bebasNeue.variable} ${spaceMono.variable} ${dmSans.variable} font-body bg-neo-bg dark:bg-neo-bgDark text-neo-black dark:text-white min-h-screen`}>
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#0a0a0a',
                color: '#ffe600',
                fontFamily: 'var(--font-space-mono)',
                fontSize: '12px',
                fontWeight: '700',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                border: '2px solid #ffe600',
                borderRadius: '0',
                boxShadow: '5px 5px 0 #ffe600',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
