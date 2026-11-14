import { useState, type FormEvent, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell, { Field } from "../components/AuthShell";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";
import { dashboardPath } from "../lib/access";

type Errors = Partial<
  Record<"full_name" | "username" | "email" | "password" | "confirm_password", string>
>;

export default function SignUp() {
  const { register } = useAuth();
  const nav = useNavigate();

  const [f, setF] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const set =
    (key: keyof typeof f) => (e: ChangeEvent<HTMLInputElement>) =>
      setF((previous) => ({ ...previous, [key]: e.target.value }));

  function validate(): Errors {
    const e: Errors = {};

    if (f.full_name.trim().length < 2) {
      e.full_name = "Enter your full name.";
    }

    if (!/^[a-zA-Z0-9_.-]{3,100}$/.test(f.username.trim())) {
      e.username = "Use at least 3 letters, numbers, dots, or underscores.";
    }

    if (!/^\S+@\S+\.\S+$/.test(f.email)) {
      e.email = "Enter a valid email address.";
    }

    if (f.password.length < 10) {
      e.password = "Use at least 10 characters.";
    } else if (!/[A-Za-z]/.test(f.password) || !/\d/.test(f.password)) {
      e.password = "Include at least one letter and one number.";
    }

    if (f.confirm_password !== f.password) {
      e.confirm_password = "Passwords do not match.";
    }

    return e;
  }

  async function submit(ev: FormEvent) {
    ev.preventDefault();

    const validation = validate();
    setErrors(validation);
    setFormError("");

    if (Object.keys(validation).length) return;

    setBusy(true);

    try {
      const user = await register({
        full_name: f.full_name.trim(),
        username: f.username.trim().toLowerCase(),
        email: f.email.trim().toLowerCase(),
        password: f.password,
        confirm_password: f.confirm_password,
      });

      nav(dashboardPath(user.role), { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors({
          full_name: err.fields.full_name,
          username: err.fields.username,
          email: err.fields.email,
          password: err.fields.password,
          confirm_password: err.fields.confirm_password,
        });

        setFormError(err.message);
      } else {
        setFormError("Can't reach the server. Check your connection.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Create your PhantomTrace user account."
      footer={
        <>
          Already registered? <Link to="/signin">Sign in</Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate>
        {formError && (
          <div className="alert" role="alert">
            {formError}
          </div>
        )}

        <Field
          label="Full name"
          name="full_name"
          autoComplete="name"
          value={f.full_name}
          onChange={set("full_name")}
          error={errors.full_name}
        />

        <Field
          label="Username"
          name="username"
          autoComplete="username"
          value={f.username}
          onChange={set("username")}
          error={errors.username}
        />

        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={f.email}
          onChange={set("email")}
          error={errors.email}
        />

        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={f.password}
          onChange={set("password")}
          error={errors.password}
          hint="At least 10 characters, with a letter and a number."
        />

        <Field
          label="Confirm password"
          name="confirm_password"
          type="password"
          autoComplete="new-password"
          value={f.confirm_password}
          onChange={set("confirm_password")}
          error={errors.confirm_password}
        />

        <button className="btn block" disabled={busy}>
          {busy ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}