const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function apiFetch(path: string, options?: RequestInit) {
  // 1. Ambil token dari LocalStorage
  let token = typeof window !== 'undefined' ? localStorage.getItem('sb-access-token') : null

  // 2. Fallback: Curi dari Cookie jika LocalStorage kosong
  if (!token && typeof document !== 'undefined') {
    const cookieStr = document.cookie.split('; ').find(row => row.startsWith('sb-access-token='))
    if (cookieStr) {
      token = cookieStr.split('=')[1]
    }
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include', // Tetap dipertahankan untuk jaga-jaga
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}), // Inject token secara paksa di sini!
      ...options?.headers,
    },
  })
  
  return res
}