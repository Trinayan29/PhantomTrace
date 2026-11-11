import type { RoleName } from "./types";

// UI-only routing. The backend is the source of truth for every permission.
export const dashboardPath = (role: RoleName) => `/dashboard/${role.replace("_", "-")}`;

export interface NavItem { label: string; to: string }
export const NAV: Record<RoleName, NavItem[]> = {
  super_admin: [
    { label: "Overview", to: "" }, { label: "Organizations", to: "organizations" },
    { label: "All users", to: "users" }, { label: "Roles & permissions", to: "roles" },
  ],
  organization_admin: [
    { label: "Overview", to: "" }, { label: "Members", to: "members" },
    { label: "Roles", to: "roles" }, { label: "Alerts", to: "alerts" },
  ],
  security_analyst: [{ label: "Overview", to: "" }, { label: "Alerts", to: "alerts" }, { label: "Investigations", to: "investigations" }],
  auditor: [{ label: "Overview", to: "" }, { label: "Audit log", to: "audit" }, { label: "Reports", to: "reports" }],
  viewer: [{ label: "Overview", to: "" }, { label: "Reports", to: "reports" }],
};
