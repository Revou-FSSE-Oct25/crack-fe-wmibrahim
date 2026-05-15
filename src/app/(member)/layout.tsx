'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [userName, setUserName] = useState('')

  useEffect(() => {
    fetch('/api/auth')
      .then(res => res.json())
      .then(data => {
        if (!data.profile) {
          router.push('/login')
          return
        }
        setUserName(data.profile.full_name)
      })
  }, [router])

  async function handleLogout() {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    })
    router.push('/login')
  }

  const navLinks = [
    { href: '/member/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/member/booking', label: 'Booking', icon: '🗓️' },
    { href: '/member/history', label: 'Riwayat', icon: '📋' },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="px-6 py-5 border-b border-gray-800">
          <h1 className="text-xl font-bold text-orange-500">GymBook</h1>
          <p className="text-xs text-gray-500 mt-1">Member Area</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition ${
                pathname === link.href
                  ? 'bg-orange-500 text-white font-semibold'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="px-4 py-5 border-t border-gray-800">
          <p className="text-sm text-white font-medium truncate mb-3">{userName}</p>
          <button
            onClick={handleLogout}
            className="w-full text-sm text-gray-400 hover:text-red-400 transition text-left"
          >
            Keluar →
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}