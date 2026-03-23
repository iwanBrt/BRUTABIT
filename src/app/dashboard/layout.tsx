// src/app/dashboard/layout.tsx
'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { useStore } from '@/store'
import { clsx } from 'clsx'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, setSidebarOpen, theme } = useStore()

  return (
    <div className={clsx('min-h-screen', theme === 'dark' && 'dark')}>
      <Sidebar />

      {/* Topbar (mobile) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-neo-black border-b-[3px] border-brand-yellow flex items-center px-4 py-3 gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="font-mono font-bold text-brand-yellow text-lg"
        >☰</button>
        <span className="font-display text-2xl text-brand-yellow tracking-[3px]">BRUTABIT</span>
      </div>

      {/* Main content */}
      <main className={clsx(
        'min-h-screen transition-all duration-200',
        'lg:ml-[220px]',
        'pt-[52px] lg:pt-0',
        'bg-neo-bg dark:bg-neo-bgDark',
      )}>
        {children}
      </main>
    </div>
  )
}
