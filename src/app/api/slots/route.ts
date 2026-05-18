import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/slots — ambil semua slot (+ jumlah booking per tanggal)
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date') // format: YYYY-MM-DD

  const { data: slots, error } = await supabase
    .from('slots')
    .select('*')
    .order('start_time')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Kalau ada date, hitung jumlah booking aktif per slot
  if (date) {
    const { data: bookings } = await supabase
      .from('bookings')
      .select('slot_id')
      .eq('date', date)
      .eq('status', 'active')

    const bookedCount: Record<string, number> = {}
    bookings?.forEach(b => {
      bookedCount[b.slot_id] = (bookedCount[b.slot_id] || 0) + 1
    })

    const slotsWithAvailability = slots.map(slot => ({
      ...slot,
      booked: bookedCount[slot.id] || 0,
      available: slot.quota - (bookedCount[slot.id] || 0)
    }))

    return NextResponse.json({ slots: slotsWithAvailability })
  }

  return NextResponse.json({ slots })
}

// PATCH /api/slots — update kuota (admin only)
export async function PATCH(request: NextRequest) {
  const supabase = await createClient()

  // Cek apakah admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
  }

  const body = await request.json()
  const { id, quota } = body

  if (!id || quota === undefined || quota < 1) {
    return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('slots')
    .update({ quota })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Kuota berhasil diupdate', slot: data })
}