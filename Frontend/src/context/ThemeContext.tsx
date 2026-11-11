import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ThemePref = "light" | "dark" | "system";
const KEY = "pt-theme";
const Ctx = createContext<{ pref: ThemePref; setPref: (p: ThemePref) => void } | null>(null);

const resolve = (p: ThemePref) =>
  p === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : p;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [pref, setPrefState] = useState<ThemePref>(() => (localStorage.getItem(KEY) as ThemePref) || "system");

  useEffect(() => {
    const apply = () => { document.documentElement.dataset.theme = resolve(pref); };
    apply();
    if (pref !== "system") return;
    const mq = matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply); // follow OS changes live
    return () => mq.removeEventListener("change", apply);
  }, [pref]);

  const value = useMemo(
    () => ({ pref, setPref: (p: ThemePref) => { localStorage.setItem(KEY, p); setPrefState(p); } }),
    [pref],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useTheme = () => { const c = useContext(Ctx); if (!c) throw new Error("ThemeProvider missing"); return c; };
