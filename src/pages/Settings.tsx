import { Moon, Sun, Palette, Download, Upload } from 'lucide-react'
import { useThemeStore } from '../stores/themeStore'

export default function Settings() {
  const { theme, setTheme, color, setColor } = useThemeStore()

  const handleExport = () => {
    alert('Export functionality coming soon')
  }

  const handleImport = () => {
    alert('Import functionality coming soon')
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your app preferences</p>
      </div>

      <div className="p-6 border rounded-lg space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Appearance</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Theme</label>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-md ${theme === 'light' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                >
                  <Sun className="h-4 w-4" />
                  Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-md ${theme === 'dark' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                >
                  <Moon className="h-4 w-4" />
                  Dark
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-md ${theme === 'system' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                >
                  System
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Primary Color
              </label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="mt-2 w-32 h-10 border rounded-md"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Data Management</h3>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent"
            >
              <Download className="h-4 w-4" />
              Export Data
            </button>
            <button
              onClick={handleImport}
              className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent"
            >
              <Upload className="h-4 w-4" />
              Import Data
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Export/Import limits depend on your subscription plan.</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Subscription</h3>
          <div className="p-4 border rounded-md">
            <p className="font-medium">Free Plan</p>
            <p className="text-sm text-muted-foreground">Upgrade to access more clients, projects, and export/import features.</p>
          </div>
        </div>
      </div>
    </div>
  )
}