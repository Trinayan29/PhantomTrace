import { NextResponse } from 'next/server'
import { appAuth } from '@/lib/app-auth'

export async function GET() {
  try {
    const user = await appAuth.currentUser()

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const roles = user.roles || []
    const role = user.is_super_admin
      ? 'organisational-head'
      : roles.some((r) => ['admin', 'org_admin', 'security_admin'].includes(r.toLowerCase()))
        ? 'admin'
        : 'viewer'

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name || user.username,
        role,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Unable to retrieve user' }, { status: 500 })
  }
}
