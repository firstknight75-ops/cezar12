'use client'

import { useState } from 'react'
import { Bell, CheckCircle, Zap, FileText } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

const MOCK_NOTIFICATIONS = [
  { id: '1', icon: Zap, title: 'تم اكتمال خطة النمو', time: 'منذ ٥ دقائق', read: false },
  { id: '2', icon: CheckCircle, title: 'تمت الموافقة على تقريرك', time: 'منذ ساعة', read: false },
  { id: '3', icon: FileText, title: 'تقرير جديد متاح للمراجعة', time: 'منذ ٣ ساعات', read: true },
]

export function NotificationsPanel() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
  const unread = notifications.filter((n) => !n.read).length

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute end-1.5 top-1.5 flex h-2 w-2 items-center justify-center rounded-full bg-red-500" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-3 py-2">
          <DropdownMenuLabel className="px-0 py-0 text-sm font-semibold text-slate-200">الإشعارات</DropdownMenuLabel>
          {unread > 0 && (
            <Button variant="ghost" size="sm" className="h-auto px-2 py-1 text-xs" onClick={markAllRead}>
              تحديد الكل كمقروء
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-72 overflow-y-auto">
          {notifications.map((n) => {
            const Icon = n.icon
            return (
              <div
                key={n.id}
                className={`flex items-start gap-3 px-3 py-3 hover:bg-slate-800 transition-colors ${!n.read ? 'bg-blue-500/5' : ''}`}
              >
                <div className="mt-0.5 rounded-full bg-slate-800 p-1.5">
                  <Icon className="h-3.5 w-3.5 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 leading-snug">{n.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{n.time}</p>
                </div>
                {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
              </div>
            )
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
