
import type { RoleName } from "./types";

export const dashboardPath = (role: RoleName) =>
  `/dashboard/${role.replace("_", "-")}`;

export interface NavItem {
  label: string;
  to: string;
}

const riskItem: NavItem = {
  label: "Risk Analysis",
  to: "risk-analysis",
};

const graphItem: NavItem = {
  label: "Access Graph",
  to: "access-graph",
};

const applicationsItem: NavItem = {
  label: "Applications",
  to: "applications",
};

const detectionItem: NavItem = {
  label: "Cyber Attack Detection",
  to: "detection",
};

export const NAV: Record<RoleName, NavItem[]> = {
  super_admin: [
    { label: "Overview", to: "" },
    { label: "Organizations", to: "organizations" },
    { label: "All users", to: "users" },
    { label: "Roles & permissions", to: "roles" },
    applicationsItem,
    detectionItem,
    graphItem,
    riskItem,
  ],

  organization_admin: [
    { label: "Overview", to: "" },
    { label: "Members", to: "members" },
    { label: "Roles", to: "roles" },
    applicationsItem,
    detectionItem,
    { label: "Alerts", to: "alerts" },
    graphItem,
    riskItem,
  ],

  security_analyst: [
    { label: "Overview", to: "" },
    applicationsItem,
    detectionItem,
    { label: "Alerts", to: "alerts" },
    { label: "Investigations", to: "investigations" },
    graphItem,
    riskItem,
  ],

  auditor: [
    { label: "Overview", to: "" },
    { label: "Audit log", to: "audit" },
    { label: "Reports", to: "reports" },
    graphItem,
    riskItem,
  ],

  viewer: [
    { label: "Overview", to: "" },
    { label: "Reports", to: "reports" },
    graphItem,
    riskItem,
  ],
};
