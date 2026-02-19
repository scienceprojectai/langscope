import { createClient } from '@supabase/supabase-js';

// These will now pull from your real environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables!");
}

// Initialize the REAL client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);