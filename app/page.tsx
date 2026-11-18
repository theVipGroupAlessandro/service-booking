import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { themeFor } from '@/lib/theme'

// Public page: list of active services, with a different action for each role
export default async function HomePage() {
  const { supabase, user, role } = await getSession()
  const theme = themeFor(role)

  const { data: services } = await supabase
    .from('services')
    .select('id, title, description, price, professional_id')
    .eq('active', true)
    .order('title')

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className={`mb-6 border-l-4 pl-3 text-2xl font-bold ${theme.title}`}>Available services</h1>

      {!services?.length && <p className="text-gray-500">No services available.</p>}

      <ul className="grid gap-4 sm:grid-cols-2">
        {services?.map((s) => (
          <li key={s.id} className="flex flex-col rounded-lg border p-4">
            <h2 className="font-semibold">{s.title}</h2>
            {s.description && <p className="text-sm text-gray-600">{s.description}</p>}
            <p className="mt-2 font-medium">{s.price} zł</p>

            <div className="mt-auto pt-3">
              {!user && (
                <Link href="/login" className="text-sm text-gray-600 underline">Log in to book</Link>
              )}
              {role === 'user' && (
                <Link href="/user" className={`inline-block rounded px-3 py-1 text-sm text-white ${theme.button}`}>
                  Book
                </Link>
              )}
              {role === 'professional' && s.professional_id === user?.id && (
                <span className={`rounded px-2 py-0.5 text-xs ${theme.badge}`}>Your service</span>
              )}
              {role === 'admin' && (
                <Link href="/admin" className={`inline-block rounded px-3 py-1 text-sm text-white ${theme.button}`}>
                  Manage
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}