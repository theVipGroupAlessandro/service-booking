import { getSession, jsonError } from '@/lib/auth'

type Ctx = { params: Promise<{ id: string }> }

const STATUSES = ['pending', 'confirmed', 'cancelled', 'completed']

// PATCH /api/bookings/:id -> change status and/or date, depending on the role
export async function PATCH(request: Request, { params }: Ctx) {
  const { id } = await params
  const { supabase, user, role } = await getSession()
  if (!user) return jsonError('Not authenticated', 401)

  const body = await request.json().catch(() => null)
  const updates: Record<string, unknown> = {}

  if (body?.status !== undefined) {
    if (!STATUSES.includes(body.status)) return jsonError('Invalid status', 400)
    if (role === 'user' && body.status !== 'cancelled')
      return jsonError('Users can only cancel their bookings', 403)
    if (role === 'professional' && body.status === 'pending')
      return jsonError('Invalid status change', 400)
    updates.status = body.status
  }

  if (body?.date !== undefined) {
    if (role === 'professional') return jsonError('Professionals cannot change the date', 403)
    const date = new Date(body.date)
    if (isNaN(date.getTime()) || date <= new Date()) return jsonError('Date must be in the future', 400)
    updates.date = date.toISOString()
  }

  if (Object.keys(updates).length === 0) return jsonError('Nothing to update', 400)

  const { data, error } = await supabase
    .from('bookings').update(updates).eq('id', id).select()

  if (error) return jsonError(error.message, 400)
  if (!data?.length) return jsonError('Booking not found', 404)
  return Response.json(data[0])
}

// DELETE /api/bookings/:id -> delete a booking (owner user or admin)
export async function DELETE(_request: Request, { params }: Ctx) {
  const { id } = await params
  const { supabase, user, role } = await getSession()
  if (!user) return jsonError('Not authenticated', 401)
  if (role !== 'user' && role !== 'admin') return jsonError('Forbidden', 403)

  const { data, error } = await supabase
    .from('bookings').delete().eq('id', id).select()

  if (error) return jsonError(error.message, 400)
  if (!data?.length) return jsonError('Booking not found', 404)
  return new Response(null, { status: 204 })
}