'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import {
  Activity,
  AlertTriangle,
  AppWindow,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleUserRound,
  Clock3,
  Download,
  FileBarChart,
  Filter,
  Focus,
  Gauge,
  GitBranch,
  Grid2X2,
  Hexagon,
  KeyRound,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  LockKeyhole,
  Menu,
  Moon,
  MoreHorizontal,
  Network,
  Plus,
  Radar,
  RefreshCw,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  TriangleAlert,
  X,
  Zap,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'

type Page =
  | 'Overview'
  | 'Applications'
  | 'Access Graph'
  | 'Cyber Attack Detection'
  | 'Risk Analysis'
  | 'Reports'
  | 'Settings'
type Severity = 'Critical' | 'High' | 'Medium' | 'Low'
type AppRecord = {
  id: number
  name: string
  type: string
  owner: string
  users: number
  risk: Severity
  status: 'Active' | 'Review'
}

const navItems: { label: Page; icon: typeof LayoutDashboard }[] = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Applications', icon: AppWindow },
  { label: 'Access Graph', icon: Network },
  { label: 'Cyber Attack Detection', icon: Radar },
  { label: 'Risk Analysis', icon: Gauge },
  { label: 'Reports', icon: FileBarChart },
  { label: 'Settings', icon: Settings },
]

const initialApps: AppRecord[] = [
  {
    id: 1,
    name: 'Salesforce Cloud',
    type: 'SaaS',
    owner: 'Revenue Ops',
    users: 428,
    risk: 'Medium',
    status: 'Active',
  },
  {
    id: 2,
    name: 'AWS Production',
    type: 'Cloud',
    owner: 'Platform',
    users: 86,
    risk: 'High',
    status: 'Review',
  },
  {
    id: 3,
    name: 'GitHub Enterprise',
    type: 'Development',
    owner: 'Engineering',
    users: 312,
    risk: 'Low',
    status: 'Active',
  },
  {
    id: 4,
    name: 'Snowflake',
    type: 'Data',
    owner: 'Data Systems',
    users: 68,
    risk: 'Critical',
    status: 'Review',
  },
  {
    id: 5,
    name: 'Figma Organization',
    type: 'Design',
    owner: 'Product',
    users: 148,
    risk: 'Low',
    status: 'Active',
  },
]

const events = [
  {
    event: 'Impossible travel detected',
    source: 'Okta SSO',
    user: 'm.chen@acme.io',
    time: '2 min ago',
    severity: 'Critical' as Severity,
  },
  {
    event: 'Privilege escalation attempt',
    source: 'AWS Production',
    user: 'svc-deploy',
    time: '18 min ago',
    severity: 'High' as Severity,
  },
  {
    event: 'Unusual data export volume',
    source: 'Snowflake',
    user: 'a.rivera@acme.io',
    time: '43 min ago',
    severity: 'High' as Severity,
  },
  {
    event: 'New OAuth grant',
    source: 'Google Workspace',
    user: 'k.brooks@acme.io',
    time: '1 hr ago',
    severity: 'Medium' as Severity,
  },
  {
    event: 'MFA recovery completed',
    source: 'Okta SSO',
    user: 'r.nguyen@acme.io',
    time: '3 hrs ago',
    severity: 'Low' as Severity,
  },
]

const riskStyle: Record<Severity, string> = {
  Critical: 'badge-critical',
  High: 'badge-high',
  Medium: 'badge-medium',
  Low: 'badge-low',
}

function Badge({ severity, children }: { severity?: Severity; children?: React.ReactNode }) {
  return (
    <span className={`badge ${severity ? riskStyle[severity] : 'badge-neutral'}`}>
      <i />
      {children ?? severity}
    </span>
  )
}

function Logo() {
  return (
    <div className="logo">
      <div className="logo-mark">
        <Hexagon size={25} strokeWidth={1.6} />
        <Focus size={13} />
      </div>
      <span>
        Phantom<span>Trace</span>
      </span>
    </div>
  )
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>
}

function PageHeader({
  eyebrow,
  title,
  copy,
  action,
}: {
  eyebrow: string
  title: string
  copy: string
  action?: React.ReactNode
}) {
  return (
    <header className="page-header reveal">
      <div>
        <span className="eyebrow">
          <Sparkles size={13} />
          {eyebrow}
        </span>
        <h1>{title}</h1>
        <p>{copy}</p>
      </div>
      {action}
    </header>
  )
}

function Button({
  children,
  variant = 'primary',
  onClick,
  type = 'button',
  disabled = false,
}: {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
}) {
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`btn btn-${variant}`}>
      {children}
    </button>
  )
}

function EmptyState({ search }: { search: string }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Search size={24} />
      </div>
      <h3>No applications found</h3>
      <p>Nothing matches “{search}â€. Try a different search term or clear your filters.</p>
    </div>
  )
}

