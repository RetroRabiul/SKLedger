import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Settings as SettingsIcon,
  Shield,
  Sparkles,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useI18n } from '../../hooks/useI18n'
import { useProfile } from '../../hooks/useProfile'
import { useDeadlineNotifications } from '../../hooks/useDeadlineNotifications'
import NotificationBell from './NotificationBell'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
    isActive ? 'text-primary' : 'text-muted-foreground'
  }`

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors ${
    isActive ? 'text-primary' : 'text-muted-foreground'
  }`

export default function Layout({ children }: { children: React.ReactNode }) {
  const { signOut } = useAuth()
  const { t } = useI18n()
  const { isAdmin, plan, brandName, logoUrl } = useProfile()
  useDeadlineNotifications()

  const items = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/clients', label: t('nav.clients'), icon: Users },
    { to: '/projects', label: t('nav.projects'), icon: Briefcase },
    { to: '/settings', label: t('nav.settings'), icon: SettingsIcon },
    ...(isAdmin ? [{ to: '/admin', label: t('nav.admin'), icon: Shield }] : []),
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <nav className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-6">
            <NavLink to="/dashboard" className="flex min-w-0 items-center gap-2">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={brandName}
                  className="h-7 w-7 shrink-0 rounded object-cover"
                />
              ) : (
                <Briefcase className="h-6 w-6 shrink-0 text-primary" />
              )}
              <span className="truncate text-base font-bold sm:text-lg">{brandName}</span>
            </NavLink>
            <div className="hidden items-center gap-6 sm:flex">
              {items.map((item) => (
                <NavLink key={item.to} to={item.to} className={linkClass}>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <NotificationBell />
            <NavLink
              to="/upgrade"
              className="flex items-center gap-1.5 rounded-md border px-2.5 py-2 text-xs font-semibold hover:bg-accent sm:px-3 sm:py-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline">{t(`plan.${plan}`)}</span>
            </NavLink>
            <button
              onClick={() => signOut()}
              title={t('common.logout')}
              aria-label={t('common.logout')}
              className="flex items-center gap-1.5 rounded-md border p-2 text-xs font-medium text-muted-foreground hover:bg-accent sm:px-3 sm:py-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-7xl flex-1 p-4 pb-24 sm:p-6 sm:pb-6">{children}</main>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden">
        <div className="flex items-stretch">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} className={tabClass}>
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
