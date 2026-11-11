import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";
import { ROLE_LABEL, ROLES } from "../lib/types";

const ROLE_BLURB: Record<(typeof ROLES)[number], string> = {
  super_admin: "Sees and manages every organization on the platform.",
  organization_admin: "Manages members and roles inside their own organization.",
  security_analyst: "Investigates alerts and follows traces across events.",
  auditor: "Reviews activity logs and exports compliance reports.",
  viewer: "Read-only access to dashboards and reports.",
};

function TraceGraphic() {
  return (
    <svg className="trace" viewBox="0 0 560 360" role="img" aria-label="A trace linking a login, a file access and an export event">
      <path className="trace-line" d="M40 300 C120 300 120 180 200 180 S300 90 380 90 S470 200 520 60" />
      {[[40, 300, "login"], [200, 180, "file.read"], [380, 90, "role.change"], [520, 60, "export"]].map(([x, y, t]) => (
        <g key={t as string}>
          <circle cx={x as number} cy={y as number} r="9" className="node" />
          <text x={(x as number) + 4} y={(y as number) + 30} className="node-label" textAnchor={x === 520 ? "end" : "start"}>{t}</text>
        </g>
      ))}
      <circle cx="380" cy="90" r="20" className="pulse" />
    </svg>
  );
}

export default function Landing() {
  return (
    <>
      <header className="topbar">
        <Logo />
        <nav className="row gap">
          <ThemeToggle />
          <Link className="btn ghost" to="/signin">Sign in</Link>
          <Link className="btn" to="/signup">Create account</Link>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div>
            <h1>Follow every action back to the person and the moment it happened.</h1>
            <p className="lead">
              PhantomTrace links logins, permission changes and data access into one trace per organization,
              so your team can investigate incidents and prove what happened.
            </p>
            <div className="row gap">
              <Link className="btn lg" to="/signup">Create your organization</Link>
              <Link className="btn ghost lg" to="/signin">Sign in</Link>
            </div>
          </div>
          <TraceGraphic />
        </section>

        <section className="section" aria-labelledby="roles-h">
          <h2 id="roles-h">Five roles, one clear boundary</h2>
          <p className="muted measure">Every account gets a role. Your dashboard shows only what that role is allowed to do.</p>
          <dl className="roles">
            {ROLES.map((r) => (
              <div key={r} className="role-row">
                <dt>{ROLE_LABEL[r]}</dt>
                <dd>{ROLE_BLURB[r]}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="section split">
          <div>
            <h2>Each organization stays separate</h2>
            <p className="muted measure">
              Members belong to an organization through a membership, and permissions come from their role.
              Organization admins manage their own people. Only a super admin sees across organizations.
            </p>
          </div>
          <div>
            <h2>Sessions that renew themselves</h2>
            <p className="muted measure">
              Short-lived access tokens refresh in the background, and signing out ends the session on the server.
            </p>
          </div>
        </section>
      </main>

      <footer className="footer"><span>© {new Date().getFullYear()} PhantomTrace</span></footer>
    </>
  );
}
