'use client'

import { useRouter } from 'next/navigation'

export type AdminUser = { id: string; name: string | null; role: string; created_at: string }
export type AdminService = {
  id: string; title: string; price: number; active: boolean
  profiles: { name: string | null } | null
}
export type AdminBooking = {
  id: string; date: string; status: string
  services: { title: string } | null
  profiles: { name: string | null } | null
}

// Small helper: sends a JSON request to our API and refreshes the page on success
function useApi() {
  const router = useRouter()
  return async (method: string, url: string, body?: unknown) => {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) return alert((await res.json()).error)
    router.refresh()
  }
}

const th = 'border-b p-2 text-left text-sm text-gray-500'
const td = 'border-b p-2 text-sm'

export function UsersTable({ users, currentUserId }: { users: AdminUser[]; currentUserId: string }) {
  const api = useApi()
  return (
    <section>
      <h2 className="mb-2 text-xl font-semibold">Users</h2>
      <table className="w-full">
        <thead><tr><th className={th}>Name</th><th className={th}>Role</th><th className={th}>Joined</th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td className={td}>{u.name ?? '—'}</td>
              <td className={td}>
                <select className="rounded border p-1" value={u.role}
                  disabled={u.id === currentUserId}
                  onChange={(e) => api('PATCH', `/api/profiles/${u.id}`, { role: e.target.value })}>
                  <option value="user">user</option>
                  <option value="professional">professional</option>
                  <option value="admin">admin</option>
                </select>
              </td>
              <td className={td}>{new Date(u.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export function ServicesTable({ services }: { services: AdminService[] }) {
  const api = useApi()
  return (
    <section>
      <h2 className="mb-2 text-xl font-semibold">Services</h2>
      <table className="w-full">
        <thead><tr>
          <th className={th}>Title</th><th className={th}>Professional</th>
          <th className={th}>Price</th><th className={th}>Status</th><th className={th}></th>
        </tr></thead>
        <tbody>
          {services.map((s) => (
            <tr key={s.id}>
              <td className={td}>{s.title}</td>
              <td className={td}>{s.profiles?.name ?? '—'}</td>
              <td className={td}>{s.price} zł</td>
              <td className={td}>{s.active ? 'active' : 'inactive'}</td>
              <td className={`${td} space-x-2 text-right`}>
                <button className="rounded border px-2 py-1"
                  onClick={() => api('PATCH', `/api/services/${s.id}`, { active: !s.active })}>
                  {s.active ? 'Deactivate' : 'Activate'}
                </button>
                <button className="rounded border border-red-300 px-2 py-1 text-red-600"
                  onClick={() => confirm('Delete this service?') && api('DELETE', `/api/services/${s.id}`)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export function BookingsTable({ bookings }: { bookings: AdminBooking[] }) {
  const api = useApi()
  return (
    <section>
      <h2 className="mb-2 text-xl font-semibold">Bookings</h2>
      <table className="w-full">
        <thead><tr>
          <th className={th}>Service</th><th className={th}>Customer</th>
          <th className={th}>Date</th><th className={th}>Status</th><th className={th}></th>
        </tr></thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id}>
              <td className={td}>{b.services?.title}</td>
              <td className={td}>{b.profiles?.name ?? '—'}</td>
              <td className={td}>{new Date(b.date).toLocaleString()}</td>
              <td className={td}>
                <select className="rounded border p-1" value={b.status}
                  onChange={(e) => api('PATCH', `/api/bookings/${b.id}`, { status: e.target.value })}>
                  <option value="pending">pending</option>
                  <option value="confirmed">confirmed</option>
                  <option value="cancelled">cancelled</option>
                  <option value="completed">completed</option>
                </select>
              </td>
              <td className={`${td} text-right`}>
                <button className="rounded border border-red-300 px-2 py-1 text-red-600"
                  onClick={() => confirm('Delete this booking?') && api('DELETE', `/api/bookings/${b.id}`)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}