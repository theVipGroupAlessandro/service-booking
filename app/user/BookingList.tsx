'use client'

import { useRouter } from 'next/navigation'

export type Booking = {
  id: string
  date: string
  status: string
  services: { title: string; price: number } | null
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-200 text-gray-600',
  completed: 'bg-blue-100 text-blue-800',
}


// List of the user's bookings with cancel / delete actions
export default function BookingList({ bookings }: { bookings: Booking[] }) {
  const router = useRouter()

  async function cancelBooking(id: string) {
    const res = await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    })
    if (!res.ok) return alert((await res.json()).error)
    router.refresh()
  }

  async function deleteBooking(id: string) {
    if (!confirm('Delete this booking?')) return
    const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' })
    if (!res.ok) return alert((await res.json()).error)
    router.refresh()
  }

  if (bookings.length === 0) return <p className="text-gray-500">You have no bookings yet.</p>

  return (
    <ul className="space-y-3">
      {bookings.map((b) => (
        <li key={b.id} className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="font-semibold">{b.services?.title ?? 'Service no longer available'}</p>
            <p className="text-sm text-gray-600">{new Date(b.date).toLocaleString()}</p>
            <span className={`mt-1 inline-block rounded px-2 py-0.5 text-xs ${STATUS_STYLES[b.status]}`}>
              {b.status}
            </span>
          </div>
          <div className="flex gap-2">
            {(b.status === 'pending' || b.status === 'confirmed') && (
              <button onClick={() => cancelBooking(b.id)}
                className="rounded border px-3 py-1 text-sm">Cancel</button>
            )}
            <button onClick={() => deleteBooking(b.id)}
              className="rounded border border-red-300 px-3 py-1 text-sm text-red-600">Delete</button>
          </div>
        </li>
      ))}
    </ul>
  )
}