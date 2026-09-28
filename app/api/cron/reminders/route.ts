import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { notifyByBookingId } from "@/lib/notifications";

// Runs on a schedule (set up in vercel.json) — finds bookings ~24hrs out and reminds each customer once
export async function GET() {
  const now = new Date();
  const windowStart = new Date(
    now.getTime() + 23 * 60 * 60 * 1000,
  ).toISOString();
  const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000).toISOString();

  const { data: bookings, error } = await supabaseAdmin
    .from("bookings")
    .select("id")
    .eq("status", "accepted")
    .eq("reminder_sent", false)
    .gte("start_time", windowStart)
    .lte("start_time", windowEnd);

  if (error) {
    console.error("reminder cron failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  for (const booking of bookings ?? []) {
    await notifyByBookingId(booking.id, "reminder");
    await supabaseAdmin
      .from("bookings")
      .update({ reminder_sent: true })
      .eq("id", booking.id);
  }

  return NextResponse.json({ sent: bookings?.length ?? 0 });
}
