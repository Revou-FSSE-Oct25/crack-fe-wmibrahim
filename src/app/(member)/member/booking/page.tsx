'use client'

import { useEffect, useState } from 'react'

interface Slot {
  id: string
  start_time: string
  end_time: string
  quota: number
  booked: number
  available: number
}

export default function BookingPage() {
  const [slots, setSlots] = useState<Slot[]>([])
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchSlots()
  }, [date])

  async function fetchSlots() {
    setLoading(true)
    const res = await fetch(`/api/slots?date=${date}`)
    const data = await res.json()
    setSlots(data.slots || [])
    setLoading(false)
  }

  async function handleBook(slotId: string) {
    setBookingId(slotId)
    setMessage(null)

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slot_id: slotId, date }),
    })

    const data = await res.json()
    setBookingId(null)

    if (!res.ok) {
      setMessage({ type: 'error', text: data.error })
      return
    }

    setMessage({ type: 'success', text: 'Booking berhasil! Sampai jumpa di gym 💪' })
    fetchSlots()
  }

  function formatTime(time: string) {
    return time.slice(0, 5)
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Booking Sesi Latihan</h2>
      <p className="text-gray-400 text-sm mb-6">Pilih tanggal dan slot waktu yang tersedia</p>

      {/* Date picker */}
      <div className="mb-6">
        <label className="text-sm text-gray-400 mb-1 block">Tanggal</label>
        <input
          type="date"
          value={date}
          min={today}
          onChange={e => setDate(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500"
        />
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 text-sm rounded-lg px-4 py-3 border ${
          message.type === 'success'
            ? 'bg-green-500/10 border-green-500/30 text-green-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Slots */}
      {loading ? (
        <p className="text-gray-400 text-sm">Memuat slot...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {slots.map(slot => (
            <div
              key={slot.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-white">
                  {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {slot.available} / {slot.quota} tempat tersedia
                </p>
                <div className="mt-2 w-32 bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-orange-500 h-1.5 rounded-full"
                    style={{ width: `${(slot.booked / slot.quota) * 100}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => handleBook(slot.id)}
                disabled={slot.available === 0 || bookingId === slot.id}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  slot.available === 0
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
              >
                {bookingId === slot.id ? '...' : slot.available === 0 ? 'Penuh' : 'Booking'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}