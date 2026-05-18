'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'

interface Slot {
  id: string
  start_time: string
  end_time: string
  quota: number
}

export default function AdminSchedulePage() {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<string | null>(null)
  const [editQuota, setEditQuota] = useState<number>(0)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => { fetchSlots() }, [])

  async function fetchSlots() {
    const res = await apiFetch('/api/slots')
    const data = await res.json()
    setSlots(data.slots || [])
    setLoading(false)
  }

  async function handleSave(id: string) {
    setSaving(true)
    setMessage(null)

    const res = await apiFetch('/api/slots', {
      method: 'PATCH',
      body: JSON.stringify({ id, quota: editQuota }),
    })

    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      setMessage({ type: 'error', text: data.error })
      return
    }

    setMessage({ type: 'success', text: 'Kuota berhasil diupdate!' })
    setEditId(null)
    fetchSlots()
  }

  function formatTime(time: string) { return time.slice(0, 5) }

  if (loading) return <div className="text-gray-400 text-sm">Memuat data...</div>

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Jadwal & Kuota</h2>
      <p className="text-gray-400 text-sm mb-6">Atur kuota member per slot waktu latihan</p>

      {message && (
        <div className={`mb-6 text-sm rounded-lg px-4 py-3 border ${
          message.type === 'success'
            ? 'bg-green-500/10 border-green-500/30 text-green-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {slots.map(slot => (
          <div key={slot.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white text-lg">
                  {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                </p>
                {editId === slot.id ? (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="number"
                      min={1}
                      value={editQuota}
                      onChange={e => setEditQuota(Number(e.target.value))}
                      className="w-20 bg-gray-800 border border-gray-600 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-orange-500"
                    />
                    <span className="text-gray-400 text-sm">orang</span>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm mt-1">
                    Kuota: <span className="text-orange-400 font-semibold">{slot.quota} orang</span>
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                {editId === slot.id ? (
                  <>
                    <button
                      onClick={() => handleSave(slot.id)}
                      disabled={saving}
                      className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg transition"
                    >
                      {saving ? '...' : 'Simpan'}
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition"
                    >
                      Batal
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setEditId(slot.id); setEditQuota(slot.quota) }}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}