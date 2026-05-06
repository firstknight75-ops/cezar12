import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { BarChart2, Settings as SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navItem = (to: string, label: string, Icon: React.ElementType) => (
    <Link
      to={to}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium transition-colors",
        pathname === to
          ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
          : "text-foreground hover:bg-muted"
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] font-sans">
      <header className="h-14 border-b border-border bg-card px-6 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-[hsl(var(--primary))]" />
          <span className="font-display text-base font-semibold text-foreground">
            Cezar 12
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          {navItem("/dashboard", "Dashboard", BarChart2)}
          {navItem("/settings", "Settings", SettingsIcon)}
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
