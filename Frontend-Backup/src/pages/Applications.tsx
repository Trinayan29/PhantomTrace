
import { useCallback, useEffect, useState } from "react";
import { api, ApiError, type Application } from "../lib/api";

const emptyForm = {
    name: "",
    display_name: "",
    description: "",
    application_type: "",
    status: "active" as Application["status"],
    organization_id: "",
};

export default function Applications() {
    const [items, setItems] = useState<Application[]>([]);
    const [form, setForm] = useState(emptyForm);
    const [editing, setEditing] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            setItems(await api.getApplications());
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Unable to load applications.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    function resetForm() {
        setForm(emptyForm);
        setEditing(null);
    }

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaving(true);
        setError("");

        try {
            const payload = {
                name: form.name.trim(),
                display_name: form.display_name.trim(),
                description: form.description.trim(),
                application_type: form.application_type.trim(),
                status: form.status,
                ...(form.organization_id.trim()
                    ? { organization_id: form.organization_id.trim() }
                    : {}),
            };

            if (editing) {
                await api.updateApplication(editing, payload);
            } else {
                await api.createApplication(payload);
            }

            resetForm();
            await load();
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Unable to save application.");
        } finally {
            setSaving(false);
        }
    }

    function edit(item: Application) {
        setEditing(item.id);
        setForm({
            name: item.name,
            display_name: item.display_name || "",
            description: item.description || "",
            application_type: item.application_type || "",
            status: item.status,
            organization_id: item.organization_id || "",
        });
    }

    async function remove(id: string) {
        if (!window.confirm("Delete this application?")) return;

        try {
            await api.deleteApplication(id);
            await load();
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Unable to delete application.");
        }
    }

    return (
        <section>
            <h1>Applications</h1>
            <p className="muted">Manage applications connected to your organization.</p>

            {error && <p role="alert" style={{ color: "#dc5555" }}>{error}</p>}

            <form onSubmit={submit} className="card" style={{ display: "grid", gap: 12, marginBottom: 24 }}>
                <h2>{editing ? "Edit application" : "Register application"}</h2>

                <input
                    placeholder="Application name *"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />

                <input
                    placeholder="Display name"
                    value={form.display_name}
                    onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                />

                <input
                    placeholder="Application type (e.g. SaaS, Internal)"
                    value={form.application_type}
                    onChange={(e) => setForm({ ...form, application_type: e.target.value })}
                />

                <textarea
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                />

                {!editing && (
                    <input
                        placeholder="Organization ID (required for Super Admin)"
                        value={form.organization_id}
                        onChange={(e) => setForm({ ...form, organization_id: e.target.value })}
                    />
                )}

                <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as Application["status"] })}
                >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                </select>

                <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn" disabled={saving}>
                        {saving ? "Saving..." : editing ? "Update application" : "Add application"}
                    </button>
                    {editing && (
                        <button type="button" className="btn ghost" onClick={resetForm}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            <h2>Registered applications ({items.length})</h2>

            {loading ? (
                <p>Loading applications...</p>
            ) : items.length === 0 ? (
                <p className="muted">No applications registered yet.</p>
            ) : (
                <div style={{ display: "grid", gap: 12 }}>
                    {items.map((item) => (
                        <article key={item.id} className="card">
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                                <div>
                                    <h3>{item.display_name || item.name}</h3>
                                    <p className="muted">{item.application_type || "Application"} · {item.status}</p>
                                    <p>{item.description}</p>
                                    <small className="muted">ID: {item.id}</small>
                                </div>
                                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                    <button className="btn ghost" onClick={() => edit(item)}>Edit</button>
                                    <button className="btn ghost" onClick={() => void remove(item.id)}>Delete</button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
