'use client'
import { Logo } from '@/components/logo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useUser } from '@/hooks/useUser'
import { useUserQuota } from '@/hooks/useUserQuota'
import Link from 'next/link'

export default function Navbar() {
  const { data: user, isLoading: userLoading } = useUser()
  const { data: quota, isLoading: quotaLoading } = useUserQuota(user)

  const isLoading = userLoading || (user && quotaLoading)

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 GB'
    const gb = bytes / (1024 * 1024 * 1024)
    return `${gb.toFixed(1)} GB`
  }

  return (
    <nav className="w-full border-b border-b-foreground/10">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 h-16">
        <div className="flex items-center gap-2">
          <Logo className="w-8 h-8 text-primary" />
          <span className="font-bold text-xl">Video Alchemy</span>
        </div>
        <div className="flex items-center gap-6">
          {isLoading ? (
            <div className="h-8 w-32 animate-pulse bg-foreground/10 rounded" />
          ) : user ? (
            <>
              <div className="flex flex-col items-end text-sm">
                <span className="text-foreground/80">{user.email}</span>
                {quota && (
                  <span className="text-xs text-foreground/60">
                    Quota: {formatBytes(quota.used_bytes)} / {formatBytes(quota.max_bytes)}
                  </span>
                )}

              </div>
              <Link

                href="/auth/signout"
                className="py-2 px-4 rounded-md bg-btn-background hover:bg-btn-background-hover text-sm"
              >
                Sign Out
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="py-2 px-4 rounded-md bg-btn-background hover:bg-btn-background-hover text-sm"
            >
              Sign In
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}