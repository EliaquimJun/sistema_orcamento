import { createBrowserClient } from '@supabase/ssr'


export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // use PUBLISHABLE_KEY se você tiver; senão use ANON_KEY
    (
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
      
  )
  
}
