'use client'

import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  UserRound,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'

type Mode = 'login' | 'signup'

const demos = [
  { label: 'Viewer', email: 'viewer@phantomtrace.demo', color: 'bg-cyan-400' },
  { label: 'Admin', email: 'admin@phantomtrace.demo', color: 'bg-violet-400' },
  { label: 'Org Head', email: 'head@phantomtrace.demo', color: 'bg-amber-400' },
]

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const form = new FormData(event.currentTarget)
    const response = await fetch(`/api/app-auth/${mode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.get('name'),
        email,
        password,
      }),
    })
    const result = (await response.json()) as { error?: string }
    if (!response.ok) {
      setError(result.error || 'Something went wrong. Please try again.')
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="w-full max-w-[430px]">
      <Link
        href="/"
        className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-white/70 transition hover:text-white"
      >
        <span className="grid size-8 place-items-center rounded-lg border border-violet-400/30 bg-violet-400/10 text-violet-300">
          <LockKeyhole size={16} />
        </span>
        PhantomTrace
      </Link>
      <div className="rounded-[28px] border border-white/10 bg-white/[0.055] p-7 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:p-9">
        <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300">
          Secure workspace access
        </span>
        <h1 className="font-[Manrope] text-3xl font-bold tracking-tight text-white">
          {mode === 'login' ? 'Welcome back.' : 'Create your account.'}
        </h1>
        <p className="mt-2 text-sm leading-6 text-white/50">
          {mode === 'login'
            ? 'Sign in to access your security command center.'
            : 'New accounts begin with Viewer permissions.'}
        </p>

        {mode === 'login' && (
          <div className="mt-6 grid grid-cols-3 gap-2">
            {demos.map((demo) => (
              <button
                type="button"
                key={demo.email}
                onClick={() => {
                  setEmail(demo.email)
                  setPassword('Phantom123!')
                }}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-2 py-3 text-left transition hover:border-violet-400/40 hover:bg-violet-400/10"
              >
                <i className={`mb-2 block size-1.5 rounded-full ${demo.color}`} />
                <b className="block text-[11px] text-white">{demo.label}</b>
                <span className="text-[9px] text-white/35">Demo access</span>
              </button>
            ))}
          </div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === 'signup' && (
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold text-white/65">Full name</span>
              <div className="flex h-12 items-center gap-3 rounded-xl border border-white/10 bg-black/15 px-4 focus-within:border-violet-400/60">
                <UserRound size={16} className="text-white/30" />
                <input
                  name="name"
                  required
                  minLength={2}
                  placeholder="Alex Morgan"
                  className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
                />
              </div>
            </label>
          )}
          <label className="block">
            <span className="mb-2 block text-[11px] font-semibold text-white/65">Work email</span>
            <div className="flex h-12 items-center gap-3 rounded-xl border border-white/10 bg-black/15 px-4 focus-within:border-violet-400/60">
              <Mail size={16} className="text-white/30" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
              />
            </div>
          </label>
          <label className="block">
            <span className="mb-2 block text-[11px] font-semibold text-white/65">Password</span>
            <div className="flex h-12 items-center gap-3 rounded-xl border border-white/10 bg-black/15 px-4 focus-within:border-violet-400/60">
              <LockKeyhole size={16} className="text-white/30" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-white/35 hover:text-white"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-xs text-rose-200"
            >
              {error}
            </div>
          )}
          <button
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-sm font-bold text-white shadow-lg shadow-violet-900/30 transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70"
          >
            {loading ? (
              <>
                <LoaderCircle size={17} className="animate-spin" />
                Securing session…
              </>
            ) : (
              <>
                {mode === 'login' ? 'Sign in' : 'Create viewer account'}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
        {mode === 'login' && (
          <p className="mt-3 text-center text-[10px] text-white/35">
            Demo password for all roles: <b className="text-white/55">Phantom123!</b>
          </p>
        )}
        <div className="mt-6 flex items-center justify-center gap-1 text-xs text-white/45">
          {mode === 'login' ? 'New to PhantomTrace?' : 'Already have an account?'}
          <Link
            href={mode === 'login' ? '/signup' : '/login'}
            className="font-semibold text-violet-300 hover:text-violet-200"
          >
            {mode === 'login' ? 'Create account' : 'Sign in'}
          </Link>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-white/30">
        <CheckCircle2 size={13} />
        Encrypted sessions · Role-based access · Audit logged
      </div>
    </div>
  )
}


