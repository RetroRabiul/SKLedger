import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Briefcase, Settings as SettingsIcon } from 'lucide-react'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="flex h-16 items-center px-4 max-w-7xl mx-auto">
          <div className="flex items-center space-x-4 lg:space-x-6">
            <div className="flex items-center gap-2">
              <Briefcase className="h-6 w-6" />
              <span className="font-bold text-lg">SKLedger</span>
            </div>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`
              }
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </NavLink>
            <NavLink
              to="/clients"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`
              }
            >
              <Users className="h-4 w-4" />
              Clients
            </NavLink>
            <NavLink
              to="/projects"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`
              }
            >
              <Briefcase className="h-4 w-4" />
              Projects
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`
              }
            >
              <SettingsIcon className="h-4 w-4" />
              Settings
            </NavLink>
          </div>
        </div>
      </nav>
      <main className="p-6 max-w-7xl mx-auto">{children}</main>
    </div>
  )
}