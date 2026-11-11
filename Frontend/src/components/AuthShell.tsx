import type { ReactNode } from "react";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

export default function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="auth-page">
      <header className="topbar"><Logo /><ThemeToggle /></header>
      <main className="auth-card">
        <h1>{title}</h1>
        <p className="muted">{subtitle}</p>
        {children}
        <p className="muted small foot">{footer}</p>
      </main>
    </div>
  );
}

export function Field(props: { label: string; error?: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const { label, error, hint, id, ...rest } = props;
  const fid = id ?? rest.name;
  return (
    <div className="field">
      <label htmlFor={fid}>{label}</label>
      <input id={fid} aria-invalid={!!error} aria-describedby={error ? `${fid}-e` : hint ? `${fid}-h` : undefined} {...rest} />
      {error ? <span id={`${fid}-e`} className="err">{error}</span> : hint ? <span id={`${fid}-h`} className="hint">{hint}</span> : null}
    </div>
  );
}
