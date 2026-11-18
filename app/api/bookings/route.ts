import { getSession, jsonError } from '@/lib/auth'

// GET /api/bookings -> bookings visible to the caller
// (RLS returns: own bookings for users, bookings of own services for professionals, all for admins)
export async function GET() {
  const { supabase, user } = await getSession()
  if (!user) return jsonError('Not authenticated', 401)

  const { data, error } = await supabase
    .from('bookings')
    .select('*, services(title, price)')
    .order('date')

  if (error) return jsonError(error.message, 500)
  return Response.json(data)
}

// POST /api/bookings -> create a booking (users only)
export async function POST(request: Request) {
  const { supabase, user, role } = await getSession()
  if (!user) return jsonError('Not authenticated', 401)
  if (role !== 'user') return jsonError('Only users can book services', 403)

  const body = await request.json().catch(() => null)
  const serviceId = typeof body?.service_id === 'string' ? body.service_id : ''
  const date = new Date(body?.date)
  if (!serviceId) return jsonError('service_id is required', 400)
  if (isNaN(date.getTime()) || date <= new Date()) return jsonError('Date must be in the future', 400)

  // Friendly check: the service must exist and be active
  const { data: service } = await supabase
    .from('services').select('id').eq('id', serviceId).eq('active', true).maybeSingle()
  if (!service) return jsonError('This service is not available', 400)

  const { data, error } = await supabase
    .from('bookings')
    .insert({ service_id: serviceId, user_id: user.id, date: date.toISOString() })
    .select()
    .single()

  if (error) return jsonError(error.message, 400)
  return Response.json(data, { status: 201 })
}