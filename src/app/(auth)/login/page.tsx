'use client'

import { useState } from 'react'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault() // Mencegah refresh halaman saat menekan Enter
    setLoading(true)
    setError('')

    try {
      const res = await apiFetch('/api/auth', {
        method: 'POST',
        body: JSON.stringify({ action: 'login', email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setLoading(false)
        setError(data.error || 'Login gagal')
        return
      }

      if (data.session) {
        const { access_token, refresh_token, expires_in } = data.session
        document.cookie = `sb-access-token=${access_token}; path=/; max-age=${expires_in}; SameSite=Lax;`
        if (refresh_token) {
          document.cookie = `sb-refresh-token=${refresh_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax;`
        }
        localStorage.setItem('sb-access-token', access_token)
      }

      setLoading(false)
      if (data.role === 'admin') {
        window.location.href = '/admin/dashboard'
      } else {
        window.location.href = '/member/dashboard'
      }
      
    } catch (err: any) {
      setLoading(false)
      setError('Terjadi kesalahan jaringan atau server.')
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl p-8 border border-gray-800 relative">

        <Link href="/" className="absolute top-4 right-4 text-gray-500 hover:text-white transition text-xl leading-none">✕</Link>

        <h1 className="text-2xl font-bold text-white mb-1">Selamat datang</h1>
        <p className="text-gray-400 text-sm mb-6">Masuk ke akun GymBook kamu</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {/* Form ini memungkinkan tombol Enter untuk men-trigger Login */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@gmail.com"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500"
              required
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition"
          >
            {loading ? 'Memproses...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Belum punya akun?{' '}
          <Link href="/register" className="text-orange-400 hover:text-orange-300">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </main>
  )
}