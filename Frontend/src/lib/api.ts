import type { AuthResponse, LoginPayload, RegisterPayload, TokenPair, User } from "./types";

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";
const REFRESH_KEY = "pt-refresh";

let accessToken: string | null = null; // kept in memory only
export const tokenStore = {
  get access() { return accessToken; },
  set access(v: string | null) { accessToken = v; },
  get refresh() { return localStorage.getItem(REFRESH_KEY); },
  set refresh(v: string | null) { v ? localStorage.setItem(REFRESH_KEY, v) : localStorage.removeItem(REFRESH_KEY); },
  clear() { accessToken = null; localStorage.removeItem(REFRESH_KEY); },
};

export class ApiError extends Error {
  constructor(public status: number, message: string, public fields: Record<string, string> = {}) { super(message); }
}

async function parseError(res: Response): Promise<ApiError> {
  let body: any = null;
  try { body = await res.json(); } catch { /* empty */ }
  const fields: Record<string, string> = {};
  if (body && typeof body === "object") {
    for (const [k, v] of Object.entries(body)) {
      if (k !== "detail") fields[k] = Array.isArray(v) ? String(v[0]) : String(v);
    }
  }
  return new ApiError(res.status, body?.detail ?? "Something went wrong. Try again.", fields);
}

async function raw(path: string, init: RequestInit = {}, auth = true): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (auth && accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  return fetch(`${BASE}${path}`, { ...init, headers });
}

let refreshing: Promise<boolean> | null = null;
export function refreshSession(): Promise<boolean> {
  if (refreshing) return refreshing; // de-duplicate parallel 401s
  refreshing = (async () => {
    const refresh = tokenStore.refresh;
    if (!refresh) return false;
    const res = await raw("/api/auth/refresh/", { method: "POST", body: JSON.stringify({ refresh }) }, false);
    if (!res.ok) { tokenStore.clear(); return false; }
    const data = (await res.json()) as Partial<TokenPair>;
    tokenStore.access = data.access ?? null;
    if (data.refresh) tokenStore.refresh = data.refresh; // if backend rotates refresh tokens
    return !!data.access;
  })().finally(() => { refreshing = null; });
  return refreshing;
}

async function request<T>(path: string, init: RequestInit = {}, auth = true): Promise<T> {
  let res = await raw(path, init, auth);
  if (res.status === 401 && auth && (await refreshSession())) res = await raw(path, init, auth);
  if (!res.ok) throw await parseError(res);
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

// Endpoints (ASSUMED paths - confirm with backend)
export const api = {
  register: (p: RegisterPayload) => request<AuthResponse>("/api/auth/register/", { method: "POST", body: JSON.stringify(p) }, false),
  login: (p: LoginPayload) => request<AuthResponse>("/api/auth/login/", { method: "POST", body: JSON.stringify(p) }, false),
  logout: () => request<void>("/api/auth/logout/", { method: "POST", body: JSON.stringify({ refresh: tokenStore.refresh }) }),
  profile: () => request<User>("/api/auth/profile/"),
};
