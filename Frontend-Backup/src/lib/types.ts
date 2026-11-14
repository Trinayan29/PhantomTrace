export const ROLES = [
  "super_admin",
  "organization_admin",
  "security_analyst",
  "auditor",
  "viewer",
] as const;

export type RoleName = (typeof ROLES)[number];

export const ROLE_LABEL: Record<RoleName, string> = {
  super_admin: "Super Admin",
  organization_admin: "Organization Admin",
  security_analyst: "Security Analyst",
  auditor: "Auditor",
  viewer: "Viewer",
};

export interface Membership {
  organization_id: string | null;
  role: RoleName;
  permissions: string[];
}

export interface User {
  id: string;
  full_name: string;
  username: string;
  email: string;
  is_active: boolean;
  is_verified: boolean;
  role: RoleName;
  roles: RoleName[];
  organization: null;
  memberships: Membership[];
  permissions: string[];
  is_super_admin: boolean;
  created_at?: string;
}

export interface TokenPair {
  access: string;
  refresh: string;
}

export interface AuthResponse extends TokenPair {
  user: User;
}

export interface RegisterPayload {
  full_name: string;
  username: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}