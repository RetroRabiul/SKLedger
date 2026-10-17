import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import App from './App.tsx'
import './index.css'
import { initializeTheme } from './stores/themeStore'
import { AuthProvider } from './context/AuthProvider'
import { I18nProvider } from './i18n/I18nProvider'
import { ProfileProvider } from './context/ProfileProvider'

initializeTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <I18nProvider>
          <ProfileProvider>
            <App />
            <Toaster richColors position="top-center" />
          </ProfileProvider>
        </I18nProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
