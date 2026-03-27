import type { Theme } from "../appTypes";

interface ThemeToggleButtonProps {
  theme: Theme;
  label: string;
  nextThemeLabel: string;
  onToggle: () => void;
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 2.75v2.1M12 19.15v2.1M21.25 12h-2.1M4.85 12h-2.1M18.54 5.46l-1.49 1.49M6.95 17.05l-1.49 1.49M18.54 18.54l-1.49-1.49M6.95 6.95 5.46 5.46" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19.15 14.79A7.7 7.7 0 1 1 9.2 4.85a6.45 6.45 0 1 0 9.95 9.94Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ThemeToggleButton({ theme, label, nextThemeLabel, onToggle }: ThemeToggleButtonProps) {
  const buttonLabel = `${label}: ${nextThemeLabel}`;

  return (
    <button type="button" className="theme-toggle" onClick={onToggle} aria-label={buttonLabel} title={buttonLabel}>
      {theme === "dark" ? <MoonIcon /> : <SunIcon />}
      <span className="sr-only">{buttonLabel}</span>
    </button>
  );
}
