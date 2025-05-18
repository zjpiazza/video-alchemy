"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "~/components/ui/button"
import { ModeToggle } from "~/components/mode-toggle"
import { FlaskRoundIcon as Flask } from "lucide-react"
import { useAuth } from "~/contexts/auth-context"

export function Header() {
  const pathname = usePathname()
  const { isAuthenticated, user } = useAuth()

  // Check if we're in the dashboard section
  const isDashboard = pathname.startsWith("/dashboard")

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Flask className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold tracking-tight">Video Alchemy</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 ml-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Home
            </Link>
            <Link
              href="/process"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/process" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Process Video
            </Link>
            {isAuthenticated && (
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isDashboard ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Dashboard
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />
          {isAuthenticated ? (
            <Button asChild variant="default" size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <Button asChild variant="default" size="sm">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
