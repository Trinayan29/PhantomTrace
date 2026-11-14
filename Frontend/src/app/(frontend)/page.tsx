import {
  Activity,
  ArrowRight,
  Check,
  GitBranch,
  LockKeyhole,
  Radar,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-static'

const capabilities = [
  {
    icon: Radar,
    title: 'Detect threats earlier',
    copy: 'Behavioral analytics correlates identity, cloud, and application events in real time.',
  },
  {
    icon: GitBranch,
    title: 'See every access path',
    copy: 'Interactive relationship graphs expose hidden privileges before attackers find them.',
  },
  {
    icon: ShieldCheck,
    title: 'Prioritize what matters',
    copy: 'Context-aware risk scoring turns thousands of findings into a clear remediation plan.',
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#090a12] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_75%_0%,rgba(124,92,246,.16),transparent_28%),radial-gradient(circle_at_10%_70%,rgba(31,180,200,.08),transparent_25%)]" />
      <nav className="relative z-20 mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-[Manrope] text-lg font-extrabold tracking-tight"
        >
          <span className="grid size-9 place-items-center rounded-xl border border-violet-400/25 bg-violet-400/10 text-violet-300">
            <LockKeyhole size={18} />
          </span>
          Phantom<span className="-ml-2 text-violet-300">Trace</span>
        </Link>
        <div className="hidden items-center gap-8 text-xs font-semibold text-white/55 md:flex">
          <a href="#platform" className="transition hover:text-white">
            Platform
          </a>
          <a href="#roles" className="transition hover:text-white">
            Access
          </a>
          <a href="#security" className="transition hover:text-white">
            Security
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2.5 text-xs font-bold text-white/65 transition hover:text-white"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#11111b] transition hover:-translate-y-0.5"
          >
            Start free
          </Link>
        </div>
      </nav>

      <section className="relative mx-auto grid min-h-[720px] max-w-7xl items-center gap-14 px-5 pb-24 pt-16 lg:grid-cols-[1fr_1.05fr] lg:px-8 lg:pt-10">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-violet-200">
            <Sparkles size={12} /> Autonomous exposure intelligence
          </div>
          <h1 className="max-w-2xl font-[Manrope] text-5xl font-bold leading-[1.02] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
            Find the threat{' '}
            <span className="bg-gradient-to-r from-violet-300 via-violet-400 to-cyan-300 bg-clip-text text-transparent">
              before it finds you.
            </span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-white/50">
            PhantomTrace unifies identity, access, and threat telemetry into one command center—so
            every team sees the risk, understands the path, and acts with confidence.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-6 text-sm font-bold shadow-xl shadow-violet-950 transition hover:-translate-y-0.5"
            >
              Enter command center <ArrowRight size={16} />
            </Link>
            <a
              href="#platform"
              className="flex h-12 items-center rounded-xl border border-white/10 bg-white/[0.04] px-6 text-sm font-bold text-white/75 backdrop-blur transition hover:border-white/20 hover:text-white"
            >
              Explore platform
            </a>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-[11px] text-white/40">
            {['SOC 2 aligned', 'Real-time monitoring', 'Role-based control'].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <Check size={13} className="text-emerald-400" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="absolute -inset-10 rounded-full bg-violet-600/10 blur-3xl" />
          <div className="relative rotate-[1.5deg] rounded-[24px] border border-white/10 bg-white/[0.055] p-3 shadow-2xl shadow-black/50 backdrop-blur-xl transition duration-500 hover:rotate-0 hover:scale-[1.01]">
            <div className="rounded-[18px] border border-white/[0.07] bg-[#10111c] p-5">
              <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-violet-300">
                    Live environment
                  </span>
                  <h2 className="mt-1 font-[Manrope] text-lg font-bold">Security overview</h2>
                </div>
                <span className="flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1.5 text-[9px] font-bold text-emerald-300">
                  <i className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  Protected
                </span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  ['12,842', 'Identities'],
                  ['24', 'Open alerts'],
                  ['92', 'Posture score'],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/[0.07] bg-white/[0.035] p-4"
                  >
                    <b className="font-[Manrope] text-xl">{value}</b>
                    <span className="mt-1 block text-[9px] text-white/35">{label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-5">
                <div className="mb-7 flex items-center justify-between">
                  <div>
                    <b className="text-xs">Threat activity</b>
                    <span className="mt-1 block text-[9px] text-white/35">Last 12 weeks</span>
                  </div>
                  <Activity size={18} className="text-violet-300" />
                </div>
                <svg
                  viewBox="0 0 500 120"
                  className="h-32 w-full overflow-visible"
                  aria-label="Rising security event chart"
                >
                  <defs>
                    <linearGradient id="heroChart" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#8b6cfb" stopOpacity=".35" />
                      <stop offset="1" stopColor="#8b6cfb" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 100 C50 90 65 82 100 88 S165 55 210 68 S285 38 330 48 S415 14 500 22 L500 120 L0 120Z"
                    fill="url(#heroChart)"
                  />
                  <path
                    d="M0 100 C50 90 65 82 100 88 S165 55 210 68 S285 38 330 48 S415 14 500 22"
                    fill="none"
                    stroke="#9477ff"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 rounded-xl border border-rose-400/15 bg-rose-400/[0.06] p-4">
                  <span className="grid size-8 place-items-center rounded-lg bg-rose-400/10 text-rose-300">
                    <Zap size={15} />
                  </span>
                  <div>
                    <b className="block text-[10px]">Impossible travel</b>
                    <span className="text-[8px] text-white/35">Detected 2m ago</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
                  <span className="grid size-8 place-items-center rounded-lg bg-violet-400/10 text-violet-300">
                    <ShieldCheck size={15} />
                  </span>
                  <div>
                    <b className="block text-[10px]">92% compliant</b>
                    <span className="text-[8px] text-white/35">Across 7 frameworks</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="platform"
        className="relative border-y border-white/[0.07] bg-white/[0.025] py-24"
      >
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300">
            One connected platform
          </span>
          <div className="mt-4 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h2 className="max-w-xl font-[Manrope] text-3xl font-bold tracking-tight sm:text-4xl">
              From noisy signals to decisive action.
            </h2>
            <p className="max-w-md text-sm leading-6 text-white/45">
              Trace every relationship and prioritize remediation using context your teams can
              trust.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {capabilities.map(({ icon: Icon, title, copy }, index) => (
              <article
                key={title}
                className="group rounded-2xl border border-white/[0.08] bg-white/[0.035] p-7 transition duration-300 hover:-translate-y-1 hover:border-violet-400/25 hover:bg-violet-400/[0.06]"
              >
                <span className="mb-10 grid size-11 place-items-center rounded-xl bg-violet-400/10 text-violet-300 transition group-hover:scale-110">
                  <Icon size={20} />
                </span>
                <span className="text-[10px] font-bold text-white/25">0{index + 1}</span>
                <h3 className="mt-2 font-[Manrope] text-lg font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/40">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="roles" className="relative mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="rounded-[28px] border border-white/[0.08] bg-gradient-to-br from-violet-500/10 to-transparent p-7 sm:p-12">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300">
                Designed for every decision
              </span>
              <h2 className="mt-4 font-[Manrope] text-3xl font-bold">
                The right view for every role.
              </h2>
              <p className="mt-4 text-sm leading-6 text-white/45">
                Permissions are enforced by account role, keeping sensitive operational controls in
                the right hands.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['Viewer', 'Read-only posture, graphs, and reports'],
                ['Admin', 'Operational response and application control'],
                ['Organisational Head', 'Full strategic risk and governance view'],
              ].map(([role, copy]) => (
                <div key={role} className="rounded-2xl border border-white/[0.08] bg-black/15 p-5">
                  <span className="mb-5 block size-2 rounded-full bg-violet-400 shadow-[0_0_10px_#8b5cf6]" />
                  <b className="text-xs">{role}</b>
                  <p className="mt-2 text-[10px] leading-5 text-white/35">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer id="security" className="relative border-t border-white/[0.07] px-5 py-9">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-[10px] text-white/30 sm:flex-row lg:px-3">
          <span>© 2026 PhantomTrace. Security intelligence, clarified.</span>
          <div className="flex gap-6">
            <span>Privacy-first</span>
            <span>Encrypted by design</span>
            <span>Always monitoring</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
