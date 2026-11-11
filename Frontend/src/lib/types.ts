export const ROLES = ["super_admin", "organization_admin", "security_analyst", "auditor", "viewer"] as const;
export type RoleName = (typeof ROLES)[number];

export const ROLE_LABEL: Record<RoleName, string> = {
  super_admin: "Super Admin",
  organization_admin: "Organization Admin",
  security_analyst: "Security Analyst",
  auditor: "Auditor",
  viewer: "Viewer",
};

// Mirrors the Mongo collections: User, Organization, Role, Permission,
// OrganizationMembership, RolePermission, RefreshToken.
export interface Organization { id: string; name: string; slug: string }
export interface Membership { organization: Organization; role: RoleName }
export interface User {
  id: string;
  full_name: string;
  email: string;
  is_active: boolean;
  role: RoleName;                    // effective role for the active organization
  organization: Organization | null; // null for super_admin (global)
  memberships: Membership[];
  permissions: string[];             // flattened RolePermission codenames, e.g. "alerts.read"
  created_at?: string;
}
export interface TokenPair { access: string; refresh: string }
export interface AuthResponse extends TokenPair { user: User }

// ASSUMED contract - confirm with backend.
export type OrgChoice =
  | { mode: "create"; name: string }
  | { mode: "join"; slug: string };
export type SignupRole = Exclude<RoleName, "super_admin">;
export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  organization: OrgChoice;
  role: SignupRole; // backend validates; only org creators become organization_admin
}
export interface LoginPayload { email: string; password: string }
