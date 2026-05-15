export type Role = 'member' | 'admin'
export type BookingStatus = 'active' | 'cancelled'

export interface Profile {
  id: string
  full_name: string
  phone: string | null
  role: Role
  created_at: string
}

export interface Slot {
  id: string
  start_time: string
  end_time: string
  quota: number
  created_at: string
}

export interface Booking {
  id: string
  user_id: string
  slot_id: string
  date: string
  status: BookingStatus
  created_at: string
  profiles?: Profile
  slots?: Slot
}