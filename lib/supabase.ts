// imports Supabase's client-creation function
import { createClient } from "@supabase/supabase-js";

// creates one shared connection to your Supabase project, using the service role key
// (bypasses row-level security — safe here because this file only runs on the backend, never sent to the browser)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
