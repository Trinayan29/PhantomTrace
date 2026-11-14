
import { useCallback, useEffect, useState } from "react";
import {
    api,
    ApiError,
    type ReportSummary,
} from "../lib/api";

type ReportRecord = Record<string, unknown>;

function displayValue(value: unknown): string {
    if (value === null || value === undefined) return "—";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
}

export default function Reports() {
    const [summary, setSummary] = useState<ReportSummary | null>(null);
    const [findings, setFindings] = useState<ReportRecord[]>([]);
    const [remediation, setRemediation] = useState<ReportRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState("");
    const [error, setError] = useState("");

    const loadReports = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const [summaryData, findingsData, remediationData] =
                await Promise.all([
                    api.getReportSummary(),
                    api.getFindings({ limit: 50, skip: 0 }),
                    api.getRemediationActions({ limit: 50, skip: 0 }),
                ]);

            setSummary(summaryData);
            setFindings(findingsData.results || []);
            setRemediation(remediationData.results || []);
        } catch (err) {
            setError(
                err instanceof ApiError
                    ? `${err.message} (HTTP ${err.status})`
                    : "Unable to load reports. Check your access permissions.",
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadReports();
    }, [loadReports]);

    async function downloadReport(format: "csv" | "pdf") {
        setExporting(format);
        setError("");

        try {
            const blob = await api.exportReport(format);
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");

            anchor.href = url;
            anchor.download = `phantomtrace_report.${format}`;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();

            URL.revokeObjectURL(url);
        } catch (err) {
            setError(
                err instanceof ApiError
                    ? `${err.message} (HTTP ${err.status})`
                    : `Unable to export ${format.toUpperCase()} report.`,
            );
        } finally {
            setExporting("");
        }
    }

    const severity = summary?.severity || {};
    const statuses = summary?.status || {};
    const remediationStatus = summary?.remediation_status || {};

    return (
        <section>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    flexWrap: "wrap",
                    marginBottom: 22,
                }}
            >
                <div>
                    <h1>Security Reports</h1>
                    <p className="muted">
                        Security findings, risk severity and remediation progress.
                    </p>
                </div>

                <button
                    className="btn ghost"
                    onClick={() => void loadReports()}
                    disabled={loading}
                >
                    Refresh reports
                </button>
            </div>

            {error && (
                <p role="alert" style={{ color: "#dc5555" }}>
                    {error}
                </p>
            )}

            <div
                style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    marginBottom: 24,
                }}
            >
                <button
                    className="btn"
                    disabled={!!exporting}
                    onClick={() => void downloadReport("csv")}
                >
                    {exporting === "csv" ? "Exporting..." : "Export CSV"}
                </button>

                <button
                    className="btn ghost"
                    disabled={!!exporting}
                    onClick={() => void downloadReport("pdf")}
                >
                    {exporting === "pdf" ? "Exporting..." : "Export PDF"}
                </button>
            </div>

            {loading ? (
                <p>Loading reports...</p>
            ) : (
                <>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                            gap: 12,
                            marginBottom: 26,
                        }}
                    >
                        <div className="card">
                            <h2>{summary?.total_findings ?? 0}</h2>
                            <p className="muted small">Total findings</p>
                        </div>

                        {Object.entries(severity).map(([level, count]) => (
                            <div className="card" key={level}>
                                <h2>{count}</h2>
                                <p className="muted small">
                                    {level.replace(/_/g, " ")}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                            gap: 14,
                            marginBottom: 28,
                        }}
                    >
                        <div className="card">
                            <h2>Finding status</h2>
                            {Object.entries(statuses).length === 0 ? (
                                <p className="muted">No status data.</p>
                            ) : (
                                Object.entries(statuses).map(([key, value]) => (
                                    <p key={key}>
                                        {key.replace(/_/g, " ")}: <strong>{value}</strong>
                                    </p>
                                ))
                            )}
                        </div>

                        <div className="card">
                            <h2>Remediation status</h2>
                            {Object.entries(remediationStatus).length === 0 ? (
                                <p className="muted">No remediation data.</p>
                            ) : (
                                Object.entries(remediationStatus).map(([key, value]) => (
                                    <p key={key}>
                                        {key.replace(/_/g, " ")}: <strong>{value}</strong>
                                    </p>
                                ))
                            )}
                        </div>
                    </div>

                    <h2>Security findings ({findings.length})</h2>

                    {findings.length === 0 ? (
                        <p className="muted">No findings available.</p>
                    ) : (
                        <div style={{ display: "grid", gap: 12, marginBottom: 28 }}>
                            {findings.map((item, index) => (
                                <article className="card" key={displayValue(item.id ?? item._id ?? index)}>
                                    <h3>{displayValue(item.title ?? item.name ?? "Security finding")}</h3>
                                    <p>{displayValue(item.description)}</p>
                                    <p className="muted small">
                                        Severity: {displayValue(item.severity)} · Status: {displayValue(item.status)}
                                    </p>
                                    <p className="muted small">
                                        Remediation: {displayValue(item.remediation_status)}
                                    </p>
                                    <p className="muted small">
                                        Organization: {displayValue(item.organization_id)}
                                    </p>
                                </article>
                            ))}
                        </div>
                    )}

                    <h2>Remediation actions ({remediation.length})</h2>

                    {remediation.length === 0 ? (
                        <p className="muted">No remediation actions available.</p>
                    ) : (
                        <div style={{ display: "grid", gap: 12 }}>
                            {remediation.map((item, index) => (
                                <article className="card" key={displayValue(item.id ?? item._id ?? index)}>
                                    <h3>{displayValue(item.title ?? item.name ?? "Remediation action")}</h3>
                                    <p>{displayValue(item.description)}</p>
                                    <p className="muted small">
                                        Status: {displayValue(item.status)}
                                    </p>
                                </article>
                            ))}
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
