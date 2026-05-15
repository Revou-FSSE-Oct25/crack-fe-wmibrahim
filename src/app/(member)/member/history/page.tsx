'use client'

import { useEffect, useState } from 'react'

interface Booking {
  id: string
  date: string
  status: string
  created_at: string
  slots: { start_time: string; end_time: string }
}

export default function HistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => {
        setBookings(data.bookings || [])
        setLoading(false)
      })
  }, [])

  function formatTime(time: string) {
    return time.slice(0, 5)
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  if (loading) return <div className="text-gray-400 text-sm">Memuat data...</div>

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Riwayat Booking</h2>
      <p className="text-gray-400 text-sm mb-6">Semua histori booking kamu</p>

      {bookings.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-500 text-sm">Belum ada riwayat booking.</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-left">
                <th className="px-6 py-4 font-medium">Tanggal</th>
                <th className="px-6 py-4 font-medium">Sesi</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking, i) => (
                <tr
                  key={booking.id}
                  className={`border-b border-gray-800 last:border-0 ${i % 2 === 0 ? '' : 'bg-gray-800/30'}`}
                >
                  <td className="px-6 py-4 text-white">{formatDate(booking.date)}</td>
                  <td className="px-6 py-4 text-gray-300">
                    {formatTime(booking.slots.start_time)} – {formatTime(booking.slots.end_time)}
                  </td>
                  <td className="px-6 py-4">
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
        </div>
      )}
    </div>
  )
}