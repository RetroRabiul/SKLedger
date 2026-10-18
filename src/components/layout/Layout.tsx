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

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
    isActive ? 'text-primary' : 'text-muted-foreground'
  }`

export default function Layout({ children }: { children: React.ReactNode }) {
  const { signOut } = useAuth()
  const { t } = useI18n()
  const { isAdmin, plan, brandName, logoUrl } = useProfile()
  useDeadlineNotifications()

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-6 overflow-x-auto">
            <div className="flex items-center gap-2">
              {logoUrl ? (
                <img src={logoUrl} alt={brandName} className="h-6 w-6 rounded object-cover" />
              ) : (
                <Briefcase className="h-6 w-6 text-primary" />
              )}
              <span className="text-lg font-bold">{brandName}</span>
            </div>
            <NavLink to="/dashboard" className={linkClass}>
              <LayoutDashboard className="h-4 w-4" />
              {t('nav.dashboard')}
            </NavLink>
            <NavLink to="/clients" className={linkClass}>
              <Users className="h-4 w-4" />
              {t('nav.clients')}
            </NavLink>
            <NavLink to="/projects" className={linkClass}>
              <Briefcase className="h-4 w-4" />
              {t('nav.projects')}
            </NavLink>
            <NavLink to="/settings" className={linkClass}>
              <SettingsIcon className="h-4 w-4" />
              {t('nav.settings')}
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={linkClass}>
                <Shield className="h-4 w-4" />
                {t('nav.admin')}
              </NavLink>
            )}
          </div>

          <div className="flex items-center gap-2">
            <NavLink
              to="/upgrade"
              className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold hover:bg-accent"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              {t(`plan.${plan}`)}
            </NavLink>
            <button
              onClick={() => signOut()}
              title={t('common.logout')}
              className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl p-4 sm:p-6">{children}</main>
    </div>
  )
}
