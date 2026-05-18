import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// PATCH /api/bookings/[id] — cancel booking
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Ambil data booking + slot
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('*, slots(start_time)')
    .eq('id', id)
    .single()

  if (bookingError || !booking) {
    return NextResponse.json({ error: 'Booking tidak ditemukan' }, { status: 404 })
  }

  // Cek apakah booking sudah dibatalkan
  if (booking.status === 'cancelled') {
    return NextResponse.json({ error: 'Booking sudah dibatalkan' }, { status: 400 })
  }

  // Kalau bukan admin, cek apakah booking milik sendiri & batas waktu cancel
  if (profile?.role !== 'admin') {
    // Pastikan booking milik sendiri
    if (booking.user_id !== user.id) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
    }

    // Cek batas waktu cancel (minimal 1 jam sebelum sesi mulai)
    const bookingDate = booking.date // format: YYYY-MM-DD
    const startTime = booking.slots.start_time // format: HH:MM:SS
    const [hours, minutes] = startTime.split(':').map(Number)

    const sessionStart = new Date(`${bookingDate}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`)
    const oneHourBefore = new Date(sessionStart.getTime() - 60 * 60 * 1000)
    const now = new Date()

    if (now >= oneHourBefore) {
      return NextResponse.json({
        error: `Tidak bisa cancel. Batas cancel adalah 1 jam sebelum sesi dimulai (sebelum ${oneHourBefore.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})`
      }, { status: 400 })
    }
  }

  // Cancel booking
  const { data: updated, error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Booking berhasil dibatalkan', booking: updated })
}