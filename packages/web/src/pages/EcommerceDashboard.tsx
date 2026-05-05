import { useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts"
import {
  ShoppingCart,
  TrendingUp,
  Package,
  PieChart as PieIcon,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"

// ─── Mock data ────────────────────────────────────────────────────────────────

const UNIT_ECONOMICS = {
  selling_price: 250,
  cost_of_goods: 110,
  gross_margin: 140,
  gross_margin_pct: 56,
  marketing_spend: 35,
  fulfillment_cost: 18,
  platform_fee_pct: 5,
  platform_fee: 12.5,
  net_margin: 74.5,
  net_margin_pct: 29.8,
  break_even_units: 129,
  monthly_fixed_costs: 18_000,
}

const PRODUCT_MIX = [
  { name: "Electronics",    nameAr: "الإلكترونيات",  revenue: 87_500, margin_pct: 38, units: 350, status: "star" as const },
  { name: "Home & Kitchen", nameAr: "المنزل والمطبخ", revenue: 54_200, margin_pct: 52, units: 481, status: "star" as const },
  { name: "Fashion",        nameAr: "الأزياء",        revenue: 41_100, margin_pct: 61, units: 274, status: "watch" as const },
  { name: "Sports",         nameAr: "الرياضة",        revenue: 28_300, margin_pct: 44, units: 188, status: "watch" as const },
  { name: "Beauty",         nameAr: "التجميل",        revenue: 19_700, margin_pct: 67, units: 197, status: "gem" as const },
  { name: "Toys",           nameAr: "الألعاب",        revenue: 8_400,  margin_pct: 29, units: 84,  status: "cut" as const },
]

const CHANNEL_DATA = [
  { channel: "Organic",   channelAr: "البحث الطبيعي", revenue: 72_000, cac: 0,   roas: null,  orders: 432 },
  { channel: "Paid Meta", channelAr: "ميتا المدفوع",   revenue: 61_000, cac: 38,  roas: 4.2,   orders: 244 },
  { channel: "Paid Google", channelAr: "جوجل المدفوع",  revenue: 48_500, cac: 51,  roas: 3.1,   orders: 194 },
  { channel: "Referral",  channelAr: "الإحالة",       revenue: 29_000, cac: 12,  roas: null,  orders: 174 },
  { channel: "Email",     channelAr: "البريد",        revenue: 14_700, cac: 4,   roas: null,  orders: 147 },
  { channel: "TikTok",    channelAr: "تيك توك",       revenue: 13_800, cac: 62,  roas: 2.2,   orders: 55  },
]

const REVENUE_TREND = [
  { month: "Jan", revenue: 148_000, orders: 592 },
  { month: "Feb", revenue: 162_000, orders: 648 },
  { month: "Mar", revenue: 155_000, orders: 620 },
  { month: "Apr", revenue: 189_000, orders: 756 },
  { month: "May", revenue: 204_000, orders: 816 },
  { month: "Jun", revenue: 239_200, orders: 957 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  star:  { label: "Star",        cls: "bg-green-100 text-green-700" },
  gem:   { label: "Hidden Gem",  cls: "bg-sky-100 text-sky-700" },
  watch: { label: "Watch",       cls: "bg-amber-100 text-amber-700" },
  cut:   { label: "Reprice",     cls: "bg-red-100 text-red-600" },
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toFixed(0)
}

// ─── Tab 1: Unit Economics ────────────────────────────────────────────────────

function UnitEconomicsTab() {
  const e = UNIT_ECONOMICS
  const alerts: string[] = []
  if (e.net_margin_pct < 20) alerts.push("Net margin below 20% — review marketing or COGS.")
  if (e.platform_fee_pct > 5) alerts.push("Platform fee above 5% — consider direct channel mix.")

  const waterfall = [
    { label: "Selling Price",   value: e.selling_price,      cumulative: e.selling_price,    positive: true },
    { label: "COGS",            value: -e.cost_of_goods,     cumulative: e.gross_margin,     positive: false },
    { label: "Marketing",       value: -e.marketing_spend,   cumulative: e.gross_margin - e.marketing_spend, positive: false },
    { label: "Fulfillment",     value: -e.fulfillment_cost,  cumulative: e.gross_margin - e.marketing_spend - e.fulfillment_cost, positive: false },
    { label: "Platform Fee",    value: -e.platform_fee,      cumulative: e.net_margin,       positive: false },
    { label: "Net Margin",      value: e.net_margin,         cumulative: e.net_margin,       positive: true },
  ]

  return (
    <div className="space-y-6">
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <div key={i} className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-sm">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">{a}</p>
            </div>
          ))}
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Selling Price", value: `SAR ${e.selling_price}` },
          { label: "Gross Margin", value: `${e.gross_margin_pct}%`, highlight: e.gross_margin_pct >= 50 },
          { label: "Net Margin", value: `${e.net_margin_pct.toFixed(1)}%`, highlight: e.net_margin_pct >= 20 },
          { label: "Break-even Units", value: fmt(e.break_even_units) },
        ].map((k) => (
          <div key={k.label} className="bg-muted/50 rounded-sm p-4">
            <p className="text-[10px] text-muted-foreground mb-1">{k.label}</p>
            <p className={cn("text-xl font-bold font-mono-ed", k.highlight ? "text-green-600" : "text-foreground")}>
              {k.value}
            </p>
          </div>
        ))}
      </div>

      {/* Waterfall bar chart */}
      <div>
        <p className="text-xs font-mono-ed uppercase tracking-widest text-muted-foreground mb-4">
          Per-Unit Profitability Breakdown (SAR)
        </p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={waterfall} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => [`SAR ${Math.abs(v).toFixed(2)}`]} contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                {waterfall.map((entry, i) => (
                  <Cell key={i} fill={entry.positive ? "#9b2335" : "#e07b39"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cost breakdown rows */}
      <div className="space-y-2">
        {[
          { label: "Cost of Goods Sold", amount: e.cost_of_goods, pct: (e.cost_of_goods / e.selling_price * 100).toFixed(1) },
          { label: "Marketing Spend", amount: e.marketing_spend, pct: (e.marketing_spend / e.selling_price * 100).toFixed(1) },
          { label: "Fulfillment Cost", amount: e.fulfillment_cost, pct: (e.fulfillment_cost / e.selling_price * 100).toFixed(1) },
          { label: "Platform Fee", amount: e.platform_fee, pct: e.platform_fee_pct.toFixed(1) },
        ].map((row) => (
          <div key={row.label} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground flex-1">{row.label}</span>
            <span className="text-xs font-mono-ed text-foreground w-20 text-right">SAR {row.amount.toFixed(2)}</span>
            <span className="text-xs font-mono-ed text-muted-foreground w-10 text-right">{row.pct}%</span>
          </div>
        ))}
        <div className="border-t border-border pt-2 flex items-center gap-3">
          <span className="text-xs font-semibold text-foreground flex-1">Net Margin per Unit</span>
          <span className={cn("text-xs font-bold font-mono-ed w-20 text-right", e.net_margin_pct >= 20 ? "text-green-600" : "text-red-600")}>
            SAR {e.net_margin.toFixed(2)}
          </span>
          <span className={cn("text-xs font-bold font-mono-ed w-10 text-right", e.net_margin_pct >= 20 ? "text-green-600" : "text-red-600")}>
            {e.net_margin_pct.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Tab 2: Product Mix ───────────────────────────────────────────────────────

function ProductMixTab() {
  return (
    <div className="space-y-6">
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={PRODUCT_MIX} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip
              formatter={(v: number, name: string) => [
                name === "margin_pct" ? `${v}%` : `SAR ${fmt(v)}`,
                name === "margin_pct" ? "Margin %" : "Revenue",
              ]}
              contentStyle={{ fontSize: 12 }}
            />
            <Legend iconSize={8} formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
            <Bar dataKey="revenue" name="Revenue (SAR)" fill="#9b2335" radius={[2, 2, 0, 0]} />
            <Bar dataKey="margin_pct" name="Margin %" fill="#e07b39" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border">
              {["Category", "Revenue", "Units", "Margin %", "Action"].map((h) => (
                <th key={h} className="text-left py-3 px-3 text-xs font-mono-ed uppercase tracking-wider text-muted-foreground font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {PRODUCT_MIX.map((row) => (
              <tr key={row.name} className="hover:bg-muted/30 transition-colors">
                <td className="py-3 px-3">
                  <p className="font-medium text-foreground">{row.name}</p>
                  <p className="text-xs text-muted-foreground font-mono-ed" dir="rtl">{row.nameAr}</p>
                </td>
                <td className="py-3 px-3 font-mono-ed text-foreground">SAR {fmt(row.revenue)}</td>
                <td className="py-3 px-3 font-mono-ed text-foreground">{row.units}</td>
                <td className={cn(
                  "py-3 px-3 font-mono-ed font-semibold",
                  row.margin_pct >= 55 ? "text-green-600" : row.margin_pct >= 40 ? "text-amber-600" : "text-red-600",
                )}>
                  {row.margin_pct}%
                </td>
                <td className="py-3 px-3">
                  <span className={cn(
                    "inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-sm",
                    STATUS_CONFIG[row.status].cls,
                  )}>
                    {STATUS_CONFIG[row.status].label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Tab 3: Channel Profitability ─────────────────────────────────────────────

function ChannelTab() {
  return (
    <div className="space-y-6">
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={CHANNEL_DATA} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
            <XAxis dataKey="channel" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip
              formatter={(v: number) => [`SAR ${fmt(v)}`, "Revenue"]}
              contentStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="revenue" name="Revenue" fill="#9b2335" radius={[2, 2, 0, 0]}>
              {CHANNEL_DATA.map((_, i) => (
                <Cell key={i} fill={i % 2 === 0 ? "#9b2335" : "#e07b39"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border">
              {["Channel", "Revenue", "Orders", "CAC (SAR)", "ROAS"].map((h) => (
                <th key={h} className="text-left py-3 px-3 text-xs font-mono-ed uppercase tracking-wider text-muted-foreground font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {CHANNEL_DATA.map((row) => (
              <tr key={row.channel} className="hover:bg-muted/30 transition-colors">
                <td className="py-3 px-3">
                  <p className="font-medium text-foreground">{row.channel}</p>
                  <p className="text-xs text-muted-foreground font-mono-ed" dir="rtl">{row.channelAr}</p>
                </td>
                <td className="py-3 px-3 font-mono-ed text-foreground">SAR {fmt(row.revenue)}</td>
                <td className="py-3 px-3 font-mono-ed text-foreground">{row.orders}</td>
                <td className="py-3 px-3 font-mono-ed text-foreground">
                  {row.cac === 0 ? <span className="text-green-600 font-semibold">Free</span> : `SAR ${row.cac}`}
                </td>
                <td className={cn(
                  "py-3 px-3 font-mono-ed font-semibold",
                  row.roas === null ? "text-muted-foreground" :
                    row.roas >= 3 ? "text-green-600" : row.roas >= 2 ? "text-amber-600" : "text-red-600",
                )}>
                  {row.roas === null ? "—" : `${row.roas}×`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Revenue trend */}
      <div>
        <p className="text-xs font-mono-ed uppercase tracking-widest text-muted-foreground mb-4">
          6-Month Revenue Trend
        </p>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={REVENUE_TREND} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(v: number) => [`SAR ${fmt(v)}`]}
                contentStyle={{ fontSize: 12 }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#9b2335" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

type TabId = "unit" | "mix" | "channel"

const TABS: Array<{ id: TabId; label: string; labelAr: string; icon: React.ElementType }> = [
  { id: "unit",    label: "Unit Economics",       labelAr: "اقتصاديات الوحدة",  icon: TrendingUp },
  { id: "mix",     label: "Product Mix",          labelAr: "مزيج المنتجات",     icon: Package },
  { id: "channel", label: "Channel Profitability",labelAr: "ربحية القنوات",     icon: PieIcon },
]

export default function EcommerceDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("unit")
  const navigate = useNavigate()

  const tab = TABS.find((t) => t.id === activeTab)!

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] font-sans">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card px-6 flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Dashboard
        </button>
        <span className="text-border/60">|</span>
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-[hsl(var(--primary))]" />
          <span className="font-display text-base font-semibold text-foreground">
            E-Commerce Intelligence
          </span>
        </div>
        <span className="text-xs text-muted-foreground font-mono-ed" dir="rtl">
          ذكاء التجارة الإلكترونية
        </span>
      </header>

      {/* Tab bar */}
      <div className="border-b border-border bg-card/50 px-6">
        <div className="flex gap-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={cn(
                "inline-flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-all",
                activeTab === id
                  ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-6">
        <div className="mb-5">
          <h2 className="font-display text-xl font-bold text-foreground">{tab.label}</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-muted-foreground">
              {activeTab === "unit" && "Full per-unit profitability breakdown — COGS, marketing, fulfillment, platform fees."}
              {activeTab === "mix" && "Revenue and margin analysis by product category. Identify stars, gems, and dead weight."}
              {activeTab === "channel" && "Revenue contribution and acquisition cost by marketing channel. Track ROAS efficiency."}
            </p>
            <span className="text-xs font-mono-ed text-muted-foreground" dir="rtl">· {tab.labelAr}</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-sm p-5">
          {activeTab === "unit" && <UnitEconomicsTab />}
          {activeTab === "mix" && <ProductMixTab />}
          {activeTab === "channel" && <ChannelTab />}
        </div>
      </main>
    </div>
  )
}
