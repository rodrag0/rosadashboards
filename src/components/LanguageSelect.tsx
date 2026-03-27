import type { Language } from "../appTypes";
import { languageOptions } from "../i18n";

const languageLabels: Record<Language, string> = {
  en: "EN",
  es: "ES",
  de: "DE",
};

interface LanguageSelectProps {
  label: string;
  value: Language;
  onChange: (language: Language) => void;
}

export function LanguageSelect({ label, value, onChange }: LanguageSelectProps) {
  return (
    <label className="control-select-wrap">
      <span className="sr-only">{label}</span>
      <select className="control-select" value={value} onChange={(event) => onChange(event.target.value as Language)} title={label}>
        {languageOptions.map((option) => (
          <option key={option} value={option}>
            {languageLabels[option]}
          </option>
        ))}
      </select>
      <span className="control-select-icon" aria-hidden="true">
        <svg viewBox="0 0 20 20" fill="none">
          <path d="m5.5 7.5 4.5 5 4.5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </label>
  );
}
