import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { dashboardPath } from "../lib/access";
import type { RoleName } from "../lib/types";

export default function ProtectedRoute({ allow }: { allow: RoleName }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="center-screen" role="status">Loading session…</div>;
  if (!user) return <Navigate to="/signin" state={{ from: loc.pathname }} replace />;
  if (user.role !== allow) return <Navigate to={dashboardPath(user.role)} replace />;
  return <Outlet />;
}

// Signed-in users shouldn't see sign in/up again
export function GuestRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="center-screen" role="status">Loading session…</div>;
  return user ? <Navigate to={dashboardPath(user.role)} replace /> : <Outlet />;
}
