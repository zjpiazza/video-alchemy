'use client'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Logo } from '@/components/logo'

interface UserQuota {
  total_size_bytes: number
  max_size_bytes: number
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [quota, setQuota] = useState<UserQuota | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchQuota = async (userId: string) => {
    console.log('Fetching quota for user:', userId)
    const { data, error } = await supabase
      .from('user_quotas')
      .select('total_size_bytes, max_size_bytes')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching quota:', error)
      return
    }

    console.log('Quota data:', data)
    if (data) {
      setQuota(data)
    }
  }

  useEffect(() => {
    // Initial auth check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchQuota(session.user.id)
      }
      setIsLoading(false)
    })

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchQuota(session.user.id)
      } else {
        setQuota(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 GB'
    const gb = bytes / (1024 * 1024 * 1024)
    return `${gb.toFixed(1)} GB`
  }

  const getUserDisplayName = () => {
    if (!user) return null
    return user.email || user.user_metadata?.username || user.id.slice(0, 8)
  }

  return (
    <nav className="w-full border-b border-b-foreground/10">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 h-16">
        {/* Left section - Logo and title */}
        <div className="flex items-center gap-2">
          <Logo className="w-8 h-8 text-primary" />
          <span className="font-bold text-xl">Video Alchemy</span>
        </div>

        {/* Right section - User info, theme toggle, and auth */}
        <div className="flex items-center gap-6">
          {isLoading ? (
            <div className="h-8 w-32 animate-pulse bg-foreground/10 rounded" />
          ) : user ? (
            <>
              <div className="flex flex-col items-end text-sm">
                <span className="text-foreground/80">{getUserDisplayName()}</span>
                <span className="text-xs text-foreground/60">
                  Storage: {quota ? `${formatBytes(quota.total_size_bytes)} / ${formatBytes(quota.max_size_bytes)}` : '...'}
                </span>
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

          {/* Theme toggle */}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
} 