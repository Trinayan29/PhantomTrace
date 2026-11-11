import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, refreshSession, tokenStore } from "../lib/api";
import type { AuthResponse, LoginPayload, RegisterPayload, User } from "../lib/types";

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (p: LoginPayload) => Promise<User>;
  register: (p: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
}
const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on load: refresh -> profile
  useEffect(() => {
    (async () => {
      try {
        if (tokenStore.refresh && (await refreshSession())) setUser(await api.profile());
      } catch { tokenStore.clear(); }
      finally { setLoading(false); }
    })();
  }, []);

  const accept = (r: AuthResponse) => {
    tokenStore.access = r.access; tokenStore.refresh = r.refresh; setUser(r.user); return r.user;
  };
  const login = useCallback(async (p: LoginPayload) => accept(await api.login(p)), []);
  const register = useCallback(async (p: RegisterPayload) => accept(await api.register(p)), []);
  const logout = useCallback(async () => {
    try { await api.logout(); } catch { /* still clear locally */ }
    tokenStore.clear(); setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading, login, register, logout]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useAuth = () => { const c = useContext(Ctx); if (!c) throw new Error("AuthProvider missing"); return c; };
