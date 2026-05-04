'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type User = {
  id: string
  name: string
  email: string
  role: 'user' | 'admin' | 'support'
  plan: 'silver' | 'gold' | 'platinum'
  tokenBalance: number
}

type AuthState = {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: {
        id: '1',
        name: 'محمد أحمد',
        email: 'mohammed@example.com',
        role: 'user',
        plan: 'gold',
        tokenBalance: 250,
      },
      isAuthenticated: true,
      setUser: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'cezar12-auth' }
  )
)
