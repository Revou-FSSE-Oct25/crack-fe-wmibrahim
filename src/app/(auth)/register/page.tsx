'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleRegister() {
    setError('')

    if (form.password !== form.confirm) {
      setError('Password tidak cocok')
      return
    }

    if (form.password.length < 6) {
      setError('Password minimal 6 karakter')
      return
    }

    setLoading(true)

    // Mengambil URL Backend dari environment variables
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    try {
      const res = await fetch(`${API_URL}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          email: form.email,
          password: form.password,
          full_name: form.full_name,
          phone: form.phone,
        }),
      })

      const data = await res.json()
      setLoading(false)

      if (!res.ok) {
        setError(data.error || 'Registrasi gagal')
        return
      }

      router.push('/login?registered=true')
    } catch (err) {
      setLoading(false)
      setError('Terjadi kesalahan koneksi ke server.')
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl p-8 border border-gray-800">
        <h1 className="text-2xl font-bold text-white mb-1">Buat akun baru</h1>
        <p className="text-gray-400 text-sm mb-6">Daftar dan mulai booking sekarang</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {[
            { label: 'Nama Lengkap', name: 'full_name', type: 'text', placeholder: 'John Doe' },
            { label: 'Email', name: 'email', type: 'email', placeholder: 'email@gmail.com' },
            { label: 'No. HP', name: 'phone', type: 'tel', placeholder: '08xxxxxxxxxx' },
            { label: 'Password', name: 'password', type: 'password', placeholder: '••••••••' },
            { label: 'Konfirmasi Password', name: 'confirm', type: 'password', placeholder: '••••••••' },
          ].map(field => (
            <div key={field.name}>
              <label className="text-sm text-gray-400 mb-1 block">{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                value={form[field.name as keyof typeof form]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
          ))}

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition"
          >
            {loading ? 'Memproses...' : 'Daftar'}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-orange-400 hover:text-orange-300">
            Masuk sekarang
          </Link>
        </p>
      </div>
    </main>
  )
}