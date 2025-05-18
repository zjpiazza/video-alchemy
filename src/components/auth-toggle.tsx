"use client"

import { useAuth } from "~/contexts/auth-context"
import { Button } from "~/components/ui/button"
import { Switch } from "~/components/ui/switch"
import { Label } from "~/components/ui/label"
import { LogIn, LogOut } from "lucide-react"
import { useState, useEffect } from "react"

export function AuthToggle() {
  const { isAuthenticated, login, logout } = useAuth()
  const [checked, setChecked] = useState(false)

  // Sync the toggle state with authentication state
  useEffect(() => {
    setChecked(isAuthenticated)
  }, [isAuthenticated])

  const handleToggle = () => {
    if (isAuthenticated) {
      logout()
    } else {
      login()
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background border rounded-lg shadow-lg p-4 flex items-center gap-3">
      <div className="flex items-center space-x-2">
        <Switch id="auth-mode" checked={checked} onCheckedChange={handleToggle} />
        <Label htmlFor="auth-mode">{isAuthenticated ? "Authenticated" : "Unauthenticated"}</Label>
      </div>
      <Button variant="ghost" size="icon" onClick={handleToggle}>
        {isAuthenticated ? <LogOut className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
      </Button>
    </div>
  )
}
