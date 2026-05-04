'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FolderOpen,
  Zap,
  Image,
  FileText,
  Lightbulb,
  ChefHat,
  BookOpen,
  Package,
  Truck,
  CreditCard,
  Settings,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/store/useAuthStore'

type NavItem = { href: string; label: string; icon: React.ElementType }

const mainNav: NavItem[] = [
  { href: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/projects', label: 'المشاريع', icon: FolderOpen },
  { href: '/services', label: 'الخدمات', icon: Zap },
  { href: '/assets', label: 'الأصول', icon: Image },
  { href: '/reports', label: 'التقارير', icon: FileText },
  { href: '/recommendations', label: 'التوصيات', icon: Lightbulb },
]

const restaurantNav: NavItem[] = [
  { href: '/restaurant', label: 'لوحة المطبخ', icon: ChefHat },
  { href: '/restaurant/recipes', label: 'الوصفات', icon: BookOpen },
  { href: '/restaurant/ingredients', label: 'المكونات', icon: Package },
  { href: '/restaurant/suppliers', label: 'الموردون', icon: Truck },
]

const accountNav: NavItem[] = [
  { href: '/packages', label: 'الباقات', icon: CreditCard },
  { href: '/settings', label: 'الإعدادات', icon: Settings },
]

function NavLink({ href, label, icon: Icon, active }: NavItem & { active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
        active
          ? 'bg-blue-600 text-white'
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100',
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href)

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-e border-slate-800 bg-slate-900">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-slate-800 px-4">
        <span className="text-xl font-bold text-blue-400">سيزار ١٢</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {mainNav.map((item) => (
          <NavLink key={item.href} {...item} active={isActive(item.href)} />
        ))}

        <Separator className="my-3" />
        <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-600">المطعم</p>
        {restaurantNav.map((item) => (
          <NavLink key={item.href} {...item} active={isActive(item.href)} />
        ))}

        <Separator className="my-3" />
        <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-600">الحساب</p>
        {accountNav.map((item) => (
          <NavLink key={item.href} {...item} active={isActive(item.href)} />
        ))}
      </nav>

      {/* User card */}
      <div className="border-t border-slate-800 p-3">
        <div className="flex items-center justify-between rounded-lg px-2 py-2">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{user?.name?.charAt(0) ?? 'م'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-slate-200">{user?.name ?? 'المستخدم'}</p>
              <p className="text-xs text-slate-500">مالك</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors"
            aria-label="تسجيل الخروج"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
