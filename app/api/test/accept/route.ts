import { NextRequest, NextResponse } from "next/server";
import { acceptBooking } from "@/app/dashboard/actions";

// TEMPORARY test route — lets you trigger acceptBooking without logging into the dashboard.
// Delete this file once real testing is done, it's not meant to ship.
export async function GET(req: NextRequest) {
  const bookingId = req.nextUrl.searchParams.get("id");
  if (!bookingId) {
    return NextResponse.json({ error: "missing ?id=" }, { status: 400 });
  }

  const result = await acceptBooking(bookingId);
  return NextResponse.json(result);
}
