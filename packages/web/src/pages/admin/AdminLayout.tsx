import { useEffect } from "react"
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom"
import {
  Users, BarChart2, Flag, Cpu, LayoutDashboard, LogOut,
} from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { cn } from "@/lib/utils"

const NAV = [
  { to: "/admin/tenants",       icon: Users,         label: "Tenants" },
  { to: "/admin/metrics",       icon: BarChart2,     label: "Metrics" },
  { to: "/admin/feature-flags", icon: Flag,          label: "Feature Flags" },
  { to: "/admin/ai-controls",   icon: Cpu,           label: "AI Controls" },
]

export default function AdminLayout() {
  const navigate  = useNavigate()
  const user      = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      navigate("/dashboard", { replace: true })
    }
  }, [user, isLoading, navigate])

  if (isLoading || !user || user.role !== "admin") return null

  return (
    <div className="flex min-h-screen bg-background font-sans">
      {/* Sidebar */}
      <aside className="w-52 shrink-0 border-r border-border bg-card flex flex-col">
        <div className="h-14 border-b border-border px-5 flex items-center gap-2">
          <span className="font-display text-sm font-semibold text-oxblood">Cezar 12</span>
          <span className="font-mono-ed text-[9px] uppercase tracking-[0.2em] bg-oxblood text-cream px-1.5 py-0.5 rounded-sm">
            Admin
          </span>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-0.5">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-sm text-sm transition-colors",
                  isActive
                    ? "bg-oxblood text-cream"
                    : "text-foreground/70 hover:bg-secondary hover:text-foreground"
                )
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="font-mono-ed text-[11px] uppercase tracking-[0.15em]">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border space-y-0.5">
          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 px-3 py-2 rounded-sm text-sm text-foreground/50 hover:text-foreground hover:bg-secondary transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span className="font-mono-ed text-[11px] uppercase tracking-[0.15em]">App</span>
          </Link>
          <div className="px-3 py-2">
            <p className="font-mono-ed text-[10px] text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
