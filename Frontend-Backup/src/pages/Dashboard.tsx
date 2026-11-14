import { NavLink, Route, Routes } from "react-router-dom";
import Logo from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";
import { NAV, dashboardPath } from "../lib/access";
import { ROLE_LABEL, type RoleName } from "../lib/types";
import RiskAnalysis from "./RiskAnalysis";
import Reports from "./Reports";

function Overview({ role }: { role: RoleName }) {
  const { user } = useAuth();

  return (
    <>
      <h1>Welcome, {user?.full_name.split(" ")[0]}</h1>
      <p className="muted">
        {role === "super_admin"
          ? "You have access across all organizations."
          : `You're signed in as ${ROLE_LABEL[role]}.`}
      </p>

      {user && user.permissions.length > 0 && (
        <>
          <h2>Your permissions</h2>
          <ul className="chips">
            {user.permissions.map((permission) => (
              <li key={permission}>{permission}</li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

const Placeholder = ({ label }: { label: string }) => (
  <>
    <h1>{label}</h1>
    <p className="muted">
      This section isn't connected yet. It will load from the API once the endpoint is agreed.
    </p>
  </>
);

export default function Dashboard({ role }: { role: RoleName }) {
  const { user, logout } = useAuth();
  const base = dashboardPath(role);

  return (
    <div className="shell">
      <aside className="side">
        <Logo />
        <nav aria-label="Dashboard">
          {NAV[role].map((item) => (
            <NavLink
              key={item.to}
              end={item.to === ""}
              to={item.to ? `${base}/${item.to}` : base}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="main">
        <header className="topbar inner">
          <span className="badge">{ROLE_LABEL[role]}</span>
          <div className="row gap">
            <ThemeToggle />
            <span className="muted small">{user?.email}</span>
            <button className="btn ghost" onClick={() => logout()}>
              Sign out
            </button>
          </div>
        </header>

        <main className="content">
          <Routes>
            <Route index element={<Overview role={role} />} />
            <Route path="risk-analysis" element={<RiskAnalysis />} />
            <Route path="reports" element={<Reports />} />

            {NAV[role]
              .filter((item) => item.to && item.to !== "risk-analysis")
              .map((item) => (
                <Route
                  key={item.to}
                  path={item.to}
                  element={<Placeholder label={item.label} />}
                />
              ))}
          </Routes>
        </main>
      </div>
    </div>
  );
}
