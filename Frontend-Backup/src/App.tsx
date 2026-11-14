import { Navigate, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute, { GuestRoute } from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import { dashboardPath } from "./lib/access";
import { ROLES } from "./lib/types";

function DashboardIndex() {
  const { user } = useAuth();
  return <Navigate to={user ? dashboardPath(user.role) : "/signin"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<GuestRoute />}>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Route>
      <Route path="/dashboard" element={<DashboardIndex />} />
      {ROLES.map((role) => (
        <Route key={role} element={<ProtectedRoute allow={role} />}>
          <Route path={`${dashboardPath(role)}/*`} element={<Dashboard role={role} />} />
        </Route>
      ))}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
