// imports the browser-side client from the SSR package — writes session to cookies, not localStorage, so server code can read it too
import { createBrowserClient } from "@supabase/ssr";

// creates a browser-safe connection using the public anon key — respects your RLS policies, safe to expose
export const supabaseBrowser = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
