import { useState } from "react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { UtensilsCrossed, TrendingUp, BookOpen, Target, AlertTriangle, CheckCircle, ArrowLeft } from "lucide-react"
import { trueCostCalculator, type TrueCostResult } from "@/lib/true-cost-calculator"
import { cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_ANALYSIS = trueCostCalculator.calculate({
  selling_price: 85,
  food_cost_pct: 34,
  labor_pct: 22,
  overhead_pct: 12,
  packaging_pct: 3,
  delivery_commission_pct: 6,
  wastage_pct: 4,
  marketing_pct: 5,
  target_food_cost_pct: 30,
})

type RecipeRow = {
  dish: string
  dishAr: string
  trueCost: number
  sellingPrice: number
  marginPct: number
  status: "star" | "watch" | "cut"
}

const MOCK_RECIPES: RecipeRow[] = [
  { dish: "Grilled Lamb Ribs", dishAr: "ضلوع خروف مشوية", trueCost: 52, sellingPrice: 130, marginPct: 60, status: "star" },
  { dish: "Chicken Mandi", dishAr: "مندي دجاج", trueCost: 28, sellingPrice: 75, marginPct: 62.7, status: "star" },
  { dish: "Mixed Grill Platter", dishAr: "طبق مشاوي مشكلة", trueCost: 68, sellingPrice: 145, marginPct: 53.1, status: "watch" },
  { dish: "Seafood Rice", dishAr: "أرز بالمأكولات البحرية", trueCost: 72, sellingPrice: 110, marginPct: 34.5, status: "watch" },
  { dish: "Lamb Ouzi", dishAr: "أوزي لحم", trueCost: 89, sellingPrice: 120, marginPct: 25.8, status: "cut" },
  { dish: "Hummus & Bread", dishAr: "حمص وخبز", trueCost: 8, sellingPrice: 22, marginPct: 63.6, status: "star" },
  { dish: "Stuffed Vine Leaves", dishAr: "ورق عنب محشي", trueCost: 18, sellingPrice: 35, marginPct: 48.6, status: "watch" },
  { dish: "Baklava Platter", dishAr: "طبق بقلاوة", trueCost: 22, sellingPrice: 40, marginPct: 45, status: "watch" },
]

// Risk radar mock: 4-quadrant (Stars / Hidden Gems / Cash Cows / Dead Weight)
type RadarPoint = {
  dish: string
  x: number // popularity 0-100
  y: number // margin 0-100
}

const RADAR_POINTS: RadarPoint[] = [
  { dish: "Grilled Lamb Ribs", x: 82, y: 60 },
  { dish: "Chicken Mandi", x: 91, y: 63 },
  { dish: "Mixed Grill Platter", x: 65, y: 53 },
  { dish: "Seafood Rice", x: 40, y: 35 },
  { dish: "Lamb Ouzi", x: 28, y: 26 },
  { dish: "Hummus & Bread", x: 88, y: 64 },
  { dish: "Stuffed Vine Leaves", x: 52, y: 49 },
  { dish: "Baklava Platter", x: 44, y: 45 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SLICE_COLORS = [
  "#9b2335", // Food Cost — oxblood
  "#e07b39", // Labor — ember
  "#c4a882", // Overhead — sand
  "#5b8fa8", // Packaging — steel
  "#8b5e83", // Delivery — mauve
  "#b8860b", // Wastage — dark gold
  "#4a7c59", // Marketing — forest
]

const STATUS_CONFIG = {
  star: { label: "Star", cls: "bg-green-100 text-green-700" },
  watch: { label: "Watch", cls: "bg-amber-100 text-amber-700" },
  cut: { label: "Cut", cls: "bg-red-100 text-red-600" },
}

// ─── Tab 1: True Cost Donut ───────────────────────────────────────────────────

function TrueCostTab({ result }: { result: TrueCostResult }) {
  const pieData = result.components.map((c) => ({
    name: c.name,
    value: c.pct,
    amount: c.amount,
  }))

  // Add net margin as a slice
  const netSlice = {
    name: "Net Margin",
    value: Math.max(0, result.net_margin_pct),
    amount: result.net_margin,
  }
  const allSlices = [...pieData, { ...netSlice }]
  const allColors = [...SLICE_COLORS, "#22c55e"]

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {result.alerts.length > 0 && (
        <div className="space-y-2">
          {result.alerts.map((alert, i) => (
            <div
              key={i}
              className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-sm"
            >
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">{alert}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Donut */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={allSlices}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={2}
                dataKey="value"
              >
                {allSlices.map((_, index) => (
                  <Cell key={index} fill={allColors[index % allColors.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [`${value}%`, name]}
                contentStyle={{ fontSize: 12, borderRadius: 4 }}
              />
              <Legend
                iconSize={8}
                formatter={(value) => (
                  <span style={{ fontSize: 11 }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Summary cards */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted/50 rounded-sm p-3">
              <p className="text-[10px] text-muted-foreground">Selling Price</p>
              <p className="text-lg font-bold font-mono-ed text-foreground">
                {MOCK_ANALYSIS.components[0] ? "SAR 85" : "—"}
              </p>
            </div>
            <div className="bg-muted/50 rounded-sm p-3">
              <p className="text-[10px] text-muted-foreground">True Cost Total</p>
              <p className="text-lg font-bold font-mono-ed text-foreground">
                SAR {result.true_cost_total.toFixed(2)}
              </p>
            </div>
            <div
              className={cn(
                "col-span-2 rounded-sm p-3",
                result.is_profitable ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200",
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground">Net Margin</p>
                  <p
                    className={cn(
                      "text-xl font-bold font-mono-ed",
                      result.is_profitable ? "text-green-700" : "text-red-600",
                    )}
                  >
                    SAR {result.net_margin.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground">Margin %</p>
                  <p
                    className={cn(
                      "text-xl font-bold font-mono-ed",
                      result.net_margin_pct >= 20
                        ? "text-green-700"
                        : result.net_margin_pct >= 10
                          ? "text-amber-600"
                          : "text-red-600",
                    )}
                  >
                    {result.net_margin_pct.toFixed(1)}%
                  </p>
                </div>
                {result.is_profitable ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                )}
              </div>
            </div>
          </div>

          {/* Component breakdown */}
          <div className="space-y-1.5">
            {result.components.map((c, i) => (
              <div key={c.name} className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: SLICE_COLORS[i] }}
                />
                <span className="text-xs text-muted-foreground flex-1">{c.name}</span>
                <span className="text-xs font-mono-ed text-foreground">{c.pct}%</span>
                <span className="text-xs font-mono-ed text-muted-foreground w-16 text-right">
                  SAR {c.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Tab 2: Recipe Table ──────────────────────────────────────────────────────

function RecipeTab() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-3 text-xs font-mono-ed uppercase tracking-wider text-muted-foreground font-normal">
              Dish
            </th>
            <th className="text-right py-3 px-3 text-xs font-mono-ed uppercase tracking-wider text-muted-foreground font-normal">
              True Cost
            </th>
            <th className="text-right py-3 px-3 text-xs font-mono-ed uppercase tracking-wider text-muted-foreground font-normal">
              Price
            </th>
            <th className="text-right py-3 px-3 text-xs font-mono-ed uppercase tracking-wider text-muted-foreground font-normal">
              Margin %
            </th>
            <th className="text-center py-3 px-3 text-xs font-mono-ed uppercase tracking-wider text-muted-foreground font-normal">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {MOCK_RECIPES.map((row) => (
            <tr key={row.dish} className="hover:bg-muted/30 transition-colors">
              <td className="py-3 px-3">
                <p className="font-medium text-foreground">{row.dish}</p>
                <p className="text-xs text-muted-foreground font-mono-ed" dir="rtl">
                  {row.dishAr}
                </p>
              </td>
              <td className="py-3 px-3 text-right font-mono-ed text-foreground">
                SAR {row.trueCost}
              </td>
              <td className="py-3 px-3 text-right font-mono-ed text-foreground">
                SAR {row.sellingPrice}
              </td>
              <td
                className={cn(
                  "py-3 px-3 text-right font-mono-ed font-semibold",
                  row.marginPct >= 55
                    ? "text-green-600"
                    : row.marginPct >= 40
                      ? "text-amber-600"
                      : "text-red-600",
                )}
              >
                {row.marginPct.toFixed(1)}%
              </td>
              <td className="py-3 px-3 text-center">
                <span
                  className={cn(
                    "inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-sm",
                    STATUS_CONFIG[row.status].cls,
                  )}
                >
                  {STATUS_CONFIG[row.status].label}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Tab 3: Risk Radar ────────────────────────────────────────────────────────

function RiskRadarTab() {
  const W = 480
  const H = 400
  const CX = W / 2
  const CY = H / 2
  const PAD = 48

  function toSvgX(popularity: number) {
    return PAD + (popularity / 100) * (W - PAD * 2)
  }
  function toSvgY(margin: number) {
    return H - PAD - (margin / 100) * (H - PAD * 2)
  }

  const quadrants = [
    { label: "Stars", subLabel: "High pop · High margin", x: CX + 10, y: PAD + 16, cls: "fill-green-600" },
    { label: "Hidden Gems", subLabel: "Low pop · High margin", x: PAD + 4, y: PAD + 16, cls: "fill-sky-600" },
    { label: "Cash Cows", subLabel: "High pop · Low margin", x: CX + 10, y: H - PAD - 6, cls: "fill-amber-600" },
    { label: "Dead Weight", subLabel: "Low pop · Low margin", x: PAD + 4, y: H - PAD - 6, cls: "fill-red-500" },
  ]

  const pointColors: Record<RadarPoint["dish"], string> = {}
  RADAR_POINTS.forEach((p) => {
    const isStar = p.x >= 50 && p.y >= 50
    const isHidden = p.x < 50 && p.y >= 50
    const isCow = p.x >= 50 && p.y < 50
    pointColors[p.dish] = isStar
      ? "#16a34a"
      : isHidden
        ? "#0284c7"
        : isCow
          ? "#d97706"
          : "#dc2626"
  })

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Plot of each dish by popularity (x-axis) vs. margin % (y-axis). Use this to prioritise which
        dishes to promote, reprice, or remove.
      </p>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width={W}
          height={H}
          className="max-w-full"
          style={{ fontFamily: "inherit" }}
        >
          {/* Quadrant backgrounds */}
          <rect x={CX} y={PAD} width={W / 2 - PAD} height={H / 2 - PAD} fill="#dcfce7" fillOpacity={0.5} />
          <rect x={PAD} y={PAD} width={W / 2 - PAD} height={H / 2 - PAD} fill="#e0f2fe" fillOpacity={0.5} />
          <rect x={CX} y={CY} width={W / 2 - PAD} height={H / 2 - PAD} fill="#fef9c3" fillOpacity={0.5} />
          <rect x={PAD} y={CY} width={W / 2 - PAD} height={H / 2 - PAD} fill="#fee2e2" fillOpacity={0.5} />

          {/* Grid lines */}
          <line x1={CX} y1={PAD} x2={CX} y2={H - PAD} stroke="#94a3b8" strokeWidth={1} strokeDasharray="4,3" />
          <line x1={PAD} y1={CY} x2={W - PAD} y2={CY} stroke="#94a3b8" strokeWidth={1} strokeDasharray="4,3" />

          {/* Axes */}
          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#475569" strokeWidth={1.5} />
          <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#475569" strokeWidth={1.5} />

          {/* Axis labels */}
          <text x={W / 2} y={H - 8} textAnchor="middle" fontSize={11} fill="#64748b">
            Popularity →
          </text>
          <text
            x={12}
            y={H / 2}
            textAnchor="middle"
            fontSize={11}
            fill="#64748b"
            transform={`rotate(-90, 12, ${H / 2})`}
          >
            Margin % →
          </text>

          {/* Quadrant labels */}
          {quadrants.map((q) => (
            <g key={q.label}>
              <text x={q.x} y={q.y} fontSize={11} fontWeight="600" className={q.cls} fill="currentColor">
                {q.label}
              </text>
              <text x={q.x} y={q.y + 13} fontSize={9} fill="#94a3b8">
                {q.subLabel}
              </text>
            </g>
          ))}

          {/* Data points */}
          {RADAR_POINTS.map((p) => {
            const sx = toSvgX(p.x)
            const sy = toSvgY(p.y)
            const color = pointColors[p.dish]
            return (
              <g key={p.dish}>
                <circle cx={sx} cy={sy} r={7} fill={color} fillOpacity={0.85} />
                <circle cx={sx} cy={sy} r={7} fill="none" stroke={color} strokeWidth={1.5} />
                <text
                  x={sx + 10}
                  y={sy + 4}
                  fontSize={9}
                  fill="#334155"
                  style={{ userSelect: "none" }}
                >
                  {p.dish.split(" ").slice(0, 2).join(" ")}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {[
          { color: "#16a34a", label: "Stars — promote & price up" },
          { color: "#0284c7", label: "Hidden Gems — drive traffic" },
          { color: "#d97706", label: "Cash Cows — maintain volume" },
          { color: "#dc2626", label: "Dead Weight — reprice or cut" },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

type TabId = "cost" | "recipes" | "radar"

const TABS: Array<{ id: TabId; label: string; icon: React.ElementType }> = [
  { id: "cost", label: "True Cost", icon: TrendingUp },
  { id: "recipes", label: "Recipe Table", icon: BookOpen },
  { id: "radar", label: "Risk Radar", icon: Target },
]

export default function RestaurantDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("cost")
  const navigate = useNavigate()

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
          <UtensilsCrossed className="w-4 h-4 text-[hsl(var(--primary))]" />
          <span className="font-display text-base font-semibold text-foreground">
            Kitchen Intelligence
          </span>
        </div>
        <span className="text-xs text-muted-foreground font-mono-ed" dir="rtl">
          ذكاء المطبخ
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
          <h2 className="font-display text-xl font-bold text-foreground">
            {activeTab === "cost" && "True Cost Breakdown"}
            {activeTab === "recipes" && "Recipe Costing"}
            {activeTab === "radar" && "Menu Risk Radar"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {activeTab === "cost" && "Full cost anatomy per dish — includes food, labour, overhead, wastage and delivery."}
            {activeTab === "recipes" && "Per-dish true cost, selling price and margin health for the Najd Kitchen menu."}
            {activeTab === "radar" && "Quadrant analysis: popularity vs. margin. Identify what to promote, reprice, or cut."}
          </p>
        </div>

        <div className="bg-card border border-border rounded-sm p-5">
          {activeTab === "cost" && <TrueCostTab result={MOCK_ANALYSIS} />}
          {activeTab === "recipes" && <RecipeTab />}
          {activeTab === "radar" && <RiskRadarTab />}
        </div>
      </main>
    </div>
  )
}
