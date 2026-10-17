import { Navigate } from 'react-router-dom'
import { useProfile } from '../hooks/useProfile'

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading, profile } = useProfile()

  if (loading && !profile) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}
