import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/bookings — ambil booking (member: milik sendiri, admin: semua)
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  let query = supabase
    .from('bookings')
    .select(`
      *,
      profiles (id, full_name, phone),
      slots (id, start_time, end_time, quota)
    `)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  // Member hanya lihat booking sendiri
  if (profile?.role !== 'admin') {
    query = query.eq('user_id', user.id)
  }

  if (date) {
    query = query.eq('date', date)
  }

  const { data: bookings, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ bookings })
}

// POST /api/bookings — buat booking baru (member only)
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'member') {
    return NextResponse.json({ error: 'Hanya member yang bisa booking' }, { status: 403 })
  }

  const body = await request.json()
  const { slot_id, date } = body

  if (!slot_id || !date) {
    return NextResponse.json({ error: 'slot_id dan date wajib diisi' }, { status: 400 })
  }

  // Cek apakah tanggal tidak di masa lalu
  const today = new Date().toISOString().split('T')[0]
  if (date < today) {
    return NextResponse.json({ error: 'Tidak bisa booking di tanggal yang sudah lewat' }, { status: 400 })
  }

  // Cek kuota via database function
  const { data: isAvailable, error: quotaError } = await supabase
    .rpc('check_slot_quota', { p_slot_id: slot_id, p_date: date })

  if (quotaError) {
    return NextResponse.json({ error: quotaError.message }, { status: 500 })
  }

  if (!isAvailable) {
    return NextResponse.json({ error: 'Slot sudah penuh' }, { status: 409 })
  }

  // Buat booking
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({ user_id: user.id, slot_id, date, status: 'active' })
    .select(`
      *,
      slots (id, start_time, end_time)
    `)
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Kamu sudah booking slot ini' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Booking berhasil', booking }, { status: 201 })
}