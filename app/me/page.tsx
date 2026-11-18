import { createClient } from '@/lib/supabase/server'

// Server Component: reads the logged-in user and their profile
export default async function MePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <p className="p-4">Not logged in</p>

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, role')
    .eq('id', user.id)
    .single()

  return (
    <main className="p-4">
      <p>Email: {user.email}</p>
      <p>Name: {profile?.name}</p>
      <p>Role: {profile?.role}</p>
    </main>
  )
}