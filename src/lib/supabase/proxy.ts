import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Gunakan getClaims() bukan getSession() di proxy
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims
  const { pathname } = request.nextUrl

  // Redirect ke login kalau belum login
  if (!user && (pathname.startsWith('/member') || pathname.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Cek role admin
  if (user && pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.sub)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/member/dashboard', request.url))
    }
  }

  // Redirect kalau sudah login, tidak perlu ke login/register lagi
  if (user && (pathname === '/login' || pathname === '/register')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.sub)
      .single()

    if (profile?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    return NextResponse.redirect(new URL('/member/dashboard', request.url))
  }

  return supabaseResponse
}