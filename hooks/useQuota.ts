'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'

interface UserQuota {
  total_size_bytes: number
  max_size_bytes: number
}

const DEFAULT_QUOTA: UserQuota = {
  total_size_bytes: 0,
  max_size_bytes: 10 * 1024 * 1024 * 1024
}

const fetchQuota = async (userId: string): Promise<UserQuota> => {
  if (!userId) {
    console.log('⚠️ No userId provided to fetchQuota')
    return DEFAULT_QUOTA
  }
  
  const supabase = createClient()
  console.log('🔄 Fetching quota for user:', userId)
  const startTime = performance.now()
  
  try {
    const { data, error } = await supabase
      .from('user_quotas')
      .select('total_size_bytes, max_size_bytes')
      .eq('user_id', userId)
      .single()
    
    const duration = performance.now() - startTime
    console.log(`⏱️ Quota fetch took ${duration.toFixed(0)}ms`, { hasData: !!data, error })

    if (error || !data) {
      throw new Error(error?.message || 'No quota data found')
    }

    return data
  } catch (err) {
    console.error('❌ Quota fetch failed:', err)
    return DEFAULT_QUOTA
  }
}

export function useQuota(userId: string | undefined) {
  const query = useQuery({
    queryKey: ['quota', userId],
    queryFn: () => fetchQuota(userId || ''),
    enabled: !!userId,
    staleTime: 30000,
  })

  console.log('🔍 useQuota hook state:', {
    userId,
    isLoading: query.isLoading,
    isError: query.isError,
    data: query.data,
    error: query.error
  })

  return query
}

export type { UserQuota }
export { DEFAULT_QUOTA } 