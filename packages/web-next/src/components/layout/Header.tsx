'use client'

import { usePathname } from 'next/navigation'
import { LogOut, User, Settings } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { TokenBalance } from './TokenBalance'
import { NotificationsPanel } from './NotificationsPanel'
import { useAuthStore } from '@/store/useAuthStore'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'لوحة التحكم',
  '/projects': 'المشاريع',
  '/services': 'الخدمات',
  '/assets': 'الأصول',
  '/reports': 'التقارير',
  '/recommendations': 'التوصيات',
  '/packages': 'الباقات',
  '/settings': 'الإعدادات',
  '/restaurant': 'لوحة المطبخ',
  '/restaurant/recipes': 'الوصفات',
  '/restaurant/ingredients': 'المكونات',
  '/restaurant/suppliers': 'الموردون',
  '/restaurant/costs': 'التكاليف',
  '/restaurant/reports': 'التقارير',
}

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  const parent = Object.keys(PAGE_TITLES).find((k) => k !== '/' && pathname.startsWith(k))
  return parent ? PAGE_TITLES[parent] : 'سيزار ١٢'
}

export function Header() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900 px-6">
      <h2 className="text-base font-semibold text-slate-200">{getPageTitle(pathname)}</h2>
      <div className="flex items-center gap-3">
        <TokenBalance />
        <NotificationsPanel />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarFallback>{user?.name?.charAt(0) ?? 'م'}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-slate-200">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="h-4 w-4" />
              الملف الشخصي
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="h-4 w-4" />
              الإعدادات
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-400 hover:text-red-300">
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
