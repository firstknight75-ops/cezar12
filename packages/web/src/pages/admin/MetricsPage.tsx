import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts"
import { Users, UserPlus, Zap, DollarSign } from "lucide-react"

// ─── Mock data ────────────────────────────────────────────────────────────────

const DAU_DATA = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  users: Math.floor(Math.random() * 30 + 45),
}))

const SERVICE_USAGE = [
  { service: "Growth Plan",   calls: 142 },
  { service: "Marketing",     calls: 98  },
  { service: "Kitchen Intel", calls: 74  },
  { service: "Competitor",    calls: 61  },
  { service: "Rate Ladder",   calls: 49  },
  { service: "Pipeline",      calls: 38  },
]

const STATS = [
  { label: "DAU",               value: "68",      sub: "+4 from yesterday", icon: Users,       color: "text-oxblood" },
  { label: "New Signups Today", value: "7",        sub: "12 this week",      icon: UserPlus,    color: "text-emerald-600" },
  { label: "Tokens Used Today", value: "1,842",    sub: "of ~2,100 avg",     icon: Zap,         color: "text-amber-600" },
  { label: "Revenue MTD",       value: "SAR 41,200", sub: "↑ 8% vs last mo",  icon: DollarSign,  color: "text-sky-600" },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MetricsPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="font-display text-2xl text-foreground">Metrics</h1>
        <p className="font-mono-ed text-[11px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
          Platform-wide · Last updated just now
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="border border-border rounded-sm p-5 bg-card">
            <div className="flex items-center justify-between mb-3">
              <p className="font-mono-ed text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{label}</p>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="font-mono-ed text-2xl font-bold text-foreground">{value}</p>
            <p className="font-mono-ed text-[10px] text-muted-foreground mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* 30-day DAU line chart */}
      <div className="border border-border rounded-sm p-5 bg-card">
        <p className="font-mono-ed text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-4">
          Daily Active Users — Last 30 Days
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={DAU_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }}
              tickLine={false}
              axisLine={false}
              interval={4}
            />
            <YAxis
              tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                fontSize: 11,
                fontFamily: "JetBrains Mono",
                border: "1px solid hsl(var(--border))",
                borderRadius: 2,
                background: "hsl(var(--card))",
              }}
              cursor={{ stroke: "hsl(var(--oxblood))", strokeWidth: 1, strokeDasharray: "4 4" }}
            />
            <Line
              type="monotone"
              dataKey="users"
              stroke="hsl(var(--oxblood))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "hsl(var(--oxblood))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* AI service usage bar chart */}
      <div className="border border-border rounded-sm p-5 bg-card">
        <p className="font-mono-ed text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-4">
          AI Service Calls — This Month
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={SERVICE_USAGE}
            layout="vertical"
            margin={{ top: 0, right: 16, bottom: 0, left: 80 }}
          >
            <XAxis
              type="number"
              tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="service"
              tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <Tooltip
              contentStyle={{
                fontSize: 11,
                fontFamily: "JetBrains Mono",
                border: "1px solid hsl(var(--border))",
                borderRadius: 2,
                background: "hsl(var(--card))",
              }}
              cursor={{ fill: "hsl(var(--secondary))" }}
            />
            <Bar dataKey="calls" fill="hsl(var(--oxblood))" radius={[0, 2, 2, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
