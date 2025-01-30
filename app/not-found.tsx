import { createClient } from "@/utils/supabase/client"

export default function NotFound() {
  const supabase = createClient()
  
  // Handle case where supabase client is null
  if (!supabase) {
    return <div>Error loading page</div>
  }

  // Rest of your component code
} 