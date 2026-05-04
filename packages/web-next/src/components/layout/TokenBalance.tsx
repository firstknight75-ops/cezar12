'use client'

import { Coins } from 'lucide-react'
import { useTokenBalance } from '@/hooks/useTokenBalance'

export function TokenBalance() {
  const { balance } = useTokenBalance()
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-sm text-blue-400">
      <Coins className="h-3.5 w-3.5" />
      <span>{balance.toLocaleString('ar-SA')} رمز</span>
    </div>
  )
}
