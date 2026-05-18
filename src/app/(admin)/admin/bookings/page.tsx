'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'

interface Booking {
  id: string
  date: string
  status: string
  profiles: { full_name: string }
  slots: { start_time: string; end_time: string }
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'cancelled'>('all')

  useEffect(() => { fetchBookings() }, [])

  async function fetchBookings() {
    const res = await apiFetch('/api/bookings')
    const data = await res.json()
    setBookings(data.bookings || [])
    setLoading(false)
  }

  async function handleCancel(id: string) {
    if (!confirm('Batalkan booking ini?')) return

    setCancellingId(id)
    const res = await apiFetch(`/api/bookings/${id}`, { method: 'PATCH' })
    const data = await res.json()
    setCancellingId(null)

    if (!res.ok) {
      setMessage({ type: 'error', text: data.error })
      return
    }

    setMessage({ type: 'success', text: 'Booking berhasil dibatalkan' })
    fetchBookings()
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  function formatTime(time: string) { return time.slice(0, 5) }

  const filtered = bookings.filter(b => filter === 'all' ? true : b.status === filter)

  if (loading) return <div className="text-gray-400 text-sm">Memuat data...</div>

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Kelola Booking</h2>
      <p className="text-gray-400 text-sm mb-6">Lihat dan batalkan booking member</p>

      {message && (
        <div className={`mb-6 text-sm rounded-lg px-4 py-3 border ${
          message.type === 'success'
            ? 'bg-green-500/10 border-green-500/30 text-green-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex gap-2 mb-6">
        {(['all', 'active', 'cancelled'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              filter === f
                ? 'bg-orange-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {f === 'all' ? 'Semua' : f === 'active' ? 'Aktif' : 'Dibatalkan'}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-gray-500 text-sm p-6">Tidak ada booking.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-left">
                <th className="px-6 py-4 font-medium">Member</th>
                <th className="px-6 py-4 font-medium">Tanggal</th>
                <th className="px-6 py-4 font-medium">Sesi</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((booking, i) => (
                <tr key={booking.id} className={`border-b border-gray-800 last:border-0 ${i % 2 === 0 ? '' : 'bg-gray-800/30'}`}>
                  <td className="px-6 py-4 text-white">{booking.profiles?.full_name || '-'}</td>
                  <td className="px-6 py-4 text-gray-300">{formatDate(booking.date)}</td>
                  <td className="px-6 py-4 text-gray-300">
                    {formatTime(booking.slots?.start_time)} – {formatTime(booking.slots?.end_time)}
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
                  <td className="px-6 py-4">
                    {booking.status === 'active' && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancellingId === booking.id}
                        className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs rounded-lg transition"
                      >
                        {cancellingId === booking.id ? '...' : 'Batalkan'}
                      </button>
                    )}
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