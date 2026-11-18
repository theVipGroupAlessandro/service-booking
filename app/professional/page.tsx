import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import ServiceForm from './serviceForm'
import ServiceList, { type Service } from './serviceList'
import ProBookingList, { type ProBooking } from './proBookingList'
import { themeFor } from '@/lib/theme'

// Professional dashboard: manage own services and view their bookings
export default async function ProfessionalPage() {
  const { supabase, user, role } = await getSession()
  if (!user) redirect('/login')
  if (role !== 'professional') redirect('/')

  const [{ data: services }, { data: bookings }] = await Promise.all([
    // Own services, including inactive ones
    supabase.from('services').select('id, title, description, price, active')
      .eq('professional_id', user.id).order('title'),
    // RLS returns only the bookings of this professional's services
    supabase.from('bookings').select('id, date, status, services(title)').order('date'),
  ])

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6">
        <h1 className={`border-l-4 pl-3 text-2xl font-bold ${themeFor('professional').title}`}>Professional dashboard</h1>    
        <div className="grid gap-8 lg:grid-cols-2">
            <section className="space-y-4">
                <h2 className="text-xl font-semibold">My services</h2>
                <ServiceForm />
                <ServiceList services={(services ?? []) as Service[]} />
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Bookings received</h2>
                {/* Supabase returns a single related service (many-to-one), not an array */}
                <ProBookingList bookings={(bookings ?? []) as unknown as ProBooking[]} />
            </section>
         </div>
    </main>
  )
}