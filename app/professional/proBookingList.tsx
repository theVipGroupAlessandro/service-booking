'use client'

import { useRouter } from 'next/navigation'

export type ProBooking = {
  id: string
  date: string
  status: string
  services: { title: string } | null
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-200 text-gray-600',
  completed: 'bg-blue-100 text-blue-800',
}

// Bookings of the professional's services: confirm, complete or reject
export default function ProBookingList({ bookings }: { bookings: ProBooking[] }) {
  const router = useRouter()

  async function setStatus(id: string, status: string) {
    const res = await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) return alert((await res.json()).error)
    router.refresh()
  }

  if (bookings.length === 0) return <p className="text-gray-500">No bookings yet.</p>

  return (
    <ul className="space-y-3">
      {bookings.map((b) => (
        <li key={b.id} className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="font-semibold">{b.services?.title}</p>
            <p className="text-sm text-gray-600">{new Date(b.date).toLocaleString()}</p>
            <span className={`mt-1 inline-block rounded px-2 py-0.5 text-xs ${STATUS_STYLES[b.status]}`}>
              {b.status}
            </span>
          </div>
          <div className="flex gap-2">
            {b.status === 'pending' && (
              <>
                <button onClick={() => setStatus(b.id, 'confirmed')}
                  className="rounded bg-green-600 px-3 py-1 text-sm text-white">Confirm</button>
                <button onClick={() => setStatus(b.id, 'cancelled')}
                  className="rounded border px-3 py-1 text-sm">Reject</button>
              </>
            )}
            {b.status === 'confirmed' && (
              <button onClick={() => setStatus(b.id, 'completed')}
                className="rounded bg-blue-600 px-3 py-1 text-sm text-white">Mark completed</button>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}