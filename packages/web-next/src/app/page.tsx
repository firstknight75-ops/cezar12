import { redirect } from 'next/navigation'

export function HomePage() {
  redirect('/dashboard')
}

export { HomePage as default }
