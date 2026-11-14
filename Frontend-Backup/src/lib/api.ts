
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  TokenPair,
  User,
  Membership,
  RoleName,
} from "./types";
import { ROLES } from "./types";

const BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";

const AUTH = "/api/v1/auth/";
const REFRESH_KEY = "pt-refresh";

let accessToken: string | null = null;

export class ApiError extends Error {
  status: number;
  fields: Record<string, string>;

  constructor(
    message: string,
    status: number,
    fields: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

export const tokenStore = {
  get access() {
    return accessToken;
  },
  set access(value: string | null) {
    accessToken = value;
  },
  get refresh() {
    return localStorage.getItem(REFRESH_KEY);
  },
  set refresh(value: string | null) {
    if (value) localStorage.setItem(REFRESH_KEY, value);
    else localStorage.removeItem(REFRESH_KEY);
  },
  clear() {
    accessToken = null;
    localStorage.removeItem(REFRESH_KEY);
  },
};

function normalizeError(data: unknown, status: number): ApiError {
  const fields: Record<string, string> = {};
  let message = "The request could not be completed.";

  if (data && typeof data === "object") {
    const body = data as Record<string, unknown>;

    if (typeof body.error === "string") message = body.error;
    else if (typeof body.detail === "string") message = body.detail;
    else if (typeof body.message === "string") message = body.message;

    for (const [key, value] of Object.entries(body)) {
      if (Array.isArray(value)) fields[key] = value.map(String).join(" ");
      else if (typeof value === "string") fields[key] = value;
      else if (value && typeof value === "object") {
        fields[key] = JSON.stringify(value);
      }
    }
  }

  return new ApiError(message, status, fields);
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  authenticated = false,
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (authenticated && tokenStore.access) {
    headers.set("Authorization", `Bearer ${tokenStore.access}`);
  }

  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) throw normalizeError(data, response.status);
  return data as T;
}

async function requestBlob(path: string): Promise<Blob> {
  const headers = new Headers({
    Accept: "application/pdf, text/csv",
  });

  if (tokenStore.access) {
    headers.set("Authorization", `Bearer ${tokenStore.access}`);
  }

  const response = await fetch(`${BASE}${path}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw normalizeError(data, response.status);
  }

  return response.blob();
}

function buildQuery(
  filters: Record<string, string | number | undefined>,
): string {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });

  const query = params.toString();
  return query ? `?${query}` : "";
}

function normalizeUser(raw: Record<string, unknown>): User {
  const roles = Array.isArray(raw.roles)
    ? raw.roles.filter(
      (role): role is RoleName =>
        typeof role === "string" &&
        (ROLES as readonly string[]).includes(role),
    )
    : [];

  const memberships: Membership[] = Array.isArray(raw.memberships)
    ? raw.memberships.map((item) => {
      const membership = item as Record<string, unknown>;
      const role = ROLES.includes(membership.role as RoleName)
        ? (membership.role as RoleName)
        : "viewer";

      return {
        organization_id:
          typeof membership.organization_id === "string"
            ? membership.organization_id
            : null,
        role,
        permissions: Array.isArray(membership.permissions)
          ? membership.permissions.map(String)
          : [],
      };
    })
    : [];

  return {
    id: String(raw.id ?? ""),
    full_name: String(raw.full_name ?? ""),
    username: String(raw.username ?? ""),
    email: String(raw.email ?? ""),
    is_active: Boolean(raw.is_active),
    is_verified: Boolean(raw.is_verified),
    role: roles[0] ?? memberships[0]?.role ?? "viewer",
    roles,
    organization: null,
    memberships,
    permissions: Array.isArray(raw.permissions)
      ? raw.permissions.map(String)
      : [],
    is_super_admin: Boolean(raw.is_super_admin),
    created_at:
      typeof raw.created_at === "string" ? raw.created_at : undefined,
  };
}

interface LoginResponse {
  access: string;
  refresh: string;
  user: Record<string, unknown>;
}

// RISK ANALYSIS TYPES

export interface RiskEvaluationPayload {
  employment_status: string;
  account_active: boolean;
  privilege_level: string;
  resource_sensitivity: string;
  owner_known: boolean;
  suspicious_activity: boolean | string[];
}

export interface RiskEvidence {
  signal: string;
  points: number;
  details: string;
}

export interface RiskResult {
  score: number;
  level: string;
  evidence: RiskEvidence[];
  recommendations: string[];
  disclaimer: string;
}

export interface RiskAssistantResult {
  summary?: string;
  risk_score?: number;
  risk_level?: string;
  evidence?: RiskEvidence[];
  recommendations?: string[];
  assistant_type?: string;
  disclaimer?: string;
}

export interface RiskEvaluationResponse {
  success: boolean;
  risk: RiskResult;
  assistant: RiskAssistantResult;
}

// APPLICATION TYPES

export interface Application {
  id: string;
  organization_id: string;
  name: string;
  display_name?: string;
  description?: string;
  application_type?: string;
  type?: string;
  status: "active" | "inactive" | "suspended";
  risk_score?: number | null;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface ApplicationPayload {
  name: string;
  display_name?: string;
  description?: string;
  application_type?: string;
  type?: string;
  status?: "active" | "inactive" | "suspended";
  risk_score?: number | null;
  metadata?: Record<string, unknown>;
  organization_id?: string;
}

// ACCESS GRAPH TYPES

export interface AccessGraphResponse {
  success: boolean;
  nodes: Array<Record<string, unknown>>;
  edges: Array<Record<string, unknown>>;
  metadata?: Record<string, unknown>;
}

// DETECTION TYPES

export interface DetectionEvent {
  incident_id?: string;
  finding_id?: string | null;
  event_type: string;
  source_ip?: string | null;
  failed_attempts?: number;
  is_suspicious: boolean;
  message?: string;
  organization_id?: string;
  created_at?: string;
}

export interface DetectionPayload {
  event_type: string;
  source_ip?: string | null;
  failed_attempts?: number;
  organization_id?: string;
}

export interface DetectionListResponse {
  success: boolean;
  total: number;
  results: DetectionEvent[];
}

// REPORT TYPES

export interface FindingsResponse {
  total: number;
  limit: number;
  skip: number;
  results: Array<Record<string, unknown>>;
}

export interface ReportSummary {
  total_findings: number;
  severity: Record<string, number>;
  status: Record<string, number>;
  remediation_status: Record<string, number>;
}

export interface RemediationResponse {
  total: number;
  limit: number;
  skip: number;
  results: Array<Record<string, unknown>>;
}

// AUTHENTICATION

async function login(payload: LoginPayload): Promise<AuthResponse> {
  const response = await request<LoginResponse>(
    `${AUTH}login/`,
    {
      method: "POST",
      body: JSON.stringify({
        identifier: payload.email,
        password: payload.password,
      }),
    },
  );

  tokenStore.access = response.access;
  tokenStore.refresh = response.refresh;

  return {
    access: response.access,
    refresh: response.refresh,
    user: normalizeUser(response.user),
  };
}

async function register(
  payload: RegisterPayload,
): Promise<AuthResponse> {
  await request(`${AUTH}register/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return login({
    email: payload.email,
    password: payload.password,
  });
}

async function profile(): Promise<User> {
  const response = await request<Record<string, unknown>>(
    `${AUTH}me/`,
    { method: "GET" },
    true,
  );

  return normalizeUser(response);
}

async function logout(): Promise<void> {
  const refresh = tokenStore.refresh;
  if (!refresh) return;

  await request(`${AUTH}logout/`, {
    method: "POST",
    body: JSON.stringify({ refresh }),
  });
}

export async function refreshSession(): Promise<boolean> {
  const refresh = tokenStore.refresh;
  if (!refresh) return false;

  try {
    const tokens = await request<TokenPair>(
      `${AUTH}refresh/`,
      {
        method: "POST",
        body: JSON.stringify({ refresh }),
      },
    );

    tokenStore.access = tokens.access;
    tokenStore.refresh = tokens.refresh;
    return true;
  } catch {
    tokenStore.clear();
    return false;
  }
}

// RISK ANALYSIS API

async function evaluateRisk(
  payload: RiskEvaluationPayload,
): Promise<RiskEvaluationResponse> {
  return request<RiskEvaluationResponse>(
    "/api/v1/risk-analysis/evaluate/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    true,
  );
}

// APPLICATIONS API

async function getApplications(): Promise<Application[]> {
  const response = await request<
    Application[] | { results?: Application[] }
  >(
    "/api/v1/applications/",
    { method: "GET" },
    true,
  );

  return Array.isArray(response)
    ? response
    : response.results ?? [];
}

async function createApplication(
  payload: ApplicationPayload,
): Promise<Application> {
  return request<Application>(
    "/api/v1/applications/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    true,
  );
}

async function updateApplication(
  id: string,
  payload: Partial<ApplicationPayload>,
): Promise<Application> {
  return request<Application>(
    `/api/v1/applications/${encodeURIComponent(id)}/`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
    true,
  );
}

async function deleteApplication(id: string): Promise<unknown> {
  return request(
    `/api/v1/applications/${encodeURIComponent(id)}/`,
    { method: "DELETE" },
    true,
  );
}

// ACCESS GRAPH API

async function getAccessGraph(
  organizationId?: string,
): Promise<AccessGraphResponse> {
  return request<AccessGraphResponse>(
    `/api/v1/graph/${buildQuery({
      organization_id: organizationId,
    })}`,
    { method: "GET" },
    true,
  );
}

// DETECTION API

async function getDetectionEvents(): Promise<DetectionListResponse> {
  return request<DetectionListResponse>(
    "/api/v1/detection/",
    { method: "GET" },
    true,
  );
}

async function createDetectionEvent(
  payload: DetectionPayload,
): Promise<DetectionEvent & { success: boolean }> {
  return request<DetectionEvent & { success: boolean }>(
    "/api/v1/detection/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    true,
  );
}

// REPORTS API

async function getFindings(filters: {
  severity?: string;
  status?: string;
  organization_id?: string;
  limit?: number;
  skip?: number;
} = {}): Promise<FindingsResponse> {
  return request<FindingsResponse>(
    `/api/v1/reports/findings/${buildQuery(filters)}`,
    { method: "GET" },
    true,
  );
}

async function getReportSummary(
  organizationId?: string,
): Promise<ReportSummary> {
  return request<ReportSummary>(
    `/api/v1/reports/summary/${buildQuery({
      organization_id: organizationId,
    })}`,
    { method: "GET" },
    true,
  );
}

async function getRemediationActions(filters: {
  status?: string;
  limit?: number;
  skip?: number;
} = {}): Promise<RemediationResponse> {
  return request<RemediationResponse>(
    `/api/v1/reports/remediation/${buildQuery(filters)}`,
    { method: "GET" },
    true,
  );
}

async function exportReport(
  format: "csv" | "pdf",
): Promise<Blob> {
  return requestBlob(`/api/v1/reports/export/${format}/`);
}

// EXPORTED API

export const api = {
  // Authentication
  login,
  register,
  profile,
  logout,

  // Risk analysis
  evaluateRisk,

  // Applications
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,

  // Access graph
  getAccessGraph,

  // Detection
  getDetectionEvents,
  createDetectionEvent,

  // Reports
  getFindings,
  getReportSummary,
  getRemediationActions,
  exportReport,
};
