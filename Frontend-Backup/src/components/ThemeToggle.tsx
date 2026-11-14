import { useTheme, type ThemePref } from "../context/ThemeContext";

const OPTIONS: { v: ThemePref; label: string }[] = [
  { v: "light", label: "Light" }, { v: "dark", label: "Dark" }, { v: "system", label: "System" },
];

export default function ThemeToggle() {
  const { pref, setPref } = useTheme();
  return (
    <div className="seg" role="radiogroup" aria-label="Theme">
      {OPTIONS.map((o) => (
        <button key={o.v} type="button" role="radio" aria-checked={pref === o.v} className={pref === o.v ? "on" : ""} onClick={() => setPref(o.v)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
