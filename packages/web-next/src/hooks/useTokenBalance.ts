'use client'

import { useAuthStore } from '@/store/useAuthStore'

type TokenBalanceResult = {
  balance: number
  isLoading: boolean
}

export function useTokenBalance(): TokenBalanceResult {
  const user = useAuthStore((s) => s.user)

  return {
    balance: user?.tokenBalance ?? 0,
    isLoading: false,
  }
}
