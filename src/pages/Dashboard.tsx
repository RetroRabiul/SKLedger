import { useAuth } from '../hooks/useAuth'
import { DollarSign, Users, Briefcase, TrendingUp, LogOut } from 'lucide-react'

export default function Dashboard() {
  const { signOut, user } = useAuth()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.email}</p>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
              <h3 className="text-2xl font-bold">$0.00</h3>
            </div>
            <DollarSign className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <div className="p-6 border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Project Income</p>
              <h3 className="text-2xl font-bold">$0.00</h3>
            </div>
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <div className="p-6 border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
              <h3 className="text-2xl font-bold">0</h3>
            </div>
            <Briefcase className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <div className="p-6 border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
              <h3 className="text-2xl font-bold">0</h3>
            </div>
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Active Projects</h3>
          <p className="text-sm text-muted-foreground">No active projects yet.</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Recent Projects</h3>
          <p className="text-sm text-muted-foreground">No recent projects yet.</p>
        </div>
      </div>
    </div>
  )
}