import { useState, type FormEvent } from "react";
import {
  api,
  ApiError,
  type RiskEvaluationResponse,
} from "../lib/api";

const initialForm = {
  employment_status: "active",
  account_active: true,
  privilege_level: "standard",
  resource_sensitivity: "medium",
  owner_known: true,
  suspicious_activity: false,
};

export default function RiskAnalysis() {
  const [form, setForm] = useState(initialForm);
  const [signals, setSignals] = useState("");
  const [result, setResult] =
    useState<RiskEvaluationResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof initialForm>(
    key: K,
    value: (typeof initialForm)[K],
  ) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await api.evaluateRisk({
        ...form,
        suspicious_activity: form.suspicious_activity
          ? signals.split(",").map((item) => item.trim()).filter(Boolean)
          : false,
      });

      setResult(response);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to connect to the risk-analysis service.",
      );
    } finally {
      setLoading(false);
    }
  }

  const level = result?.risk.level.toLowerCase();

  const severityColor =
    level === "critical" ? "#dc2626" :
    level === "high" ? "#ea580c" :
    level === "medium" ? "#ca8a04" :
    "#16a34a";

  return (
    <section>
      <h1>Risk Analysis</h1>
      <p className="muted">
        Evaluate identity and resource access risk using evidence-based
        scoring from the PhantomTrace risk engine.
      </p>

      <div className="card" style={{ padding: 24, marginTop: 24 }}>
        <h2>Evaluation inputs</h2>

        <form onSubmit={submit}>
          <div className="grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 18,
          }}>
            <label>
              <span>Employment status</span>
              <select
                className="input"
                value={form.employment_status}
                onChange={(e) => update("employment_status", e.target.value)}
              >
                <option value="active">Active</option>
                <option value="departed">Departed</option>
                <option value="contract_ended">Contract ended</option>
                <option value="unknown">Unknown</option>
              </select>
            </label>

            <label>
              <span>Privilege level</span>
              <select
                className="input"
                value={form.privilege_level}
                onChange={(e) => update("privilege_level", e.target.value)}
              >
                <option value="standard">Standard</option>
                <option value="elevated">Elevated</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </label>

            <label>
              <span>Resource sensitivity</span>
              <select
                className="input"
                value={form.resource_sensitivity}
                onChange={(e) => update("resource_sensitivity", e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </label>

            <label>
              <span>Account status</span>
              <select
                className="input"
                value={String(form.account_active)}
                onChange={(e) => update("account_active", e.target.value === "true")}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </label>

            <label>
              <span>Account owner</span>
              <select
                className="input"
                value={String(form.owner_known)}
                onChange={(e) => update("owner_known", e.target.value === "true")}
              >
                <option value="true">Known</option>
                <option value="false">Unknown</option>
              </select>
            </label>

            <label>
              <span>Suspicious activity detected?</span>
              <select
                className="input"
                value={String(form.suspicious_activity)}
                onChange={(e) => update("suspicious_activity", e.target.value === "true")}
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </label>
          </div>

          {form.suspicious_activity && (
            <label style={{ display: "block", marginTop: 18 }}>
              <span>Detection signals (comma-separated)</span>
              <input
                className="input"
                value={signals}
                onChange={(e) => setSignals(e.target.value)}
                placeholder="suspicious_login, unauthorized_access"
              />
            </label>
          )}

          {error && (
            <p className="alert" role="alert" style={{ marginTop: 16 }}>
              {error}
            </p>
          )}

          <button className="btn" type="submit" disabled={loading}
            style={{ marginTop: 22 }}>
            {loading ? "Evaluating..." : "Evaluate risk"}
          </button>
        </form>
      </div>

      {result && (
        <div className="card" style={{ padding: 24, marginTop: 24 }}>
          <h2>Risk assessment</h2>

          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            alignItems: "center",
            margin: "20px 0",
          }}>
            <div>
              <div style={{ fontSize: 48, fontWeight: 800, color: severityColor }}>
                {result.risk.score}
                <span style={{ fontSize: 18 }}>/100</span>
              </div>
              <strong style={{ color: severityColor }}>
                {result.risk.level} Risk
              </strong>
            </div>

            <div style={{
              flex: 1,
              minWidth: 160,
              height: 12,
              background: "var(--border, #e5e7eb)",
              borderRadius: 20,
              overflow: "hidden",
            }}>
              <div style={{
                width: `${Math.min(100, Math.max(0, result.risk.score))}%`,
                height: "100%",
                background: severityColor,
                borderRadius: 20,
              }} />
            </div>
          </div>

          <h3>Evidence</h3>
          {result.risk.evidence.length ? (
            <ul>
              {result.risk.evidence.map((item, index) => (
                <li key={`${item.signal}-${index}`} style={{ marginBottom: 12 }}>
                  <strong>{item.signal.replace(/_/g, " ")}</strong>
                  {" — "}{item.points} points
                  <p className="muted">{item.details}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No risk indicators were identified from the supplied inputs.</p>
          )}

          <h3>Remediation recommendations</h3>
          {result.risk.recommendations.length ? (
            <ul>
              {result.risk.recommendations.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="muted">No specific recommendations were generated.</p>
          )}

          {result.assistant.summary && (
            <>
              <h3>AI Security Assistant</h3>
              <p>{result.assistant.summary}</p>
              {result.assistant.assistant_type && (
                <p className="muted">
                  Assistant type: {result.assistant.assistant_type}
                </p>
              )}
            </>
          )}

          <p className="muted" style={{ marginTop: 20 }}>
            {result.risk.disclaimer}
          </p>
        </div>
      )}
    </section>
  );
}

