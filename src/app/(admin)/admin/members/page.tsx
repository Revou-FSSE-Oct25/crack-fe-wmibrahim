'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'

interface Member {
  id: string
  full_name: string
  phone: string | null
  created_at: string
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => { fetchMembers() }, [])

  async function fetchMembers() {
    const res = await apiFetch('/api/members')
    const data = await res.json()
    setMembers(data.members || [])
    setLoading(false)
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus member "${name}"? Semua booking-nya juga akan terhapus.`)) return

    setDeletingId(id)
    const res = await apiFetch(`/api/members/${id}`, { method: 'DELETE' })
    const data = await res.json()
    setDeletingId(null)

    if (!res.ok) {
      setMessage({ type: 'error', text: data.error })
      return
    }

    setMessage({ type: 'success', text: 'Member berhasil dihapus' })
    fetchMembers()
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  if (loading) return <div className="text-gray-400 text-sm">Memuat data...</div>

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Manajemen Member</h2>
      <p className="text-gray-400 text-sm mb-6">Kelola semua member yang terdaftar</p>

      {message && (
        <div className={`mb-6 text-sm rounded-lg px-4 py-3 border ${
          message.type === 'success'
            ? 'bg-green-500/10 border-green-500/30 text-green-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <p className="text-sm text-gray-400">
            Total: <span className="text-white font-semibold">{members.length} member</span>
          </p>
        </div>
        {members.length === 0 ? (
          <p className="text-gray-500 text-sm p-6">Belum ada member terdaftar.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-left">
                <th className="px-6 py-4 font-medium">Nama</th>
                <th className="px-6 py-4 font-medium">No. HP</th>
                <th className="px-6 py-4 font-medium">Terdaftar</th>
                <th className="px-6 py-4 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, i) => (
                <tr key={member.id} className={`border-b border-gray-800 last:border-0 ${i % 2 === 0 ? '' : 'bg-gray-800/30'}`}>
                  <td className="px-6 py-4 text-white font-medium">{member.full_name}</td>
                  <td className="px-6 py-4 text-gray-300">{member.phone || '-'}</td>
                  <td className="px-6 py-4 text-gray-300">{formatDate(member.created_at)}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(member.id, member.full_name)}
                      disabled={deletingId === member.id}
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs rounded-lg transition"
                    >
                      {deletingId === member.id ? '...' : 'Hapus'}
                    </button>
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