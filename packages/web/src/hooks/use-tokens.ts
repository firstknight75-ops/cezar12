export type BillingCycle = "monthly" | "quarterly" | "annual"
export type PlanName = "silver" | "gold" | "platinum"

export type Plan = {
  name: PlanName
  label: string
  tokens: number
  popular?: boolean
  prices: Record<BillingCycle, number>
  /** % saved vs monthly, 0 for monthly */
  savings: Record<BillingCycle, number>
  badgeGradient: string
  borderClass: string
  accentClass: string
  labelClass: string
  features: string[]
}

export const PLANS: Plan[] = [
  {
    name: "silver",
    label: "Silver",
    tokens: 500,
    prices: { monthly: 49, quarterly: 44, annual: 37 },
    savings: { monthly: 0, quarterly: 10, annual: 25 },
    badgeGradient: "linear-gradient(135deg,#9E9E9E 0%,#E8E8E8 50%,#9E9E9E 100%)",
    borderClass: "border-[#B8B8B8]",
    accentClass: "bg-[#F7F7F7]",
    labelClass: "text-[#5E5E5E]",
    features: [
      "500 AI tokens / month",
      "Financial engine analysis",
      "Basic digital presence score",
      "Email support",
    ],
  },
  {
    name: "gold",
    label: "Gold",
    tokens: 1500,
    popular: true,
    prices: { monthly: 99, quarterly: 84, annual: 69 },
    savings: { monthly: 0, quarterly: 15, annual: 30 },
    badgeGradient: "linear-gradient(135deg,#B8860B 0%,#FFD700 50%,#B8860B 100%)",
    borderClass: "border-[#D4AC0D]",
    accentClass: "bg-amber-50/60",
    labelClass: "text-[#92660C]",
    features: [
      "1,500 AI tokens / month",
      "Everything in Silver",
      "Competitor analysis",
      "Kitchen Intelligence™",
      "Daily AI recommendations",
      "Priority support",
    ],
  },
  {
    name: "platinum",
    label: "Platinum",
    tokens: 5000,
    prices: { monthly: 199, quarterly: 159, annual: 129 },
    savings: { monthly: 0, quarterly: 20, annual: 35 },
    badgeGradient: "linear-gradient(135deg,#4A4A4A 0%,#D4D4D4 50%,#4A4A4A 100%)",
    borderClass: "border-oxblood",
    accentClass: "bg-oxblood/5",
    labelClass: "text-oxblood",
    features: [
      "5,000 AI tokens / month",
      "Everything in Gold",
      "Full integrated marketing plan",
      "Automated follow-up campaigns",
      "API access",
      "Dedicated account manager",
    ],
  },
]

export type AddonPackage = {
  name: string
  tokens: number
  price: number
  costPerToken: string
  highlight?: boolean
}

export const ADDON_PACKAGES: AddonPackage[] = [
  { name: "Micro", tokens: 200, price: 15, costPerToken: "$0.075" },
  { name: "Small", tokens: 500, price: 35, costPerToken: "$0.070" },
  { name: "Medium", tokens: 1500, price: 99, costPerToken: "$0.066", highlight: true },
  { name: "Large", tokens: 5000, price: 299, costPerToken: "$0.060" },
  { name: "Enterprise", tokens: 15000, price: 799, costPerToken: "$0.053" },
]

export const CYCLE_LABELS: Record<BillingCycle, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  annual: "Annual",
}

export const CYCLE_LABELS_AR: Record<BillingCycle, string> = {
  monthly: "شهري",
  quarterly: "ربع سنوي",
  annual: "سنوي",
}
---
import { useState } from "react"

export type TokenState = {
  planUsed: number
  planTotal: number
  addonBalance: number
}

export type UseTokensReturn = {
  tokens: TokenState
  totalRemaining: number
  isLow: boolean
  purchaseAddon: (packageTokens: number, packagePrice: number) => Promise<void>
}

const STORAGE_KEY = "cezar12_tokens_mock"

const DEFAULT_STATE: TokenState = {
  planUsed: 342,
  planTotal: 500,
  addonBalance: 150,
}

function loadState(): TokenState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? (JSON.parse(saved) as TokenState) : DEFAULT_STATE
  } catch {
    return DEFAULT_STATE
  }
}

export function useTokens(): UseTokensReturn {
  const [tokens, setTokens] = useState<TokenState>(loadState)

  const totalRemaining = tokens.planTotal - tokens.planUsed + tokens.addonBalance
  const isLow = totalRemaining < 50

  const purchaseAddon = async (packageTokens: number, _packagePrice: number) => {
    // POST /api/tokens/purchase — mocked
    await new Promise<void>((res) => setTimeout(res, 800))
    const next = { ...tokens, addonBalance: tokens.addonBalance + packageTokens }
    setTokens(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  return { tokens, totalRemaining, isLow, purchaseAddon }
}
