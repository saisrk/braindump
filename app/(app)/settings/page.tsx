'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { Badge } from '@/components/ui/badge'
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
    <div className="flex flex-col">
      <PageHeader
        title="Settings"
        subtitle="Customize your Braindump experience"
      />

      <div className="flex-1 overflow-auto px-4 py-6 md:px-8">
        <div className="max-w-2xl space-y-6">
          {/* Theme Settings */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Appearance</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred theme
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setTheme('light')}
                  className={`px-4 py-2 rounded-lg border transition-colors flex items-center justify-center gap-2 ${
                    theme === 'light'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-foreground hover:bg-muted'
                  }`}
                >
                  <Sun className="h-4 w-4" />
                  Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`px-4 py-2 rounded-lg border transition-colors flex items-center justify-center gap-2 ${
                    theme === 'dark'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-foreground hover:bg-muted'
                  }`}
                >
                  <Moon className="h-4 w-4" />
                  Dark
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`px-4 py-2 rounded-lg border transition-colors flex items-center justify-center gap-2 text-xs ${
                    theme === 'system'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-foreground hover:bg-muted'
                  }`}
                >
                  System
                </button>
              </div>
            </div>
          </Card>

          {/* Learning Preferences */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Learning Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-start justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">Review Difficulty</p>
                  <p className="text-sm text-muted-foreground">
                    Adjust how frequently items appear in reviews
                  </p>
                </div>
                <Badge variant="secondary">Standard</Badge>
              </div>
              <div className="flex items-start justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">Daily Reminder</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified about due reviews
                  </p>
                </div>
                <Badge variant="secondary">Off</Badge>
              </div>
            </div>
          </Card>

          {/* Account */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Account</h3>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Log out and sign in on another device or account.
              </p>
              <Button
                onClick={handleLogout}
                disabled={logging}
                variant="destructive"
                className="w-full"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {logging ? 'Logging out...' : 'Logout'}
              </Button>
            </div>
          </Card>

          {/* About */}
          <Card className="p-6 bg-muted/50">
            <h3 className="text-lg font-semibold text-foreground mb-3">About</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Braindump v1.0</p>
              <p>Knowledge externalization engine built for learners.</p>
              <p className="text-xs pt-2">
                © 2024 Braindump. All rights reserved.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
