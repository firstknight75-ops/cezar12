import { ReactNode } from "react";

interface Props {
  label: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
}

export default function Field({ label, error, hint, children }: Props) {
  return (
    <div className="space-y-1.5">
      <label className="block font-mono-ed text-[10px] uppercase tracking-[0.2em] text-ink/70">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <div className="text-xs text-muted-foreground">{hint}</div>
      ) : null}
    </div>
  );
}

export const inputClass =
  "w-full h-11 px-3 bg-cream border border-ink/25 rounded-sm text-ink placeholder:text-ink/35 focus:outline-none focus:border-oxblood focus:ring-1 focus:ring-oxblood transition-colors";
