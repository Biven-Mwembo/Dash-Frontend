import { createClient } from '@supabase/supabase-js';

// These should be replaced by your actual keys from the Supabase Dashboard
// Settings -> API
const supabaseUrl = "https://iegdtxepakdfzuimoyxm.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllZ2R0eGVwYWtkZnp1aW1veXhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0OTk3NDMsImV4cCI6MjA3NzA3NTc0M30.ksTWuoSjI_w5anPBKVYalPluMs9VQL4Ui9MydkVvbU4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);