function TrendChart() {
  const bars = [34, 40, 31, 48, 43, 60, 54, 69, 62, 75, 68, 84]
  return (
    <div className="chart-wrap">
      <div className="chart-grid">
        <span />
        <span />
        <span />
        <span />
      </div>
      <svg
        viewBox="0 0 700 210"
        preserveAspectRatio="none"
        role="img"
        aria-label="Security events trend over the last twelve weeks"
      >
        <defs>
          <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8b5cf6" stopOpacity=".34" />
            <stop offset="1" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          className="area"
          d="M0 170 C50 145,75 155,125 140 S200 115,250 128 S325 70,375 92 S450 55,500 74 S575 28,625 50 S670 22,700 30 L700 210 L0 210Z"
        />
        <path
          className="line"
          d="M0 170 C50 145,75 155,125 140 S200 115,250 128 S325 70,375 92 S450 55,500 74 S575 28,625 50 S670 22,700 30"
        />
        {bars.map((v, i) => (
          <circle key={i} cx={(i / 11) * 700} cy={200 - v * 2} r="3.5" className="chart-dot" />
        ))}
      </svg>
      <div className="chart-labels">
        <span>Mar 4</span>
        <span>Mar 18</span>
        <span>Apr 1</span>
        <span>Apr 15</span>
        <span>Apr 29</span>
        <span>May 13</span>
      </div>
    </div>
  )
}

