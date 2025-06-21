import { createClient } from "@supabase/supabase-js";

const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabase_key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase_role_key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const supabaseBrowser = createClient(supabase_url, supabase_key);

export const supabaseAdmin = createClient(supabase_url, supabase_role_key);
