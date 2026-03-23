'use client'
// src/components/layout/Sidebar.tsx

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useStore } from '@/store'
import { logout } from '@/lib/auth'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

const NAV_ITEMS = [
  { href: '/dashboard/feed',    icon: '🌐', label: 'BERANDA' },
  { href: '/dashboard/chat',    icon: '💬', label: 'CHATS'   },
  { href: '/dashboard/habits',  icon: '🏠', label: 'HABITS'  },
  { href: '/dashboard/journal', icon: '📓', label: 'JURNAL'  },
  { href: '/dashboard/todo',    icon: '✅', label: 'TO-DO'   },
  { href: '/dashboard/mood',    icon: '😊', label: 'MOOD'    },
  { href: '/dashboard/stats',   icon: '📊', label: 'STATS'   },
  { href: '/dashboard/rewards', icon: '🏆', label: 'REWARDS' },
  { href: '/dashboard/alarms',  icon: '⏰', label: 'ALARM'   },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { xp, todos, userName, userEmail, sidebarOpen, setSidebarOpen, theme, setTheme } = useStore()
  const activeTodos = todos.filter(t => !t.done).length

  const handleLogout = async () => {
    await logout()
    toast.success('👋 Sampai jumpa!')
    router.replace('/')
  }

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={clsx(
        'fixed left-0 top-0 h-full z-50 flex flex-col',
        'bg-neo-black border-r-[3px] border-brand-yellow',
        'transition-transform duration-200',
        'w-[220px]',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}>
        {/* Logo */}
        <div className="px-5 py-4 border-b-[3px] border-brand-yellow flex items-center justify-between">
          <span className="font-display text-3xl text-brand-yellow tracking-[4px]">
            BRUTABIT
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-brand-yellow text-lg font-bold"
          >✕</button>
        </div>

        {/* XP badge */}
        <div className="px-4 py-3 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-2 bg-[#111] border border-[#333] px-3 py-2">
            <span className="text-sm">⚡</span>
            <span className="font-mono font-bold text-[11px] text-brand-yellow tracking-[1px]">
              {xp} XP
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={clsx(
                'sidebar-item',
                pathname === item.href && 'active',
              )}
            >
              <span className="icon">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.label === 'TO-DO' && activeTodos > 0 && (
                <span className="bg-brand-red text-white font-mono font-bold text-[9px] px-1.5 py-0.5 border border-brand-yellow">
                  {activeTodos}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t-[2px] border-[#1a1a1a]">
          {/* User */}
          <div className="px-4 py-3 border-b border-[#1a1a1a]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-yellow border-[2px] border-[#333] flex items-center justify-center font-display text-lg text-neo-black flex-shrink-0">
                {(userName ?? userEmail ?? 'U')[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-mono font-bold text-[10px] text-white truncate uppercase tracking-[0.5px]">
                  {userName ?? 'User'}
                </div>
                <div className="font-mono text-[9px] text-[#555] truncate">
                  {userEmail}
                </div>
              </div>
            </div>
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="sidebar-item w-full border-b"
          >
            <span className="icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span>{theme === 'dark' ? 'LIGHT MODE' : 'DARK MODE'}</span>
          </button>

          {/* Logout */}
          <button onClick={handleLogout} className="sidebar-item w-full text-brand-red! hover:text-brand-red hover:bg-[#1a0000]">
            <span className="icon">🚪</span>
            <span>LOGOUT</span>
          </button>
        </div>
      </aside>
    </>
  )
}
