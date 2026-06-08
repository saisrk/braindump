'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Sun, Moon } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { useTheme } from 'next-themes'
import { logout } from '@/lib/actions/auth'

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [logging, setLogging] = useState(false)

  const handleLogout = async () => {
    setLogging(true)
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('[v0] Logout failed:', error)
    } finally {
      setLogging(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-8 md:px-8">
        <PageHeader
          eyebrow="Configuration"
          title="Settings"
          subtitle="Customize your Braindump experience"
          className="mb-6"
        />

        <div className="max-w-2xl space-y-5">

          {/* Appearance */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-display font-semibold text-primary mb-5">Appearance</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">Theme</p>
                <p className="text-sm text-muted-foreground mt-0.5">Choose your preferred reading light</p>
              </div>
              <div className="flex border border-border rounded-lg overflow-hidden">
                {[
                  { value: 'light', label: 'Light', icon: <Sun className="h-3.5 w-3.5" /> },
                  { value: 'dark', label: 'Dark', icon: <Moon className="h-3.5 w-3.5" /> },
                  { value: 'system', label: 'System', icon: null },
                ].map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors border-r border-border last:border-0"
                    style={
                      theme === t.value
                        ? { background: '#b5462f', color: '#fff' }
                        : { background: 'transparent', color: 'var(--color-muted-foreground)' }
                    }
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Learning Preferences */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-display font-semibold text-primary mb-5">Learning Preferences</h3>
            <div className="divide-y divide-border">
              <div className="flex items-center justify-between py-4 first:pt-0">
                <div>
                  <p className="font-semibold text-foreground">Review Difficulty</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Adjust how frequently recall cards appear</p>
                </div>
                <span className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground">Standard ▾</span>
              </div>
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="font-semibold text-foreground">Daily Reminder</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Get notified about due reviews</p>
                </div>
                <span className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground">Off ▾</span>
              </div>
            </div>
          </div>

          {/* Account */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-display font-semibold text-primary mb-5">Account</h3>
            <div className="flex items-center justify-between py-3 mb-4">
              <div>
                <p className="font-semibold text-foreground">Session</p>
                <p className="text-sm text-muted-foreground mt-0.5">Log out and sign in on another device or account.</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={logging}
              className="flex w-full items-center justify-center gap-2 rounded-lg border py-3 text-sm font-semibold transition-all hover:bg-danger/5"
              style={{ borderColor: '#b5462f', color: '#b5462f' }}
            >
              <LogOut className="h-4 w-4" />
              {logging ? 'Logging out…' : '⇥ Logout'}
            </button>
          </div>

          {/* About */}
          <div className="rounded-xl border border-border bg-muted/50 p-5">
            <p className="text-sm text-muted-foreground">Braindump v1.0 · Knowledge externalization engine.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
