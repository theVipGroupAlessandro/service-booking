import { getSession, jsonError } from '@/lib/auth'

type Ctx = { params: Promise<{ id: string }> }

// PATCH /api/services/:id -> update a service (owner professional or admin)
export async function PATCH(request: Request, { params }: Ctx) {
  const { id } = await params
  const { supabase, user, role } = await getSession()
  if (!user) return jsonError('Not authenticated', 401)
  if (role !== 'professional' && role !== 'admin') return jsonError('Forbidden', 403)

  const body = await request.json().catch(() => null)
  const updates: Record<string, unknown> = {}
  if (typeof body?.title === 'string') updates.title = body.title.trim()
  if (typeof body?.description === 'string') updates.description = body.description
  if (body?.price !== undefined) {
    const price = Number(body.price)
    if (!Number.isFinite(price) || price < 0) return jsonError('Invalid price', 400)
    updates.price = price
  }
  if (typeof body?.active === 'boolean') updates.active = body.active
  if (Object.keys(updates).length === 0) return jsonError('Nothing to update', 400)

  // RLS makes sure a professional can only update their own services
  const { data, error } = await supabase
    .from('services').update(updates).eq('id', id).select()

  if (error) return jsonError(error.message, 400)
  if (!data?.length) return jsonError('Service not found', 404)
  return Response.json(data[0])
}

// DELETE /api/services/:id -> delete a service (owner professional or admin)
export async function DELETE(_request: Request, { params }: Ctx) {
  const { id } = await params
  const { supabase, user, role } = await getSession()
  if (!user) return jsonError('Not authenticated', 401)
  if (role !== 'professional' && role !== 'admin') return jsonError('Forbidden', 403)

  const { data, error } = await supabase
    .from('services').delete().eq('id', id).select()

  if (error) return jsonError(error.message, 400)
  if (!data?.length) return jsonError('Service not found', 404)
  return new Response(null, { status: 204 })
}