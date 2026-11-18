'use client'

import { useRouter } from 'next/navigation'

export type Service = {
  id: string
  title: string
  description: string | null
  price: number
  active: boolean
}

// Professional's services: toggle active / delete
export default function ServiceList({ services }: { services: Service[] }) {
  const router = useRouter()

  async function toggleActive(s: Service) {
    const res = await fetch(`/api/services/${s.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !s.active }),
    })
    if (!res.ok) return alert((await res.json()).error)
    router.refresh()
  }

  async function deleteService(id: string) {
    if (!confirm('Delete this service? Its bookings will be deleted too.')) return
    const res = await fetch(`/api/services/${id}`, { method: 'DELETE' })
    if (!res.ok) return alert((await res.json()).error)
    router.refresh()
  }

  if (services.length === 0) return <p className="text-gray-500">You have no services yet.</p>

  return (
    <ul className="space-y-3">
      {services.map((s) => (
        <li key={s.id}
          className={`flex items-center justify-between rounded-lg border p-4 ${s.active ? '' : 'opacity-60'}`}>
          <div>
            <p className="font-semibold">{s.title} – {s.price} zł</p>
            {s.description && <p className="text-sm text-gray-600">{s.description}</p>}
            <span className={`mt-1 inline-block rounded px-2 py-0.5 text-xs ${
              s.active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
              {s.active ? 'active' : 'inactive'}
            </span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => toggleActive(s)} className="rounded border px-3 py-1 text-sm">
              {s.active ? 'Deactivate' : 'Activate'}
            </button>
            <button onClick={() => deleteService(s.id)}
              className="rounded border border-red-300 px-3 py-1 text-sm text-red-600">Delete</button>
          </div>
        </li>
      ))}
    </ul>
  )
}