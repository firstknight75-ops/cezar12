import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: { typedRoutes: false },
}

export { nextConfig as default }
