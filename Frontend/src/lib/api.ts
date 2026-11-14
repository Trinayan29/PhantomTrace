const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.detail || `API error ${response.status}`);
  }

  return data as T;
}

export const api = {
  login: (identifier: string, password: string) =>
    request<any>("/api/v1/auth/login/", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    }),

  register: (data: {
    full_name: string;
    username: string;
    email: string;
    password: string;
    confirm_password: string;
  }) =>
    request<any>("/api/v1/auth/register/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: (token: string) =>
    request<any>("/api/v1/auth/me/", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  applications: (token: string) =>
    request<any>("/api/v1/applications/", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  graph: (token: string) =>
    request<any>("/api/v1/graph/", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  detection: (token: string) =>
    request<any>("/api/v1/detection/", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  submitDetection: (token: string, data: any) =>
    request<any>("/api/v1/detection/", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),

  findings: (token: string) =>
    request<any>("/api/v1/reports/findings/", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  reportSummary: (token: string) =>
    request<any>("/api/v1/reports/summary/", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  remediation: (token: string) =>
    request<any>("/api/v1/reports/remediation/", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  evaluateRisk: (token: string, data: any) =>
    request<any>("/api/v1/risk-analysis/evaluate/", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),
};
