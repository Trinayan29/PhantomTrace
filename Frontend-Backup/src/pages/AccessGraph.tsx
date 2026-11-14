
import { useCallback, useEffect, useState } from "react";
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    Handle,
    Position,
    type Node,
    type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { api, ApiError } from "../lib/api";

interface GraphNodeData extends Record<string, unknown> {
    label: string;
    entity_type: string;
    organization_id?: string | null;
    status?: string;
    description?: string;
    risk_score?: number;
}

interface BackendNode {
    id: string;
    type: string;
    position: { x: number; y: number };
    data: GraphNodeData;
}

interface BackendEdge {
    id: string;
    source: string;
    target: string;
    label?: string;
    type?: string;
}

interface GraphResponse {
    success: boolean;
    nodes: BackendNode[];
    edges: BackendEdge[];
    metadata?: {
        total_nodes?: number;
        total_edges?: number;
    };
}

const nodeColors: Record<string, string> = {
    identity: "#3b82f6",
    group: "#8b5cf6",
    role: "#a855f7",
    permission: "#f59e0b",
    application: "#06b6d4",
    resource: "#10b981",
};

function EntityNode({ data }: { data: GraphNodeData }) {
    const entityType = data.entity_type || "unknown";
    const color = nodeColors[entityType] || "#64748b";

    return (
        <div
            style={{
                minWidth: 180,
                maxWidth: 230,
                padding: 13,
                borderRadius: 12,
                border: `1px solid ${color}`,
                background: "var(--panel, #151b2b)",
                color: "var(--text, #f8fafc)",
                boxShadow: "0 8px 25px rgba(0,0,0,0.16)",
            }}
        >
            <Handle type="target" position={Position.Left} />

            <div
                style={{
                    color,
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    marginBottom: 7,
                }}
            >
                {entityType}
            </div>

            <div style={{ fontWeight: 700, fontSize: 13, overflowWrap: "anywhere" }}>
                {data.label}
            </div>

            {typeof data.email === "string" && (
                <div style={{ fontSize: 11, opacity: 0.7, marginTop: 5 }}>
                    {data.email}
                </div>
            )}


            {data.status && (
                <div style={{ fontSize: 11, opacity: 0.7, marginTop: 5 }}>
                    Status: {data.status}
                </div>
            )}

            {typeof data.risk_score === "number" && (
                <div style={{ fontSize: 11, marginTop: 5 }}>
                    Risk score: {data.risk_score}
                </div>
            )}

            <Handle type="source" position={Position.Right} />
        </div>
    );
}

const nodeTypes = {
    entity: EntityNode,
};

