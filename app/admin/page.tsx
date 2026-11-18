import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { UsersTable, ServicesTable, BookingsTable,
  type AdminUser, type AdminService, type AdminBooking } from './adminTables'
import { themeFor } from '@/lib/theme'

// Admin panel: global view of the platform
export default async function AdminPage() {
  const { supabase, user, role } = await getSession()
  if (!user) redirect('/login')
  if (role !== 'admin') redirect('/')

  // The "admins full access" policies make every row visible
  const [{ data: profiles }, { data: services }, { data: bookings }] = await Promise.all([
    supabase.from('profiles').select('id, name, role, created_at').order('created_at'),
    supabase.from('services').select('id, title, price, active, profiles(name)').order('title'),
    supabase.from('bookings')
      .select('id, date, status, services(title), profiles(name)')
      .order('date', { ascending: false }),
  ])

  const users = (profiles ?? []) as AdminUser[]
  const allServices = (services ?? []) as unknown as AdminService[]
  const allBookings = (bookings ?? []) as unknown as AdminBooking[]

  // Simple statistics computed from the data
  const count = <T,>(list: T[], test: (x: T) => boolean) => list.filter(test).length
  const stats = [
    { label: 'Users', value: count(users, (u) => u.role === 'user') },
    { label: 'Professionals', value: count(users, (u) => u.role === 'professional') },
    { label: 'Active services', value: count(allServices, (s) => s.active) },
    { label: 'Inactive services', value: count(allServices, (s) => !s.active) },
    { label: 'Pending bookings', value: count(allBookings, (b) => b.status === 'pending') },
    { label: 'Confirmed bookings', value: count(allBookings, (b) => b.status === 'confirmed') },
  ]

  return (
    <main className="mx-auto max-w-5xl space-y-8 p-6">
      <h1 className={`border-l-4 pl-3 text-2xl font-bold ${themeFor('admin').title}`}>Admin panel</h1>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border bg-gray-50 p-4">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </section>

      <UsersTable users={users} currentUserId={user.id} />
      <ServicesTable services={allServices} />
      <BookingsTable bookings={allBookings} />
    </main>
  )
}