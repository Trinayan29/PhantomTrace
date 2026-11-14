
import { useCallback, useEffect, useState } from "react";
import {
    api,
    ApiError,
    type DetectionEvent,
} from "../lib/api";

export default function Detection() {
    const [events, setEvents] = useState<DetectionEvent[]>([]);
    const [eventType, setEventType] = useState("suspicious_login");
    const [sourceIp, setSourceIp] = useState("");
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [organizationId, setOrganizationId] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const loadEvents = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await api.getDetectionEvents();
            setEvents(response.results || []);
        } catch (err) {
            setError(
                err instanceof ApiError
                    ? err.message
                    : "Unable to load detection events.",
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadEvents();
    }, [loadEvents]);

    async function submitEvent(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSubmitting(true);
        setError("");
        setMessage("");

        try {
            const result = await api.createDetectionEvent({
                event_type: eventType,
                source_ip: sourceIp.trim() || null,
                failed_attempts: failedAttempts,
                ...(organizationId.trim()
                    ? { organization_id: organizationId.trim() }
                    : {}),
            });

            setMessage(
                result.is_suspicious
                    ? "Suspicious activity detected. A security finding was generated."
                    : "Event recorded. No suspicious activity was detected.",
            );

            setSourceIp("");
            setFailedAttempts(0);
            await loadEvents();
        } catch (err) {
            setError(
                err instanceof ApiError
                    ? err.message
                    : "Unable to submit detection event.",
            );
        } finally {
            setSubmitting(false);
        }
    }

    const suspiciousCount = events.filter(
        (event) => event.is_suspicious,
    ).length;

    return (
        <section>
            <div style={{ marginBottom: 24 }}>
                <h1>Cyber Attack Detection</h1>
                <p className="muted">
                    Submit security events and monitor suspicious activity.
                </p>
            </div>

            {error && (
                <p role="alert" style={{ color: "#dc5555" }}>
                    {error}
                </p>
            )}

            {message && (
                <p role="status" style={{ color: "#16a34a" }}>
                    {message}
                </p>
            )}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: 12,
                    marginBottom: 24,
                }}
            >
                <div className="card">
                    <h2>{events.length}</h2>
                    <p className="muted small">Total events</p>
                </div>

                <div className="card">
                    <h2>{suspiciousCount}</h2>
                    <p className="muted small">Suspicious events</p>
                </div>

                <div className="card">
                    <h2>{events.length - suspiciousCount}</h2>
                    <p className="muted small">Normal events</p>
                </div>
            </div>

            <form
                className="card"
                onSubmit={submitEvent}
                style={{ display: "grid", gap: 14, marginBottom: 28 }}
            >
                <h2>Analyze security event</h2>

                <label>
                    Event type
                    <select
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                        required
                    >
                        <option value="suspicious_login">Suspicious login</option>
                        <option value="unauthorized_access">Unauthorized access</option>
                        <option value="phishing_report">Phishing report</option>
                        <option value="failed_login">Failed login</option>
                        <option value="normal_activity">Normal activity</option>
                    </select>
                </label>

                <label>
                    Source IP address
                    <input
                        type="text"
                        placeholder="e.g. 192.168.1.10"
                        value={sourceIp}
                        onChange={(e) => setSourceIp(e.target.value)}
                    />
                </label>

                <label>
                    Failed attempts
                    <input
                        type="number"
                        min="0"
                        max="100000"
                        value={failedAttempts}
                        onChange={(e) =>
                            setFailedAttempts(
                                Math.max(0, Number(e.target.value) || 0),
                            )
                        }
                    />
                </label>

                <label>
                    Organization ID (optional)
                    <input
                        type="text"
                        placeholder="Organization ID"
                        value={organizationId}
                        onChange={(e) => setOrganizationId(e.target.value)}
                    />
                </label>

                <button className="btn" disabled={submitting}>
                    {submitting ? "Analyzing..." : "Analyze event"}
                </button>
            </form>

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 14,
                }}
            >
                <h2>Detection history</h2>
                <button
                    className="btn ghost"
                    onClick={() => void loadEvents()}
                    disabled={loading}
                >
                    Refresh
                </button>
            </div>

            {loading ? (
                <p>Loading detection history...</p>
            ) : events.length === 0 ? (
                <p className="muted">No security events recorded yet.</p>
            ) : (
                <div style={{ display: "grid", gap: 12 }}>
                    {events.map((item, index) => (
                        <article
                            className="card"
                            key={item.incident_id || item.finding_id || `${item.event_type}-${item.created_at}-${index}`}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: 12,
                                    flexWrap: "wrap",
                                }}
                            >
                                <div>
                                    <h3>
                                        {item.event_type.replace(/_/g, " ")}
                                    </h3>
                                    <p className="muted small">
                                        Source IP: {item.source_ip || "Not provided"}
                                    </p>
                                    <p className="muted small">
                                        Failed attempts: {item.failed_attempts ?? 0}
                                    </p>
                                    {item.created_at && (
                                        <p className="muted small">
                                            {new Date(item.created_at).toLocaleString()}
                                        </p>
                                    )}
                                    {item.finding_id && (
                                        <p className="muted small">
                                            Finding ID: {item.finding_id}
                                        </p>
                                    )}
                                </div>

                                <span
                                    className="badge"
                                    style={{
                                        color: item.is_suspicious ? "#dc5555" : "#16a34a",
                                    }}
                                >
                                    {item.is_suspicious ? "Suspicious" : "Normal"}
                                </span>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
