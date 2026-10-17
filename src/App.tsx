import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import Projects from './pages/Projects'
import Settings from './pages/Settings'
import Upgrade from './pages/Upgrade'
import Admin from './pages/Admin'
import Auth from './pages/Auth'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

function Authed({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<Authed><Dashboard /></Authed>} />
      <Route path="/clients" element={<Authed><Clients /></Authed>} />
      <Route path="/projects" element={<Authed><Projects /></Authed>} />
      <Route path="/settings" element={<Authed><Settings /></Authed>} />
      <Route path="/upgrade" element={<Authed><Upgrade /></Authed>} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <Layout>
                <Admin />
              </Layout>
            </AdminRoute>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
