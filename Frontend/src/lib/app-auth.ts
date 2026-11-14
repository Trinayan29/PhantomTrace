import 'server-only'
import { cookies } from 'next/headers'

const API = process.env.DJANGO_API_URL || 'http://127.0.0.1:8000'

export type AppUser = {
  id: string
  full_name: string
  username: string
  email: string
  roles: string[]
  permissions: string[]
  is_super_admin: boolean
  memberships: unknown[]
}

export const appAuth = {
  async currentUser(): Promise<AppUser | null> {
    const token = (await cookies()).get('access_token')?.value
    if (!token) return null

    const response = await fetch(`${API}/api/v1/auth/me/`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })

    if (!response.ok) return null
    return response.json()
  },

  async login(identifier: string, password: string) {
    const response = await fetch(`${API}/api/v1/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
      cache: 'no-store',
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Login failed')
    return data
  },
}
