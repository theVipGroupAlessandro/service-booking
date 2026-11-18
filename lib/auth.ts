import { createClient } from '@/lib/supabase/server'

export type Role = 'user' | 'professional' | 'admin'

// Returns the Supabase client, the logged-in user (or null) and their role
export async function getSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { supabase, user: null, role: null }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return { supabase, user, role: (profile?.role ?? null) as Role | null }
}

// Small helper to return JSON errors with a status code
export function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status })
}