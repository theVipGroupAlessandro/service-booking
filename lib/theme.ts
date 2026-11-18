import type { Role } from '@/lib/auth'

type Theme = {
  label: string   // name shown in the navbar badge
  nav: string     // navbar background
  badge: string   // small role badge
  title: string   // page title color + accent border
  button: string  // primary action buttons
}

// Full class names: Tailwind only generates classes it can find written in the code
const ROLE_THEME: Record<Role | 'guest', Theme> = {
  guest: {
    label: 'Guest',
    nav: 'bg-gray-800',
    badge: 'bg-gray-200 text-gray-800',
    title: 'text-gray-900 border-gray-400',
    button: 'bg-gray-800 hover:bg-gray-700',
  },
  user: {
    label: 'User',
    nav: 'bg-blue-700',
    badge: 'bg-blue-100 text-blue-800',
    title: 'text-blue-700 border-blue-600',
    button: 'bg-blue-600 hover:bg-blue-700',
  },
  professional: {
    label: 'Professional',
    nav: 'bg-emerald-700',
    badge: 'bg-emerald-100 text-emerald-800',
    title: 'text-emerald-700 border-emerald-600',
    button: 'bg-emerald-600 hover:bg-emerald-700',
  },
  admin: {
    label: 'Admin',
    nav: 'bg-purple-800',
    badge: 'bg-purple-100 text-purple-800',
    title: 'text-purple-800 border-purple-700',
    button: 'bg-purple-700 hover:bg-purple-800',
  },
}

export function themeFor(role: Role | null): Theme {
  return ROLE_THEME[role ?? 'guest']
}