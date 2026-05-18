'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalBookings: 0,
    activeBookings: 0,
    cancelledBookings: 0,
  })
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const [membersRes, bookingsRes] = await Promise.all([
        apiFetch('/api/members'),
        apiFetch('/api/bookings'),
      ])
      const membersData = await membersRes.json()
      const bookingsData = await bookingsRes.json()

      const bookings = bookingsData.bookings || []
      const members = membersData.members || []

      setStats({
        totalMembers: members.length,
        totalBookings: bookings.length,
        activeBookings: bookings.filter((b: any) => b.status === 'active').length,
        cancelledBookings: bookings.filter((b: any) => b.status === 'cancelled').length,
      })
      setRecentBookings(bookings.slice(0, 8))
      setLoading(false)
    }
    fetchData()
  }, [])

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  function formatTime(time: string) { return time.slice(0, 5) }

  if (loading) return <div className="text-gray-400 text-sm">Memuat data...</div>

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Dashboard Admin</h2>
      <p className="text-gray-400 text-sm mb-8">Overview keseluruhan sistem GymBook</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Member', value: stats.totalMembers, icon: '👥', color: 'text-blue-400' },
          { label: 'Total Booking', value: stats.totalBookings, icon: '📋', color: 'text-orange-400' },
          { label: 'Booking Aktif', value: stats.activeBookings, icon: '✅', color: 'text-green-400' },
          { label: 'Dibatalkan', value: stats.cancelledBookings, icon: '❌', color: 'text-red-400' },
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

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="text-lg font-semibold mb-4">Booking Terbaru</h3>
        {recentBookings.length === 0 ? (
          <p className="text-gray-500 text-sm">Belum ada booking.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-left">
                <th className="pb-3 font-medium">Member</th>
                <th className="pb-3 font-medium">Tanggal</th>
                <th className="pb-3 font-medium">Sesi</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map(booking => (
                <tr key={booking.id} className="border-b border-gray-800 last:border-0">
                  <td className="py-3 text-white">{booking.profiles?.full_name || '-'}</td>
                  <td className="py-3 text-gray-300">{formatDate(booking.date)}</td>
                  <td className="py-3 text-gray-300">
                    {formatTime(booking.slots?.start_time)} – {formatTime(booking.slots?.end_time)}
                  </td>
                  <td className="py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs border ${
                      booking.status === 'active'
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {booking.status === 'active' ? 'Aktif' : 'Dibatalkan'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}