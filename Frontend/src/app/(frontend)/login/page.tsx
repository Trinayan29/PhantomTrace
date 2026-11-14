import { AuthForm } from '@/components/auth/AuthForm'
import { appAuth } from '@/lib/app-auth'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  if (await appAuth.currentUser()) redirect('/dashboard')
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#090a12] px-5 py-12">
      <div className="pointer-events-none absolute left-[-10%] top-[-20%] size-[520px] rounded-full bg-violet-600/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-25%] right-[-10%] size-[480px] rounded-full bg-cyan-500/10 blur-[130px]" />
      <AuthForm mode="login" />
    </main>
  )
}
