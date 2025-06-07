import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Provide placeholder values if environment variables are not set.
// These are necessary for the app to run in a preview environment without actual Supabase credentials.
// For a functional application, you MUST replace these placeholders by setting
// NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project-url.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key"

// Log a warning to the console if placeholder values are being used,
// to remind the developer during development or preview.
if (supabaseUrl === "https://your-project-url.supabase.co" || supabaseAnonKey === "your-anon-key") {
  console.warn(
    "Supabase environment variables are not set. Using placeholder values. " +
      "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY for Supabase to function.",
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
  },
})
