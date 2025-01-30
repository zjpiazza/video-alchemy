'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

export interface UserQuota {
  used_bytes: number
  max_bytes: number
}


export const DEFAULT_QUOTA: UserQuota = {
  used_bytes: 0,
  max_bytes: 10 * 1024 * 1024 * 1024 // 10GB
}


export function useUserQuota(user: any) {
  return useQuery({
    queryKey: ['quota', user?.id],
    queryFn: async () => {

      if (!user?.id) return DEFAULT_QUOTA
      
      const { data, error } = await supabase
        .from('quotas')
        .select('used_bytes, max_bytes')
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      return data || DEFAULT_QUOTA
    },
    enabled: !!user?.id,
    staleTime: 30000,
    networkMode: 'online'
  })
} 