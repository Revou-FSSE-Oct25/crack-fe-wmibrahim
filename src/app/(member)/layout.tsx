'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [userName, setUserName] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    let token = localStorage.getItem('sb-access-token')
    
    // Fallback rahasia: Curi token dari Cookie jika LocalStorage lambat!
    if (!token) {
      const cookieStr = document.cookie.split('; ').find(row => row.startsWith('sb-access-token='))
      if (cookieStr) {
        token = cookieStr.split('=')[1]
        localStorage.setItem('sb-access-token', token)
      }
    }

    // Jika masih kosong juga, tendang balik ke login
    if (!token) {
      window.location.href = '/login'
      return
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL

    fetch(`${baseUrl}/api/auth`, { headers })
      .then(res => {
        if (!res.ok) throw new Error('Token tidak valid')
        return res.json()
      })
      .then(data => {
        // Ambil role dari berbagai kemungkinan struktur data
        const currentRole = data.role || data.profile?.role || data.user?.role || data.user?.user_metadata?.role

        // 🚨 PELINDUNG KETAT: Jika dia Admin, langsung tendang ke dashboard admin!
        if (currentRole === 'admin') {
          window.location.href = '/admin/dashboard'
          return
        }

        // Jika tidak ada role sama sekali dan bukan user valid, tendang ke login
        if (currentRole !== 'member' && !data.user) {
          window.location.href = '/login'
          return
        }
        
        setUserName(data.profile?.full_name || data.user?.user_metadata?.full_name || 'Member GymBook')
      })
      .catch(() => {
        localStorage.removeItem('sb-access-token')
        document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
        window.location.href = '/login'
      })
  }, [])

  if (!mounted || !userName) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-orange-500 font-semibold animate-pulse">Memuat Area Member...</div>
      </div>
    )
  }

  const navLinks = [
    { href: '/member/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/member/booking', label: 'Booking', icon: '🗓️' },
    { href: '/member/history', label: 'Riwayat', icon: '📋' },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="px-6 py-5 border-b border-gray-800">
          <h1 className="text-xl font-bold text-orange-500">GymBook</h1>
          <p className="text-xs text-gray-500 mt-1">Member Area</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navLinks.map(link => {
            const isActive = pathname === link.href
            return (
              <button
                key={link.href}
                onClick={() => window.location.href = link.href}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition ${
                  isActive
                    ? 'bg-orange-500 text-white font-semibold'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span>{link.icon}</span>
                {link.label}
              </button>
            )
          })}
        </nav>

        <div className="px-4 py-5 border-t border-gray-800">
          <p className="text-sm text-white font-medium truncate mb-3">{userName}</p>
          <button
            onClick={() => {
              localStorage.removeItem('sb-access-token')
              document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
              window.location.href = '/login'
            }}
            className="w-full text-sm text-gray-400 hover:text-red-400 transition text-left"
          >
            Keluar →
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}