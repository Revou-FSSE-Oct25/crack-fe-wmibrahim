'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'

interface Slot {
  id: string
  start_time: string
  end_time: string
  quota: number
  booked: number
  available: number
}

interface Booking {
  id: string
  slot_id: string
  date: string
  status: string
  slots: { start_time: string; end_time: string }
}

export default function BookingPage() {
  const [slots, setSlots] = useState<Slot[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => { fetchData() }, [date])

  async function fetchData() {
    setLoading(true)
    const [slotsRes, bookingsRes] = await Promise.all([
      apiFetch(`/api/slots?date=${date}`),
      apiFetch(`/api/bookings?date=${date}`),
    ])
    const slotsData = await slotsRes.json()
    const bookingsData = await bookingsRes.json()
    setSlots(slotsData.slots || [])
    setBookings(bookingsData.bookings?.filter((b: Booking) => b.status === 'active') || [])
    setLoading(false)
  }

  function getActiveBooking(slotId: string): Booking | undefined {
    return bookings.find(b => b.slot_id === slotId)
  }

  function canCancel(slot: Slot): boolean {
    const [hours, minutes] = slot.start_time.split(':').map(Number)
    const sessionStart = new Date(`${date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`)
    const oneHourBefore = new Date(sessionStart.getTime() - 60 * 60 * 1000)
    return new Date() < oneHourBefore
  }

  function isSlotBookable(slot: Slot): boolean {
    const today = new Date().toISOString().split('T')[0]
    if (date !== today) return true

    const [startHours, startMinutes] = slot.start_time.split(':').map(Number)
    const slotStart = new Date()
    slotStart.setHours(startHours, startMinutes, 0, 0)

    return new Date() < slotStart
  }

  async function handleBook(slotId: string) {
    setProcessingId(slotId)
    setMessage(null)

    const res = await apiFetch('/api/bookings', {
      method: 'POST',
      body: JSON.stringify({ slot_id: slotId, date }),
    })

    const data = await res.json()
    setProcessingId(null)

    if (!res.ok) {
      setMessage({ type: 'error', text: data.error })
      return
    }

    setMessage({ type: 'success', text: 'Booking successful! See you at the gym 💪' })
    fetchData()
  }

  async function handleCancel(bookingId: string) {
    if (!confirm('Are you sure you want to cancel this booking?')) return

    setProcessingId(bookingId)
    setMessage(null)

    const res = await apiFetch(`/api/bookings/${bookingId}`, { method: 'PATCH' })
    const data = await res.json()
    setProcessingId(null)

    if (!res.ok) {
      setMessage({ type: 'error', text: data.error })
      return
    }

    setMessage({ type: 'success', text: 'Booking successfully cancelled' })
    fetchData()
  }

  function formatTime(time: string) { return time.slice(0, 5) }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Book a Session</h2>
      <p className="text-gray-400 text-sm mb-6">Select a date and available time slot</p>

      <div className="mb-6">
        <label className="text-sm text-gray-400 mb-1 block">Date</label>
        <input
          type="date"
          value={date}
          min={today}
          onChange={e => setDate(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500"
        />
      </div>

      {message && (
        <div className={`mb-6 text-sm rounded-lg px-4 py-3 border ${
          message.type === 'success'
            ? 'bg-green-500/10 border-green-500/30 text-green-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <p className="text-gray-400 text-sm">Loading slots...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {slots.map(slot => {
            const activeBooking = getActiveBooking(slot.id)
            const isBooked = !!activeBooking
            const cancellable = isBooked && canCancel(slot)

            return (
              <div
                key={slot.id}
                className={`bg-gray-900 border rounded-xl p-5 flex items-center justify-between ${
                  isBooked ? 'border-orange-500/40' : 'border-gray-800'
                }`}
              >
                <div>
                  <p className="font-semibold text-white">
                    {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {slot.available} / {slot.quota} spots available
                  </p>
                  <div className="mt-2 w-32 bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-orange-500 h-1.5 rounded-full"
                      style={{ width: `${(slot.booked / slot.quota) * 100}%` }}
                    />
                  </div>
                  {isBooked && (
                    <p className="text-xs text-orange-400 mt-2 font-medium">✓ Booked</p>
                  )}
                </div>

                <div className="flex flex-col gap-2 items-end">
                  {isBooked ? (
                    cancellable ? (
                      <button
                        onClick={() => handleCancel(activeBooking.id)}
                        disabled={processingId === activeBooking.id}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-sm rounded-lg transition"
                      >
                        {processingId === activeBooking.id ? '...' : 'Cancel'}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-600 text-right">Cannot be<br/>cancelled</span>
                    )
                  ) : !isSlotBookable(slot) ? (
                    <span className="text-xs text-gray-600 text-right">Session<br/>started</span>
                  ) : (
                    <button
                      onClick={() => handleBook(slot.id)}
                      disabled={slot.available === 0 || processingId === slot.id}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                        slot.available === 0
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-orange-500 hover:bg-orange-600 text-white'
                      }`}
                    >
                      {processingId === slot.id ? '...' : slot.available === 0 ? 'Full' : 'Book'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}