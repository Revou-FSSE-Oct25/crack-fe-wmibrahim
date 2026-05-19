'use client'

import { useEffect, useState } from 'react'

interface Booking {
  id: string
  date: string
  status: string
  slots: { start_time: string; end_time: string }
}

interface Profile {
  full_name: string
  phone: string
  created_at: string
}

export default function MemberDashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      // Mengambil token JWT dari localStorage
      const token = localStorage.getItem('sb-access-token')
      
      // Menyiapkan konfigurasi header Authorization
      const headers = {
        'Authorization': `Bearer ${token || ''}`,
        'Content-Type': 'application/json'
      }

      try {
        const [authRes, bookingRes] = await Promise.all([
          fetch('${API_URL}/api/auth', { headers }),
          fetch('${API_URL}/api/bookings', { headers }),
        ])
        
        const authData = await authRes.json()
        const bookingData = await bookingRes.json()

        setProfile(authData.profile)
        setBookings(bookingData.bookings || [])
      } catch (error) {
        console.error('Gagal memuat data dashboard:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const activeBookings = bookings.filter(b => b.status === 'active')
  const todayStr = new Date().toISOString().split('T')[0]
  const todayBookings = bookings.filter(b => b.date === todayStr && b.status === 'active')

  function formatTime(time: string) {
    return time.slice(0, 5)
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  if (loading) {
    return <div className="text-gray-400 text-sm">Memuat data...</div>
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">
        Halo, {profile?.full_name?.split(' ')[0] || 'Member'}! 👋
      </h2>
      <p className="text-gray-400 text-sm mb-8">Selamat datang kembali di GymBook</p>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Booking Aktif', value: activeBookings.length, icon: '🗓️', color: 'text-orange-400' },
          { label: 'Latihan Hari Ini', value: todayBookings.length, icon: '⚡', color: 'text-green-400' },
          { label: 'Total Booking', value: bookings.length, icon: '📋', color: 'text-blue-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">{stat.label}</span>
              <span className="text-xl">{stat.icon}</span>
            </div>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Upcoming bookings */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="text-lg font-semibold mb-4">Booking Mendatang</h3>
        {activeBookings.length === 0 ? (
          <p className="text-gray-500 text-sm">Belum ada booking aktif.</p>
        ) : (
          <div className="space-y-3">
            {activeBookings.slice(0, 5).map(booking => (
              <div
                key={booking.id}
                className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{formatDate(booking.date)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {booking.slots ? `${formatTime(booking.slots.start_time)} – ${formatTime(booking.slots.end_time)}` : ''}
                  </p>
                </div>
                <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-1 rounded-full">
                  Aktif
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}