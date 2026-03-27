import type { ReactNode } from "react";

type ShareMode = "copy" | "whatsapp" | "x";

interface ShareIconButtonProps {
  mode: ShareMode;
  label: string;
  onClick: () => void;
  active?: boolean;
}

function IconWrapper({ children }: { children: ReactNode }) {
  return <span className="share-icon" aria-hidden="true">{children}</span>;
}

function CopyIcon() {
  return (
    <IconWrapper>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="10" height="10" rx="2" />
        <path d="M15 9V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      </svg>
    </IconWrapper>
  );
}

function CheckIcon() {
  return (
    <IconWrapper>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.5 9.2 16.7 19 7.3" />
      </svg>
    </IconWrapper>
  );
}

function WhatsappIcon() {
  return (
    <IconWrapper>
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.02 3.2a8.8 8.8 0 0 0-7.55 13.33L3 21l4.62-1.42a8.82 8.82 0 1 0 4.4-16.38Zm4.99 12.47c-.2.57-1.14 1.08-1.56 1.14-.4.06-.9.08-1.45-.1-.33-.1-.76-.25-1.31-.5-2.3-1-3.8-3.35-3.92-3.5-.12-.15-.94-1.25-.94-2.39 0-1.14.6-1.69.81-1.92.22-.23.48-.28.63-.28h.46c.15 0 .35-.06.54.4.2.48.68 1.67.74 1.79.06.12.1.28.02.44-.08.17-.12.28-.24.43-.12.14-.26.32-.36.43-.12.12-.24.25-.1.49.14.24.64 1.05 1.37 1.7.94.84 1.73 1.1 1.98 1.22.24.12.38.1.52-.06.14-.17.58-.68.74-.91.16-.23.32-.2.54-.12.22.08 1.4.66 1.64.78.24.12.4.18.46.28.06.1.06.6-.14 1.17Z" />
      </svg>
    </IconWrapper>
  );
}

function XIcon() {
  return (
    <IconWrapper>
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M14.18 10.31 21.03 3h-1.62l-5.95 6.35L8.7 3H3.25l7.18 9.52L3.25 21h1.62l6.28-6.7L15.9 21h5.45l-7.17-10.69Zm-2.21 2.36-.73-1.03-5.84-8.2h2.48l4.72 6.63.73 1.02 6.13 8.62h-2.48l-5.01-7.04Z" />
      </svg>
    </IconWrapper>
  );
}

export function ShareIconButton({ mode, label, onClick, active = false }: ShareIconButtonProps) {
  return (
    <button
      type="button"
      className={`share-chip share-chip--icon ${active ? "share-chip--success" : ""}`}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {mode === "copy" ? active ? <CheckIcon /> : <CopyIcon /> : null}
      {mode === "whatsapp" ? <WhatsappIcon /> : null}
      {mode === "x" ? <XIcon /> : null}
    </button>
  );
}
