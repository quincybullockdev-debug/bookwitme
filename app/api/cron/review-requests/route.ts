import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { notifyByBookingId } from "@/lib/notifications";

// Runs once a day — finds past appointments that happened and asks for a review, once each
export async function GET() {
  const now = new Date().toISOString();

  const { data: bookings, error } = await supabaseAdmin
    .from("bookings")
    .select("id")
    .eq("status", "accepted")
    .eq("review_requested", false)
    .lt("start_time", now);

  if (error) {
    console.error("review-request cron failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  for (const booking of bookings ?? []) {
    await notifyByBookingId(booking.id, "review_request");
    await supabaseAdmin
      .from("bookings")
      .update({ review_requested: true })
      .eq("id", booking.id);
  }

  return NextResponse.json({ sent: bookings?.length ?? 0 });
}
