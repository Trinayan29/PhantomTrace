import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthShell, { Field } from "../components/AuthShell";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";
import { dashboardPath } from "../lib/access";

export default function SignIn() {
  const { login } = useAuth();
  const nav = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      const user = await login({ email: email.trim().toLowerCase(), password });
      nav(from ?? dashboardPath(user.role), { replace: true });
    } catch (err) {
      setError(err instanceof ApiError && err.status === 401 ? "Email or password is incorrect." : err instanceof ApiError ? err.message : "Can't reach the server. Check your connection and try again.");
    } finally { setBusy(false); }
  }

  return (
    <AuthShell title="Sign in" subtitle="Use the email you registered with." footer={<>New to PhantomTrace? <Link to="/signup">Create an account</Link></>}>
      <form onSubmit={submit} noValidate>
        {error && <div className="alert" role="alert">{error}</div>}
        <Field label="Email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field label="Password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn block" disabled={busy || !email || !password}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </AuthShell>
  );
}
