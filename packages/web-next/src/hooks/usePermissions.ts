'use client'

import { useAuthStore } from '@/store/useAuthStore'

type PermissionsResult = {
  isAdmin: boolean
  isSupport: boolean
  canAccessAdmin: boolean
}

export function usePermissions(): PermissionsResult {
  const user = useAuthStore((s) => s.user)

  const isAdmin = user?.role === 'admin'
  const isSupport = user?.role === 'support'
  const canAccessAdmin = isAdmin || isSupport

  return { isAdmin, isSupport, canAccessAdmin }
}
