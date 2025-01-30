'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'

const supabase = createClient()

export const DEFAULT_QUOTA = {
  total_size_bytes: 0,
  max_size_bytes: 10 * 1024 * 1024 * 1024 // 10GB
}

export function useUser() {
  return useQuery<User | null>({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      return session?.user || null
    },
    retry: 1,
    staleTime: 30000,
    networkMode: 'online'
  })
}