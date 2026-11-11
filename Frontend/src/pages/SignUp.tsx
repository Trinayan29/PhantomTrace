import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell, { Field } from "../components/AuthShell";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";
import { dashboardPath } from "../lib/access";
import { ROLE_LABEL, type SignupRole } from "../lib/types";

const JOIN_ROLES: SignupRole[] = ["security_analyst", "auditor", "viewer"];
type Errors = Partial<Record<"full_name" | "email" | "password" | "confirm" | "org", string>>;

export default function SignUp() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<"create" | "join">("create");
  const [f, setF] = useState({ full_name: "", email: "", password: "", confirm: "", orgName: "", orgSlug: "" });
  const [role, setRole] = useState<SignupRole>("viewer");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  function validate(): Errors {
    const e: Errors = {};
    if (f.full_name.trim().length < 2) e.full_name = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter a valid email address.";
    if (f.password.length < 10) e.password = "Use at least 10 characters.";
    else if (!/[A-Za-z]/.test(f.password) || !/\d/.test(f.password)) e.password = "Include at least one letter and one number.";
    if (f.confirm !== f.password) e.confirm = "Passwords don't match.";
    if (mode === "create" && f.orgName.trim().length < 2) e.org = "Enter your organization's name.";
    if (mode === "join" && !/^[a-z0-9-]{2,}$/.test(f.orgSlug.trim().toLowerCase())) e.org = "Enter the organization code your admin gave you.";
    return e;
  }

  async function submit(ev: FormEvent) {
    ev.preventDefault();
    const v = validate(); setErrors(v); setFormError("");
    if (Object.keys(v).length) return;
    setBusy(true);
    try {
      const user = await register({
        full_name: f.full_name.trim(),
        email: f.email.trim().toLowerCase(),
        password: f.password,
        organization: mode === "create" ? { mode, name: f.orgName.trim() } : { mode, slug: f.orgSlug.trim().toLowerCase() },
        role: mode === "create" ? "organization_admin" : role,
      });
      nav(dashboardPath(user.role), { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors({ ...(err.fields.email && { email: err.fields.email }), ...(err.fields.password && { password: err.fields.password }), ...((err.fields.organization || err.fields.slug) && { org: err.fields.organization ?? err.fields.slug }) });
        setFormError(err.message);
      } else setFormError("Can't reach the server. Check your connection and try again.");
    } finally { setBusy(false); }
  }

  return (
    <AuthShell title="Create your account" subtitle="Start a new organization or join an existing one." footer={<>Already registered? <Link to="/signin">Sign in</Link></>}>
      <form onSubmit={submit} noValidate>
        {formError && <div className="alert" role="alert">{formError}</div>}
        <Field label="Full name" name="full_name" autoComplete="name" value={f.full_name} onChange={set("full_name")} error={errors.full_name} />
        <Field label="Email" name="email" type="email" autoComplete="email" value={f.email} onChange={set("email")} error={errors.email} />
        <Field label="Password" name="password" type="password" autoComplete="new-password" value={f.password} onChange={set("password")} error={errors.password} hint="At least 10 characters, with a letter and a number." />
        <Field label="Confirm password" name="confirm" type="password" autoComplete="new-password" value={f.confirm} onChange={set("confirm")} error={errors.confirm} />

        <fieldset className="field">
          <legend>Organization</legend>
          <div className="seg wide" role="radiogroup" aria-label="Organization choice">
            <button type="button" role="radio" aria-checked={mode === "create"} className={mode === "create" ? "on" : ""} onClick={() => setMode("create")}>Create new</button>
            <button type="button" role="radio" aria-checked={mode === "join"} className={mode === "join" ? "on" : ""} onClick={() => setMode("join")}>Join existing</button>
          </div>
        </fieldset>

        {mode === "create" ? (
          <Field label="Organization name" name="orgName" value={f.orgName} onChange={set("orgName")} error={errors.org} hint={`You'll be the ${ROLE_LABEL.organization_admin}.`} />
        ) : (
          <>
            <Field label="Organization code" name="orgSlug" value={f.orgSlug} onChange={set("orgSlug")} error={errors.org} hint="Ask your organization admin for this code." />
            <div className="field">
              <label htmlFor="role">Role</label>
              <select id="role" value={role} onChange={(e) => setRole(e.target.value as SignupRole)}>
                {JOIN_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
              </select>
              <span className="hint">Your admin confirms your final role.</span>
            </div>
          </>
        )}
        <button className="btn block" disabled={busy}>{busy ? "Creating account…" : "Create account"}</button>
      </form>
    </AuthShell>
  );
}