export default function AccessGraph() {
    const [nodes, setNodes] = useState<Node<GraphNodeData>[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [organizationId, setOrganizationId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [metadata, setMetadata] = useState<{
        total_nodes?: number;
        total_edges?: number;
    }>({});

    const loadGraph = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = (await api.getAccessGraph(
                organizationId.trim() || undefined
            )) as unknown as GraphResponse;

            if (!response.success) {
                throw new Error("The server could not load the access graph.");
            }

            const validNodes = (response.nodes || [])
                .filter(
                    (node) =>
                        typeof node.id === "string" &&
                        typeof node.position?.x === "number" &&
                        typeof node.position?.y === "number" &&
                        node.data &&
                        typeof node.data.label === "string",
                )
                .map((node) => ({
                    id: node.id,
                    type: "entity",
                    position: node.position,
                    data: node.data,
                })) as Node<GraphNodeData>[];

            const validNodeIds = new Set(validNodes.map((node) => node.id));

            const validEdges = (response.edges || [])
                .filter(
                    (edge) =>
                        typeof edge.id === "string" &&
                        validNodeIds.has(edge.source) &&
                        validNodeIds.has(edge.target),
                )
                .map((edge) => ({
                    id: edge.id,
                    source: edge.source,
                    target: edge.target,
                    label: edge.label || "",
                    type: "smoothstep",
                    animated: false,
                })) as Edge[];

            setNodes(validNodes);
            setEdges(validEdges);
            setMetadata(response.metadata || {});
        } catch (err) {
            setNodes([]);
            setEdges([]);
            setMetadata({});

            if (err instanceof ApiError) {
                setError(`${err.message} (HTTP ${err.status})`);
            } else {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load the access graph.",
                );
            }
        } finally {
            setLoading(false);
        }
    }, [organizationId]);

    useEffect(() => {
        void loadGraph();
    }, [loadGraph]);

    return (
        <section>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 16,
                    flexWrap: "wrap",
                    marginBottom: 20,
                }}
            >
                <div>
                    <h1>Access Relationship Graph</h1>
                    <p className="muted">
                        Visualize identities, groups, roles, permissions,
                        applications and resources.
                    </p>
                </div>

                <button
                    className="btn"
                    onClick={() => void loadGraph()}
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Refresh graph"}
                </button>
            </div>

            <div
                style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    marginBottom: 16,
                }}
            >
                <input
                    value={organizationId}
                    onChange={(event) => setOrganizationId(event.target.value)}
                    placeholder="Organization ID (optional)"
                    aria-label="Organization ID"
                    style={{ maxWidth: 320, flex: 1, minWidth: 200 }}
                />

                <button
                    className="btn"
                    onClick={() => void loadGraph()}
                    disabled={loading}
                >
                    Apply filter
                </button>
            </div>

            <div
                style={{
                    display: "flex",
                    gap: 12,
                    flexWrap: "wrap",
                    marginBottom: 16,
                }}
            >
                <div className="card">
                    <strong>{metadata.total_nodes ?? nodes.length}</strong>
                    <div className="muted small">Total nodes</div>
                </div>

                <div className="card">
                    <strong>{metadata.total_edges ?? edges.length}</strong>
                    <div className="muted small">Relationships</div>
                </div>
            </div>

            {error && (
                <div
                    role="alert"
                    style={{
                        padding: 12,
                        marginBottom: 14,
                        border: "1px solid #dc5555",
                        borderRadius: 8,
                        color: "#dc5555",
                    }}
                >
                    {error}
                </div>
            )}

            <div
                style={{
                    height: "min(70vh, 720px)",
                    minHeight: 450,
                    border: "1px solid var(--border, #334155)",
                    borderRadius: 14,
                    overflow: "hidden",
                    background: "var(--surface, #0f172a)",
                }}
            >
                {loading && nodes.length === 0 ? (
                    <div style={{ padding: 24 }}>Loading access graph...</div>
                ) : nodes.length === 0 ? (
                    <div style={{ padding: 24 }}>
                        <h3>No graph data available</h3>
                        <p className="muted">
                            No accessible identities, applications or relationships
                            were returned for this organization.
                        </p>
                    </div>
                ) : (
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        fitView
                        fitViewOptions={{ padding: 0.2 }}
                        minZoom={0.1}
                        maxZoom={2}
                        nodesDraggable
                        nodesConnectable={false}
                        elementsSelectable
                    >
                        <Background />
                        <Controls />
                        <MiniMap
                            nodeColor={(node) => {
                                const data = node.data as GraphNodeData;
                                return nodeColors[data.entity_type] || "#64748b";
                            }}
                            maskColor="rgba(0,0,0,0.15)"
                        />
                    </ReactFlow>
                )}
            </div>

            <div
                style={{
                    display: "flex",
                    gap: 14,
                    flexWrap: "wrap",
                    marginTop: 16,
                }}
            >
                {Object.entries(nodeColors).map(([type, color]) => (
                    <div
                        key={type}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: 12,
                        }}
                    >
                        <span
                            style={{
                                width: 9,
                                height: 9,
                                borderRadius: "50%",
                                background: color,
                            }}
                        />
                        {type}
                    </div>
                ))}
            </div>
        </section>
    );
}
