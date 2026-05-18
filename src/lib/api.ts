const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include', // penting untuk cookie/session
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  return res
}