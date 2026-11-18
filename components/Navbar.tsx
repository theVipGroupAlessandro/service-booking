import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { themeFor } from '@/lib/theme'

// Server Component: color, links and badge depend on the user's role
export default async function Navbar() {
  const { user, role } = await getSession()
  const theme = themeFor(role)

  return (
    <nav className={`flex items-center gap-4 p-4 text-white ${theme.nav}`}>
      <Link href="/" className="font-bold">ServiceBooking</Link>
      <Link href="/" className="hover:underline">Services</Link>
      {role === 'user' && <Link href="/user" className="hover:underline">My bookings</Link>}
      {role === 'professional' && <Link href="/professional" className="hover:underline">Dashboard</Link>}
      {role === 'admin' && <Link href="/admin" className="hover:underline">Admin panel</Link>}

      <div className="ml-auto flex items-center gap-3">
        {user ? (
          <>
            <span className="hidden text-sm opacity-90 sm:inline">{user.email}</span>
            <span className={`rounded px-2 py-0.5 text-xs font-semibold ${theme.badge}`}>{theme.label}</span>
            <form action="/auth/logout" method="post">
              <button className="rounded border border-white/60 px-3 py-1 text-sm hover:bg-white/10">Logout</button>
            </form>
          </>
        ) : (
          <Link href="/login" className="rounded bg-white px-3 py-1 text-sm text-gray-900">Login</Link>
        )}
      </div>
    </nav>
  )
}