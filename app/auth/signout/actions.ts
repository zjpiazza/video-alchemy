'use client'

import { createClient } from '@/utils/supabase/client'
import { redirect } from 'next/navigation'

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error signing out:', error)
    return
  }
  
  // Small delay to ensure auth state is updated
  await new Promise(resolve => setTimeout(resolve, 100))
  redirect('/')
} 