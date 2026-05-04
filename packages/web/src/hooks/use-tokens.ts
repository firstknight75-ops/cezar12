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
