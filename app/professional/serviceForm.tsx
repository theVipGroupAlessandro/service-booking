'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { themeFor } from '@/lib/theme'

// Form to create a new service: calls POST /api/services
export default function ServiceForm() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, price: Number(price) }),
    })
    if (!res.ok) return setError((await res.json()).error)
    setTitle(''); setDescription(''); setPrice('')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg border p-4 sm:grid-cols-4">
      <input className="rounded border p-2 sm:col-span-1" placeholder="Title"
        value={title} onChange={(e) => setTitle(e.target.value)} />
      <input className="rounded border p-2 sm:col-span-2" placeholder="Description"
        value={description} onChange={(e) => setDescription(e.target.value)} />
      <input className="rounded border p-2" type="number" min="0" step="0.01" placeholder="Price"
        value={price} onChange={(e) => setPrice(e.target.value)} />
      <button className={`rounded px-4 py-2 text-white sm:col-span-4 ${themeFor('professional').button}`}>
        Add service
        </button>
      {error && <p className="text-red-600 sm:col-span-4">{error}</p>}
    </form>
  )
}