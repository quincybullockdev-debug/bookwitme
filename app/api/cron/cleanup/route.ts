import { supabaseAdmin } from "@/lib/supabase";

// Vercel Cron calls this on a schedule — GET, not POST, since cron hits are simple triggers, not form submissions
export async function GET(req: Request) {
  // computes the timestamp for "24 hours ago" — anything pending older than this gets deleted
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // find businesses stuck pending past the cutoff — abandoned signups
  const { data: staleBusinesses } = await supabaseAdmin
    .from("businesses")
    .select("id, owner_id")
    .eq("status", "pending")
    .lt("created_at", cutoff);

  // nothing to clean up — exit early
  if (!staleBusinesses || staleBusinesses.length === 0) {
    return Response.json({ deleted: 0 });
  }

  // loop through each stale business and delete it, plus its associated auth user
  for (const business of staleBusinesses) {
    await supabaseAdmin.from("businesses").delete().eq("id", business.id);
    await supabaseAdmin.auth.admin.deleteUser(business.owner_id);
  }

  // tell whoever/whatever triggered this how many got cleaned up
  return Response.json({ deleted: staleBusinesses.length });
}
