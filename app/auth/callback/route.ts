import { type EmailOtpType } from '@supabase/auth-js'
import { type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type') as EmailOtpType | null
    const next = searchParams.get('next') ?? '/'

    if (!token_hash || !type) {
      console.error('Missing token_hash or type in verification request')
      redirect('/auth/error?message=invalid_verification_params')
    }

    const supabase = await createClient()
    
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (error) {
      console.error('Verification error:', error.message)
      redirect('/auth/error?message=verification_failed')
    }

    // Successful verification
    redirect(next)
  } catch (error) {
    console.error('Unexpected error during verification:', error)
    redirect('/auth/error?message=verification_failed')
  }
}