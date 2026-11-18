import { getSession, jsonError } from '@/lib/auth'

// GET /api/services            -> active services (public)
// GET /api/services?mine=true  -> the professional's own services
// GET /api/services?all=true   -> all services (admin only)
export async function GET(request: Request) {
  const { supabase, user, role } = await getSession()
  const params = new URL(request.url).searchParams

  let query = supabase.from('services').select('*').order('title')

  if (params.get('mine') === 'true') {
    if (!user) return jsonError('Not authenticated', 401)
    if (role !== 'professional') return jsonError('Only professionals have services', 403)
    query = query.eq('professional_id', user.id)
  } else if (params.get('all') === 'true') {
    if (!user) return jsonError('Not authenticated', 401)
    if (role !== 'admin') return jsonError('Admins only', 403)
  } else {
    query = query.eq('active', true)
  }

  const { data, error } = await query
  if (error) return jsonError(error.message, 500)
  return Response.json(data)
}

// POST /api/services -> create a service (professionals only)
export async function POST(request: Request) {
  const { supabase, user, role } = await getSession()
  if (!user) return jsonError('Not authenticated', 401)
  if (role !== 'professional') return jsonError('Only professionals can create services', 403)

  const body = await request.json().catch(() => null)
  const title = typeof body?.title === 'string' ? body.title.trim() : ''
  const price = Number(body?.price)
  if (!title) return jsonError('Title is required', 400)
  if (!Number.isFinite(price) || price < 0) return jsonError('Price must be a positive number', 400)

  const { data, error } = await supabase
    .from('services')
    .insert({
      title,
      description: typeof body?.description === 'string' ? body.description : null,
      price,
      professional_id: user.id, // always the caller, never taken from the body
    })
    .select()
    .single()

  if (error) return jsonError(error.message, 400)
  return Response.json(data, { status: 201 })
}