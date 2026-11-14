import { Link } from "react-router-dom";

export default function Logo() {
  return (
    <Link to="/" className="logo" aria-label="PhantomTrace home">
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
        <path d="M4 21 C4 9, 8 4, 13 4 C18 4, 22 9, 22 21 L18.5 18 L15.5 21 L13 18.5 L10.5 21 L7.5 18 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="10.5" cy="12" r="1.4" fill="var(--accent)" /><circle cx="15.5" cy="12" r="1.4" fill="var(--accent)" />
      </svg>
      <span>PhantomTrace</span>
    </Link>
  );
}
