'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { themeFor } from '@/lib/theme'

type Service = { id: string; title: string; price: number }

// Form to book a service: calls POST /api/bookings
export default function BookingForm({ services }: { services: Service[] }) {
  const router = useRouter()
  const [serviceId, setServiceId] = useState(services[0]?.id ?? '')
  const [date, setDate] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!date) return setError('Please choose a date')

    setLoading(true)
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service_id: serviceId, date: new Date(date).toISOString() }),
    })
    setLoading(false)

    if (!res.ok) {
      const body = await res.json()
      return setError(body.error) // message written in our API, e.g. "Date must be in the future"
    }
    setDate('')
    router.refresh() // reload the server data: the new booking appears in the list
  }

  if (services.length === 0) return <p className="text-gray-500">No services available to book.</p>

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border p-4">
      <h2 className="font-semibold">New booking</h2>
      <select className="w-full rounded border p-2" value={serviceId}
        onChange={(e) => setServiceId(e.target.value)}>
        {services.map((s) => (
          <option key={s.id} value={s.id}>{s.title} – {s.price} zł</option>
        ))}
      </select>
      <input type="datetime-local" className="w-full rounded border p-2"
        value={date} onChange={(e) => setDate(e.target.value)} />
    <button disabled={loading}
        className={`rounded px-4 py-2 text-white disabled:opacity-50 ${themeFor('user').button}`}>
        {loading ? 'Booking...' : 'Book'}
      </button>
      {error && <p className="text-red-600">{error}</p>}
    </form>
  )
}