'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return setError(error.message)
    router.push('/')
    router.refresh()
  }

  return (
    <main className="mx-auto mt-20 max-w-sm p-4">
      <h1 className="mb-4 text-2xl font-bold">Login</h1>
      <form onSubmit={handleLogin} className="flex flex-col gap-3">
        <input className="rounded border p-2" type="email" placeholder="Email"
          value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="rounded border p-2" type="password" placeholder="Password"
          value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="rounded bg-black p-2 text-white">Sign in</button>
        {error && <p className="text-red-600">{error}</p>}
      </form>
    </main>
  )
}