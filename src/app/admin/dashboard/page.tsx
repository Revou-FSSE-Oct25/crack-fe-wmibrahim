'use client'

import { useEffect, useState } from 'react'

interface BookingOverview {
  id: string
  date: string
  status: string
  user_id: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ totalMembers: 0, totalBookings: 0, activeSlots: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAdminData() {
      const token = localStorage.getItem('sb-access-token')
      
      const headers = {
        'Authorization': `Bearer ${token || ''}`,
        'Content-Type': 'application/json'
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL

      try {
        // Menembak data dashboard admin ke port 3001 secara aman
        const [authRes, bookingsRes] = await Promise.all([
          fetch(`${baseUrl}/api/auth`, { headers }),
          fetch(`${baseUrl}/api/bookings`, { headers })
        ])

        const authData = await authRes.json()
        const bookingsData = await bookingsRes.json()

        // Jika token tidak valid atau bukan admin, sistem akan diam dan membiarkan layout yang me-redirect
        if (authRes.ok && bookingsRes.ok) {
          const allBookings: BookingOverview[] = bookingsData.bookings || []
          
          setStats({
            totalMembers: authData.total_members || 0,
            totalBookings: allBookings.length,
            activeSlots: allBookings.filter(b => b.status === 'active').length
          })
        }
      } catch (error) {
        console.error('Gagal mengambil data admin dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [])

  if (loading) {
    return <div className="text-gray-400 text-sm">Memuat panel admin...</div>
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Overview Dashboard Admin 📊</h2>
      <p className="text-gray-400 text-sm mb-8">Kondisi sistem dan manajemen GymBook saat ini</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Member Terdaftar', value: stats.totalMembers, icon: '👥', color: 'text-orange-400' },
          { label: 'Total Transaksi Booking', value: stats.totalBookings, icon: '📋', color: 'text-blue-400' },
          { label: 'Booking Aktif Hari Ini', value: stats.activeSlots, icon: '⚡', color: 'text-green-400' },
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

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 text-center text-gray-500 text-sm">
        Gunakan menu sidebar di samping untuk mengelola jadwal slot dan data member.
      </div>
    </div>
  )
}