function Donut() {
  return (
    <div className="donut-wrap">
      <div className="donut">
        <div>
          <strong>84</strong>
          <span>Risk score</span>
        </div>
      </div>
      <div className="donut-legend">
        {[
          ['Critical', '4'],
          ['High', '11'],
          ['Medium', '28'],
          ['Low', '62'],
        ].map(([a, b]) => (
          <div key={a}>
            <span className={`legend-dot ${a.toLowerCase()}`} />
            {a}
            <strong>{b}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

function Overview({ onRunScan }: { onRunScan: () => void }) {
  const kpis = [
    {
      label: 'Protected identities',
      value: '12,842',
      trend: '+8.2%',
      icon: ShieldCheck,
      type: 'up',
    },
    { label: 'Open alerts', value: '24', trend: '-12.4%', icon: Bell, type: 'down' },
    { label: 'Risk exposure', value: '18.6%', trend: '-3.1%', icon: Gauge, type: 'down' },
    { label: 'Events analyzed', value: '2.4M', trend: '+18.7%', icon: Activity, type: 'up' },
  ]
  return (
    <div className="page">
      <PageHeader
        eyebrow="Security command center"
        title="Good morning, Alex."
        copy="Your security posture improved by 3.1% since last week."
        action={
          <Button onClick={onRunScan}>
            <Zap size={16} />
            Run security scan
          </Button>
        }
      />
      <div className="kpi-grid stagger">
        {kpis.map(({ label, value, trend, icon: Icon, type }) => (
          <Card className="kpi" key={label}>
            <div className="kpi-top">
              <span className="icon-tile">
                <Icon size={19} />
              </span>
              <span className={`trend ${type}`}>
                {type === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {trend}
              </span>
            </div>
            <strong>{value}</strong>
            <span>{label}</span>
          </Card>
        ))}
      </div>
      <div className="overview-grid">
        <Card className="span-2 reveal">
          <div className="card-head">
            <div>
              <h2>Threat activity</h2>
              <p>Security events across your environment</p>
            </div>
            <button className="select-btn">
              Last 12 weeks <ChevronDown size={14} />
            </button>
          </div>
          <TrendChart />
        </Card>
        <Card className="reveal">
          <div className="card-head">
            <div>
              <h2>Exposure profile</h2>
              <p>Findings by severity</p>
            </div>
            <MoreHorizontal size={18} />
          </div>
          <Donut />
        </Card>
        <Card className="span-2 reveal">
          <div className="card-head">
            <div>
              <h2>Priority alerts</h2>
              <p>Items requiring immediate attention</p>
            </div>
            <button className="text-btn">
              View all <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="alert-list">
            {events.slice(0, 3).map((e) => (
              <div className="alert-row" key={e.event}>
                <span className={`alert-icon ${e.severity.toLowerCase()}`}>
                  <ShieldAlert size={18} />
                </span>
                <div>
                  <strong>{e.event}</strong>
                  <span>
                    {e.source} · {e.user}
                  </span>
                </div>
                <Badge severity={e.severity} />
                <time>{e.time}</time>
              </div>
            ))}
          </div>
        </Card>
        <Card className="reveal posture">
          <div className="card-head">
            <div>
              <h2>Security posture</h2>
              <p>Across 7 frameworks</p>
            </div>
          </div>
          <div className="score-ring">
            <div>
              <strong>92</strong>
              <span>Excellent</span>
            </div>
          </div>
          <div className="progress-line">
            <span>
              <b>SOC 2</b>
              <i>96%</i>
            </span>
            <div>
              <i style={{ width: '96%' }} />
            </div>
          </div>
          <div className="progress-line">
            <span>
              <b>ISO 27001</b>
              <i>88%</i>
            </span>
            <div>
              <i style={{ width: '88%' }} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
}) {
  useEffect(() => {
    const f = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  }, [onClose])
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <div>
            <span className="eyebrow">PhantomTrace console</span>
            <h2>{title}</h2>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Applications({
  apps,
  setApps,
  notify,
}: {
  apps: AppRecord[]
  setApps: React.Dispatch<React.SetStateAction<AppRecord[]>>
  notify: (s: string) => void
}) {
  const [search, setSearch] = useState('')
  const [risk, setRisk] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const filtered = apps.filter(
    (a) =>
      (a.name + a.owner).toLowerCase().includes(search.toLowerCase()) &&
      (risk === 'All' || a.risk === risk),
  )
  const addApp = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setApps((v) => [
      ...v,
      {
        id: Date.now(),
        name: String(fd.get('name')),
        type: String(fd.get('type')),
        owner: String(fd.get('owner')),
        users: Number(fd.get('users')),
        risk: fd.get('risk') as Severity,
        status: 'Active',
      },
    ])
    setShowAdd(false)
    notify('Application connected successfully')
  }
  return (
    <div className="page">
      <PageHeader
        eyebrow="Asset inventory"
        title="Applications"
        copy="Manage connected applications, owners, and access exposure."
        action={
          <Button onClick={() => setShowAdd(true)}>
            <Plus size={16} />
            Connect application
          </Button>
        }
      />
      <Card className="table-card reveal">
        <div className="toolbar">
          <div className="search-box">
            <Search size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search applications or owners…"
              aria-label="Search applications"
            />
            {search && (
              <button onClick={() => setSearch('')}>
                <X size={14} />
              </button>
            )}
          </div>
          <div className="toolbar-actions">
            <select
              value={risk}
              onChange={(e) => setRisk(e.target.value)}
              aria-label="Filter by risk"
            >
              <option>All</option>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setRisk('All')
                setSearch('')
              }}
            >
              <RefreshCw size={15} />
              Clear filters
            </button>
          </div>
        </div>
        <div className="table-meta">
          <span>
            {filtered.length} of {apps.length} applications
          </span>
          <span>
            <i className="live-dot" />
            Live inventory
          </span>
        </div>
        {filtered.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Application</th>
                  <th>Type</th>
                  <th>Owner</th>
                  <th>Users</th>
                  <th>Risk</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <div className="app-name">
                        <span>{app.name.slice(0, 2).toUpperCase()}</span>
                        <strong>{app.name}</strong>
                      </div>
                    </td>
                    <td>{app.type}</td>
                    <td>{app.owner}</td>
                    <td>{app.users}</td>
                    <td>
                      <Badge severity={app.risk} />
                    </td>
                    <td>
                      <span className={`status ${app.status.toLowerCase()}`}>{app.status}</span>
                    </td>
                    <td>
                      <button
                        className="icon-btn"
                        onClick={() => setDeleteId(app.id)}
                        aria-label={`Delete ${app.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState search={search} />
        )}
      </Card>
      {showAdd && (
        <Modal title="Connect an application" onClose={() => setShowAdd(false)}>
          <form className="form-grid" onSubmit={addApp}>
            <label className="full">
              Application name
              <input name="name" placeholder="e.g. Datadog" required />
            </label>
            <label>
              Type
              <select name="type">
                <option>SaaS</option>
                <option>Cloud</option>
                <option>Development</option>
                <option>Data</option>
              </select>
            </label>
            <label>
              Risk
              <select name="risk">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </label>
            <label>
              Owner
              <input name="owner" placeholder="Team name" required />
            </label>
            <label>
              Users
              <input name="users" type="number" min="1" defaultValue="1" required />
            </label>
            <div className="modal-actions full">
              <Button variant="secondary" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Plus size={16} />
                Connect
              </Button>
            </div>
          </form>
        </Modal>
      )}
      {deleteId && (
        <Modal title="Remove application?" onClose={() => setDeleteId(null)}>
          <p className="modal-copy">
            This disconnects the application and removes its access data from active monitoring.
            Historical findings are preserved.
          </p>
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setDeleteId(null)}>
              Keep application
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setApps((a) => a.filter((x) => x.id !== deleteId))
                setDeleteId(null)
                notify('Application removed')
              }}
            >
              <Trash2 size={16} />
              Remove
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}

type GraphNode = {
  id: number
  x: number
  y: number
  label: string
  kind: 'user' | 'app' | 'data'
  risk?: boolean
}
const initialNodes: GraphNode[] = [
  { id: 1, x: 50, y: 44, label: 'Maya Chen', kind: 'user' },
  { id: 2, x: 28, y: 24, label: 'Okta SSO', kind: 'app' },
  { id: 3, x: 73, y: 24, label: 'AWS Prod', kind: 'app', risk: true },
  { id: 4, x: 77, y: 66, label: 'Snowflake', kind: 'data', risk: true },
  { id: 5, x: 25, y: 72, label: 'GitHub', kind: 'app' },
  { id: 6, x: 48, y: 86, label: 'Customer PII', kind: 'data' },
  { id: 7, x: 89, y: 45, label: 'Admin role', kind: 'user', risk: true },
]
const links = [
  [1, 2],
  [1, 3],
  [1, 4],
  [1, 5],
  [4, 6],
  [3, 7],
  [3, 4],
]

function AccessGraph() {
  const [nodes, setNodes] = useState(initialNodes)
  const [zoom, setZoom] = useState(1)
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState<GraphNode | null>(initialNodes[0])
  const graphRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ id: number; ox: number; oy: number } | null>(null)
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!drag.current || !graphRef.current) return
      const r = graphRef.current.getBoundingClientRect()
      setNodes((ns) =>
        ns.map((n) =>
          n.id === drag.current?.id
            ? {
                ...n,
                x: Math.max(
                  5,
                  Math.min(95, ((e.clientX - r.left - drag.current.ox) / r.width) * 100),
                ),
                y: Math.max(
                  8,
                  Math.min(92, ((e.clientY - r.top - drag.current.oy) / r.height) * 100),
                ),
              }
            : n,
        ),
      )
    }
    const up = () => {
      drag.current = null
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
  }, [])
  const visible = nodes.filter((n) => filter === 'All' || n.kind === filter)
  const startDrag = (e: ReactMouseEvent, n: GraphNode) => {
    const el = (e.currentTarget as HTMLElement).getBoundingClientRect()
    drag.current = {
      id: n.id,
      ox: e.clientX - el.left - el.width / 2,
      oy: e.clientY - el.top - el.height / 2,
    }
    setSelected(n)
  }
  return (
    <div className="page">
      <PageHeader
        eyebrow="Identity intelligence"
        title="Access Graph"
        copy="Explore relationships between people, applications, roles, and sensitive data."
      />
      <Card className="graph-card reveal">
        <div className="graph-toolbar">
          <div className="segmented">
            {['All', 'user', 'app', 'data'].map((x) => (
              <button className={filter === x ? 'active' : ''} onClick={() => setFilter(x)} key={x}>
                {x === 'All'
                  ? 'All entities'
                  : x === 'user'
                    ? 'People'
                    : x === 'app'
                      ? 'Applications'
                      : 'Data'}
              </button>
            ))}
          </div>
          <div className="graph-actions">
            <button onClick={() => setZoom((z) => Math.max(0.7, z - 0.1))}>
              <ZoomOut size={16} />
            </button>
            <span>{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}>
              <ZoomIn size={16} />
            </button>
            <button
              onClick={() => {
                setNodes(initialNodes)
                setZoom(1)
              }}
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>
        <div className="graph-layout">
          <div className="graph-canvas" ref={graphRef}>
            <div className="graph-inner" style={{ transform: `scale(${zoom})` }}>
              <svg className="links" width="100%" height="100%">
                {links.map(([a, b], i) => {
                  const n1 = nodes.find((n) => n.id === a)!
                  const n2 = nodes.find((n) => n.id === b)!
                  return visible.includes(n1) && visible.includes(n2) ? (
                    <line
                      key={i}
                      x1={`${n1.x}%`}
                      y1={`${n1.y}%`}
                      x2={`${n2.x}%`}
                      y2={`${n2.y}%`}
                      className={n1.risk || n2.risk ? 'risk-link' : ''}
                    />
                  ) : null
                })}
              </svg>
              {visible.map((n) => (
                <button
                  onMouseDown={(e) => startDrag(e, n)}
                  onClick={() => setSelected(n)}
                  key={n.id}
                  className={`graph-node ${n.kind} ${n.risk ? 'risky' : ''} ${selected?.id === n.id ? 'selected' : ''}`}
                  style={{ left: `${n.x}%`, top: `${n.y}%` }}
                >
                  <span>
                    {n.kind === 'user' ? (
                      <CircleUserRound />
                    ) : n.kind === 'app' ? (
                      <AppWindow />
                    ) : (
                      <LockKeyhole />
                    )}
                  </span>
                  <b>{n.label}</b>
                  {n.risk && (
                    <i>
                      <AlertTriangle size={10} />
                    </i>
                  )}
                </button>
              ))}
            </div>
            <div className="graph-hint">Drag nodes to explore relationships</div>
          </div>
          <aside className="node-panel">
            {selected ? (
              <>
                <span className={`entity-icon ${selected.kind}`}>
                  {selected.kind === 'user' ? (
                    <CircleUserRound />
                  ) : selected.kind === 'app' ? (
                    <AppWindow />
                  ) : (
                    <LockKeyhole />
                  )}
                </span>
                <h2>{selected.label}</h2>
                <p>
                  {selected.kind === 'user'
                    ? 'Human identity'
                    : selected.kind === 'app'
                      ? 'Connected application'
                      : 'Sensitive data resource'}
                </p>
                <div className="node-stats">
                  <div>
                    <span>Relationships</span>
                    <strong>{links.filter((l) => l.includes(selected.id)).length}</strong>
                  </div>
                  <div>
                    <span>Risk level</span>
                    <Badge severity={selected.risk ? 'High' : 'Low'} />
                  </div>
                  <div>
                    <span>Last active</span>
                    <strong>8 min ago</strong>
                  </div>
                </div>
                <Button variant="secondary">
                  <Focus size={15} />
                  Investigate entity
                </Button>
              </>
            ) : (
              <EmptyState search="an entity" />
            )}
          </aside>
        </div>
      </Card>
    </div>
  )
}

function Detection({ notify }: { notify: (s: string) => void }) {
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter] = useState('All')
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      notify('Event analyzed ” elevated risk detected')
      form.reset()
    }, 1300)
  }
  return (
    <div className="page">
      <PageHeader
        eyebrow="Behavior analytics"
        title="Cyber Attack Detection"
        copy="Analyze events, investigate anomalies, and respond to threats in real time."
        action={
          <div className="live-pill">
            <i />
            Detection engine live
          </div>
        }
      />
      <div className="detection-grid">
        <Card className="event-form reveal">
          <div className="card-head">
            <div>
              <h2>Submit a security event</h2>
              <p>Run an event through the PhantomTrace detection engine</p>
            </div>
            <span className="icon-tile">
              <Radar size={19} />
            </span>
          </div>
          <form onSubmit={submit} className="form-stack">
            <label>
              Event type
              <select required>
                <option value="">Select event type</option>
                <option>Authentication</option>
                <option>Data access</option>
                <option>Permission change</option>
                <option>Network activity</option>
              </select>
            </label>
            <label>
              Source application
              <input placeholder="e.g. Okta SSO" required />
            </label>
            <label>
              Event payload
              <textarea
                placeholder='{"user":"alex@company.com","action":"login","ip":"..."}'
                required
              />
            </label>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <RefreshCw className="spin" size={16} />
                  Analyzing event…
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Analyze event
                </>
              )}
            </Button>
          </form>
        </Card>
        <Card className="threat-pulse reveal">
          <div className="card-head">
            <div>
              <h2>Threat pulse</h2>
              <p>Last 24 hours</p>
            </div>
          </div>
          <div className="pulse-visual">
            <div className="pulse-orbit one" />
            <div className="pulse-orbit two" />
            <Radar size={43} />
          </div>
          <strong>1,284,092</strong>
          <span>events analyzed</span>
          <div className="mini-stats">
            <div>
              <b>24</b>
              <span>Suspicious</span>
            </div>
            <div>
              <b>3</b>
              <span>Critical</span>
            </div>
            <div>
              <b>99.98%</b>
              <span>Processed</span>
            </div>
          </div>
        </Card>
      </div>
      <Card className="table-card reveal">
        <div className="card-head event-history-head">
          <div>
            <h2>Event history</h2>
            <p>Recent events and detection outcomes</p>
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>All</option>
            <option>Critical</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
        <div className="event-list">
          {events
            .filter((e) => filter === 'All' || e.severity === filter)
            .map((e) => (
              <div className="event-item" key={e.event}>
                <span className={`event-symbol ${e.severity.toLowerCase()}`}>
                  <TriangleAlert size={17} />
                </span>
                <div>
                  <strong>{e.event}</strong>
                  <span>
                    {e.source} · {e.user}
                  </span>
                </div>
                <Badge severity={e.severity} />
                <time>
                  <Clock3 size={13} />
                  {e.time}
                </time>
                <button className="text-btn">Investigate</button>
              </div>
            ))}
        </div>
      </Card>
    </div>
  )
}

﻿function RiskAnalysis() {
  const [form, setForm] = useState({
    employment_status: 'terminated',
    account_active: true,
    privilege_level: 'admin',
    resource_sensitivity: 'high',
    owner_known: false,
    suspicious_activity: true,
  })
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const update = (key: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const runEvaluation = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/risk-analysis/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || data.detail || 'Risk evaluation failed')
      }
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const risk = result?.risk
  const assistant = result?.assistant

  const score = risk?.score ?? assistant?.risk_score ?? 0
  const level = risk?.level ?? assistant?.risk_level ?? 'Low'

  const severity = (
    ['Critical', 'High', 'Medium', 'Low'].includes(level)
      ? level
      : 'Low'
  ) as Severity

  const evidence = risk?.evidence ?? assistant?.evidence ?? []
  const recommendations =
    risk?.recommendations ?? assistant?.recommendations ?? []

  return (
    <div className="page">
      <PageHeader
        eyebrow="Exposure management"
        title="Risk Analysis"
        copy="Evaluate identity and resource risk using the integrated AI risk engine."
        action={
          <Button onClick={runEvaluation} disabled={loading}>
            <RefreshCw size={15} />
            {loading ? 'Evaluating...' : 'Recalculate risk'}
          </Button>
        }
      />

      <Card className="reveal">
        <div className="card-head">
          <div>
            <h2>Assessment inputs</h2>
            <p>Adjust these attributes and run the risk evaluation</p>
          </div>
        </div>
        <div className="domain-list">
          <label className="domain">
            <span><b>Employment status</b></span>
            <select value={form.employment_status} onChange={(e) => update('employment_status', e.target.value)}>
              <option value="active">Active</option>
              <option value="terminated">Terminated</option>
              <option value="contract_ended">Contract ended</option>
            </select>
          </label>
          <label className="domain">
            <span><b>Privilege level</b></span>
            <select value={form.privilege_level} onChange={(e) => update('privilege_level', e.target.value)}>
              <option value="normal">Normal</option>
              <option value="elevated">Elevated</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </label>
          <label className="domain">
            <span><b>Resource sensitivity</b></span>
            <select value={form.resource_sensitivity} onChange={(e) => update('resource_sensitivity', e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </label>
          <label className="domain">
            <span><b>Account is active</b></span>
            <input type="checkbox" checked={form.account_active} onChange={(e) => update('account_active', e.target.checked)} />
          </label>
          <label className="domain">
            <span><b>Owner is known</b></span>
            <input type="checkbox" checked={form.owner_known} onChange={(e) => update('owner_known', e.target.checked)} />
          </label>
          <label className="domain">
            <span><b>Suspicious activity detected</b></span>
            <input type="checkbox" checked={form.suspicious_activity} onChange={(e) => update('suspicious_activity', e.target.checked)} />
          </label>
        </div>
        <div style={{ marginTop: 20 }}>
          <Button onClick={runEvaluation} disabled={loading}>
            <Gauge size={15} />
            {loading ? 'Analyzing...' : 'Run risk assessment'}
          </Button>
        </div>
        {error && <p role="alert" style={{ color: '#ef6464', marginTop: 14 }}>{error}</p>}
      </Card>

      {result && (
        <>
          <div className="risk-hero">
            <Card className="risk-score reveal">
              <div className="risk-number">
                <span>Calculated risk score</span>
                <strong>{score}<small>/100</small></strong>
                <Badge severity={severity} />
              </div>
              <div className="risk-meter">
                <div className="meter-ticks">
                  {Array.from({ length: 20 }, (_, i) => (
                    <i className={i < Math.ceil(score / 5) ? 'filled' : ''} key={i} />
                  ))}
                </div>
                <p>Generated by the integrated Member 3 risk engine</p>
              </div>
            </Card>
            <Card className="recommendation reveal">
              <span className="icon-tile"><Lightbulb size={20} /></span>
              <div>
                <span className="eyebrow">AI security assistant</span>
                <h2>{assistant?.summary || 'Risk assessment completed'}</h2>
                <p>{assistant?.disclaimer || risk?.disclaimer || 'Rule-based security analysis.'}</p>
              </div>
            </Card>
          </div>

          <div className="risk-layout">
            <Card className="table-card reveal">
              <div className="card-head">
                <div><h2>Risk evidence</h2><p>Factors contributing to this score</p></div>
              </div>
              <div className="risk-list">
                {Array.isArray(evidence) && evidence.length > 0 ? evidence.map((item: any, index: number) => (
                  <div className="risk-row" key={index}>
                    <div className="risk-rank">{index + 1}</div>
                    <div><strong>{typeof item === 'string' ? item : item.description || item.reason || JSON.stringify(item)}</strong></div>
                  </div>
                )) : <p>No evidence returned by the engine.</p>}
              </div>
            </Card>
            <Card className="reveal">
              <div className="card-head">
                <div><h2>Remediation recommendations</h2><p>Suggested next actions</p></div>
              </div>
              <div className="risk-list">
                {Array.isArray(recommendations) && recommendations.length > 0 ? recommendations.map((item: any, index: number) => (
                  <div className="risk-row" key={index}>
                    <div className="risk-rank">{index + 1}</div>
                    <div><strong>{typeof item === 'string' ? item : item.description || item.action || JSON.stringify(item)}</strong></div>
                  </div>
                )) : <p>No recommendations returned.</p>}
              </div>
            </Card>
          </div>
        </>
      )}
      {!result && !error && (
        <Card className="reveal">
          <p>Configure the assessment inputs and select Run risk assessment to retrieve a live result.</p>
        </Card>
      )}
    </div>
  )
}

function Reports({ notify }: { notify: (s: string) => void }) {
  const [tab, setTab] = useState('All findings')
  const exportCsv = () => {
    const csv =
      'Finding,Severity,Status,Owner\\nDormant admin keys,Critical,In progress,Identity Team\\nPublic data exposure,High,Open,Data Platform'
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'phantomtrace-findings.csv'
    a.click()
    notify('CSV report downloaded')
  }
  return (
    <div className="page">
      <PageHeader
        eyebrow="Governance & compliance"
        title="Reports"
        copy="Track findings, remediation progress, and share audit-ready reports."
        action={
          <div className="header-actions">
            <Button variant="secondary" onClick={exportCsv}>
              <Download size={15} />
              Export CSV
            </Button>
            <Button
              onClick={() => {
                window.print()
                notify('Print dialog opened for PDF export')
              }}
            >
              <FileBarChart size={15} />
              Export PDF
            </Button>
          </div>
        }
      />
      <div className="report-stats stagger">
        {[
          ['142', 'Total findings', '+8 this month'],
          ['38', 'In remediation', '27% of total'],
          ['76%', 'SLA compliance', '+4.2% this month'],
          ['12 days', 'Mean time to resolve', '-3 days faster'],
        ].map(([a, b, c]) => (
          <Card key={b}>
            <strong>{a}</strong>
            <span>{b}</span>
            <small>{c}</small>
          </Card>
        ))}
      </div>
      <Card className="table-card reveal">
        <div className="tabs">
          {['All findings', 'Open', 'In progress', 'Resolved'].map((t) => (
            <button className={tab === t ? 'active' : ''} onClick={() => setTab(t)} key={t}>
              {t}
              {t === 'Open' && <span>24</span>}
            </button>
          ))}
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Finding</th>
                <th>Severity</th>
                <th>Owner</th>
                <th>Progress</th>
                <th>Due date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Dormant admin keys', 'Critical', 'Identity Team', 65, 'May 28', 'In progress'],
                ['Public data exposure', 'High', 'Data Platform', 25, 'May 30', 'Open'],
                ['Contractor MFA coverage', 'High', 'IT Operations', 82, 'Jun 4', 'In progress'],
                ['Legacy TLS configurations', 'Medium', 'Platform', 100, 'Completed', 'Resolved'],
              ]
                .filter(
                  (x) =>
                    tab === 'All findings' ||
                    (tab === 'In progress' ? x[5] === 'In progress' : x[5] === tab),
                )
                .map((r) => (
                  <tr key={String(r[0])}>
                    <td>
                      <div className="finding">
                        <span>
                          <ShieldAlert size={16} />
                        </span>
                        <strong>{r[0]}</strong>
                      </div>
                    </td>
                    <td>
                      <Badge severity={r[1] as Severity} />
                    </td>
                    <td>{r[2]}</td>
                    <td>
                      <div className="table-progress">
                        <div>
                          <i style={{ width: `${r[3]}%` }} />
                        </div>
                        <span>{r[3]}%</span>
                      </div>
                    </td>
                    <td>{r[4]}</td>
                    <td>
                      <span className={`status ${String(r[5]).toLowerCase().replace(' ', '-')}`}>
                        {r[5]}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function SettingsPage({
  dark,
  setDark,
  notify,
}: {
  dark: boolean
  setDark: (v: boolean) => void
  notify: (s: string) => void
}) {
  const [email, setEmail] = useState(true)
  const [critical, setCritical] = useState(true)
  return (
    <div className="page narrow">
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        copy="Configure your PhantomTrace experience and notification preferences."
      />
      <Card className="settings-card reveal">
        <div className="settings-section">
          <span className="icon-tile">
            <Sun size={18} />
          </span>
          <div>
            <h2>Appearance</h2>
            <p>Choose how PhantomTrace looks on this device.</p>
            <div className="theme-options">
              <button className={!dark ? 'active' : ''} onClick={() => setDark(false)}>
                <Sun size={20} />
                <span>Light</span>
                {!dark && <Check size={15} />}
              </button>
              <button className={dark ? 'active' : ''} onClick={() => setDark(true)}>
                <Moon size={20} />
                <span>Dark</span>
                {dark && <Check size={15} />}
              </button>
            </div>
          </div>
        </div>
        <div className="settings-section">
          <span className="icon-tile">
            <Bell size={18} />
          </span>
          <div>
            <h2>Notifications</h2>
            <p>Control how and when your team is alerted.</p>
            <div className="toggle-list">
              <label>
                <span>
                  <b>Email digest</b>
                  <small>Daily security posture summary</small>
                </span>
                <input
                  type="checkbox"
                  checked={email}
                  onChange={(e) => setEmail(e.target.checked)}
                />
                <i />
              </label>
              <label>
                <span>
                  <b>Critical alerts</b>
                  <small>Immediate notification for critical threats</small>
                </span>
                <input
                  type="checkbox"
                  checked={critical}
                  onChange={(e) => setCritical(e.target.checked)}
                />
                <i />
              </label>
            </div>
          </div>
        </div>
        <div className="settings-actions">
          <Button onClick={() => notify('Settings saved successfully')}>
            <Check size={16} />
            Save changes
          </Button>
        </div>
      </Card>
    </div>
  )
}

function CommandSearch({
  onClose,
  navigate,
  items,
}: {
  onClose: () => void
  navigate: (page: Page) => void
  items: typeof navItems
}) {
  const [query, setQuery] = useState('')
  const results = items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
  return (
    <Modal title="Search PhantomTrace" onClose={onClose}>
      <div className="command-search">
        <div className="search-box">
          <Search size={17} />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages and security modules…"
          />
        </div>
        <span className="command-label">Navigate to</span>
        <div className="command-results">
          {results.map(({ label, icon: Icon }) => (
            <button key={label} onClick={() => navigate(label)}>
              <span>
                <Icon size={17} />
              </span>
              <b>{label}</b>
              <small>Open module</small>
              <ArrowUpRight size={14} />
            </button>
          ))}
          {!results.length && <EmptyState search={query} />}
        </div>
      </div>
    </Modal>
  )
}

type DashboardUser = {
  name: string
  email: string
  role: 'viewer' | 'admin' | 'organisational-head'
}

const roleLabels: Record<DashboardUser['role'], string> = {
  viewer: 'Viewer',
  admin: 'Security Admin',
  'organisational-head': 'Organisational Head',
}

export default function PhantomDashboard({ user }: { user: DashboardUser }) {
  const [page, setPage] = useState<Page>('Overview')
  const [dark, setDark] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [apps, setApps] = useState(initialApps)
  const [toast, setToast] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const permittedNav = useMemo(() => {
    if (user.role === 'organisational-head') return navItems
    if (user.role === 'admin')
      return navItems.filter((item) =>
        ['Overview', 'Applications', 'Access Graph', 'Cyber Attack Detection', 'Settings'].includes(
          item.label,
        ),
      )
    return navItems.filter((item) => ['Overview', 'Access Graph', 'Reports'].includes(item.label))
  }, [user.role])
  const notify = (s: string) => {
    setToast(s)
    setTimeout(() => setToast(''), 2800)
  }
  const navigate = (p: Page) => {
    setMobileOpen(false)
    setSearchOpen(false)
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  }, [dark])
  useEffect(() => {
    const shortcut = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((value) => !value)
      }
    }
    window.addEventListener('keydown', shortcut)
    return () => window.removeEventListener('keydown', shortcut)
  }, [])
  const content = useMemo(() => {
    if (page === 'Overview') return <Overview onRunScan={() => navigate('Cyber Attack Detection')} />
    if (page === 'Applications')
      return <Applications apps={apps} setApps={setApps} notify={notify} />
    if (page === 'Access Graph') return <AccessGraph />
    if (page === 'Cyber Attack Detection') return <Detection notify={notify} />
    if (page === 'Risk Analysis') return <RiskAnalysis />
    if (page === 'Reports') return <Reports notify={notify} />
    return <SettingsPage dark={dark} setDark={setDark} notify={notify} />
  }, [page, apps, dark, navigate])
  return (
    <div className="app-shell">
      <div className="ambient a1" />
      <div className="ambient a2" />
      {mobileOpen && (
        <button
          className="nav-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
        />
      )}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <Logo />
        <nav aria-label="Primary navigation">
          {permittedNav.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => navigate(label)}
              className={page === label ? 'active' : ''}
            >
              <Icon size={18} />
              <span>{label}</span>
              {page === label && <i />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="pro-card">
            <div>
              <Sparkles size={16} />
              Enterprise plan
            </div>
            <p>All systems protected</p>
            <span>
              <i />
              Operational
            </span>
          </div>
          <button
            className="user-card"
            onClick={async () => {
              await fetch('/api/app-auth/logout', { method: 'POST' })
              window.location.href = '/'
            }}
          >
            <span className="avatar">
              {user.name
                .split(' ')
                .map((part) => part[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </span>
            <span>
              <b>{user.name}</b>
              <small>{roleLabels[user.role]}</small>
            </span>
            <LogOut size={16} />
          </button>
        </div>
      </aside>
      <div className="main-wrap">
        <header className="topbar">
          <button
            className="mobile-menu icon-btn"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>
          <div className="breadcrumb">
            <Shield size={16} />
            <span>Acme Corporation</span>
            <span>/</span>
            <b>{page}</b>
          </div>
          <div className="top-actions">
            <button className="search-trigger" onClick={() => setSearchOpen(true)}>
              <Search size={16} />
              <span>Search anything…</span>
              <kbd>⌘ K</kbd>
            </button>
            <button
              className="icon-btn"
              onClick={() => notify('No new notifications')}
              aria-label="Notifications"
            >
              <Bell size={18} />
              <i className="notification-dot" />
            </button>
            <button
              className="icon-btn"
              onClick={() => setDark(!dark)}
              aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>
        <main>
          {loading ? (
            <div className="loading-page">
              <div className="loader" />
              <span>Loading intelligence…</span>
            </div>
          ) : (
            content
          )}
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} />
          <span>{toast}</span>
          <button onClick={() => setToast('')}>
            <X size={14} />
          </button>
        </div>
      )}
      {searchOpen && (
        <CommandSearch
          onClose={() => setSearchOpen(false)}
          navigate={navigate}
          items={permittedNav}
        />
      )}
    </div>
  )
}

