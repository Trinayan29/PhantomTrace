import PhantomDashboard from '@/components/dashboard/PhantomDashboard'
import { appAuth } from '@/lib/app-auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const user = await appAuth.currentUser()

  if (!user) redirect('/login')

  const roles = user.roles || []
  const role = user.is_super_admin
    ? 'organisational-head'
    : roles.some((r) => ['admin', 'org_admin', 'security_admin'].includes(r.toLowerCase()))
      ? 'admin'
      : 'viewer'

  return (
    <PhantomDashboard
      user={{
        name: user.full_name || user.username,
        email: user.email,
        role,
      }}
    />
  )
}
