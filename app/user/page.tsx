import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import BookingForm from './BookingForm'
import BookingList, { type Booking } from './BookingList'
import { themeFor } from '@/lib/theme'

// User area: only for logged-in users with role 'user'
export default async function UserPage() {
  const { supabase, user, role } = await getSession()
  if (!user) redirect('/login')
  if (role !== 'user') redirect('/')

  // Two queries in parallel: active services (for the form) and my bookings (RLS returns only mine)
  const [{ data: services }, { data: bookings }] = await Promise.all([
    supabase.from('services').select('id, title, price').eq('active', true).order('title'),
    supabase.from('bookings').select('id, date, status, services(title, price)').order('date'),
  ])

  return (
    <main className="mx-auto max-w-3xl space-y-8 p-6">
      <h1 className={`border-l-4 pl-3 text-2xl font-bold ${themeFor('user').title}`}>My bookings</h1>
      <BookingForm services={services ?? []} />
      <BookingList bookings={(bookings ?? []) as unknown as Booking[]} />
    </main>
  )
}