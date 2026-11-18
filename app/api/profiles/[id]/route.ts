import { getSession, jsonError } from '@/lib/auth'

type Ctx = { params: Promise<{ id: string }> }

const ROLES = ['user', 'professional', 'admin']

// PATCH /api/profiles/:id -> change a user's role (admins only)
export async function PATCH(request: Request, { params }: Ctx) {
  const { id } = await params
  const { supabase, user, role } = await getSession()
  if (!user) return jsonError('Not authenticated', 401)
  if (role !== 'admin') return jsonError('Admins only', 403)
  if (id === user.id) return jsonError('You cannot change your own role', 400)

  const body = await request.json().catch(() => null)
  if (!ROLES.includes(body?.role)) return jsonError('Invalid role', 400)

  // RLS: the "admins full access" policy allows this update
  const { data, error } = await supabase
    .from('profiles').update({ role: body.role }).eq('id', id).select()

  if (error) return jsonError(error.message, 400)
  if (!data?.length) return jsonError('User not found', 404)
  return Response.json(data[0])
}