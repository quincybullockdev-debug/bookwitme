"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notifyByBookingId } from "@/lib/notifications";

export async function getBookingsForRange(
  businessId: string,
  start: string,
  end: string,
) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  );

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      services (name, price, duration_minutes),
      booking_addons (service_addons (name, price, duration_minutes))
    `,
    )
    .eq("business_id", businessId)
    .gte("start_time", start)
    .lte("start_time", end);

  if (error) {
    console.error(error);
    return [];
  }

  return bookings;
}

// grabs every service row for this business, alphabetized — used to render the services list
export async function getServices(businessId: string) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  );

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("business_id", businessId)
    .order("name");

  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

// takes the form's input values and saves them as one new row in the services table, tied to this business via business_id
export async function createService(
  businessId: string,
  name: string,
  price: number,
  durationMinutes: number,
) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  );

  const { error } = await supabase.from("services").insert({
    business_id: businessId,
    name,
    price,
    duration_minutes: durationMinutes,
  });

  if (error) {
    console.error(error);
    return { success: false };
  }
  return { success: true };
}

// updates one existing service row by its id — only the fields passed in get changed
export async function updateService(
  serviceId: string,
  updates: { name?: string; price?: number; duration_minutes?: number },
) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  );

  const { error } = await supabase
    .from("services")
    .update(updates)
    .eq("id", serviceId);

  if (error) {
    console.error(error);
    return { success: false };
  }
  return { success: true };
}
// permanently removes a service row by its id
export async function deleteService(serviceId: string) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  );

  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", serviceId);

  if (error) {
    console.error(error);
    return { success: false };
  }
  return { success: true };
}
// reads just the hours field off this business's row
export async function getBusinessHours(businessId: string) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  );

  const { data, error } = await supabase
    .from("businesses")
    .select("hours")
    .eq("id", businessId)
    .single();

  if (error) {
    console.error(error);
    return null;
  }
  return data.hours;
}

// overwrites the hours field with a new object — whole thing replaced at once, not merged
export async function updateBusinessHours(businessId: string, hours: object) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  );

  const { error } = await supabase
    .from("businesses")
    .update({ hours })
    .eq("id", businessId);

  if (error) {
    console.error(error);
    return { success: false };
  }
  return { success: true };
}

// fetches all blocked dates/times for this business
export async function getBlockedDates(businessId: string) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  );

  const { data, error } = await supabase
    .from("blocked_dates")
    .select("*")
    .eq("business_id", businessId);

  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

// creates a new blocked date/time entry — handles both single-day and recurring cases
export async function createBlockedDate(
  businessId: string,
  block: {
    date?: string;
    day_of_week?: number;
    is_recurring: boolean;
    start_time?: string;
    end_time?: string;
    reason?: string;
  },
) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  );

  const { error } = await supabase
    .from("blocked_dates")
    .insert({ business_id: businessId, ...block });

  if (error) {
    console.error(error);
    return { success: false };
  }
  return { success: true };
}

// removes one blocked date/time entry by its id
export async function deleteBlockedDate(blockId: string) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  );

  const { error } = await supabase
    .from("blocked_dates")
    .delete()
    .eq("id", blockId);

  if (error) {
    console.error(error);
    return { success: false };
  }
  return { success: true };
}

// fetches bookings for one of three views: upcoming, past, or cancelled
export async function getBookingsByStatus(
  businessId: string,
  view: "upcoming" | "past" | "cancelled",
) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  );

  let query = supabase
    .from("bookings")
    .select("*, services (name, price)")
    .eq("business_id", businessId);

  const now = new Date().toISOString();

  if (view === "cancelled") {
    query = query.eq("status", "cancelled");
  } else if (view === "upcoming") {
    query = query.neq("status", "cancelled").gte("start_time", now);
  } else {
    query = query.neq("status", "cancelled").lt("start_time", now);
  }

  const { data, error } = await query.order("start_time");

  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

// marks a booking as cancelled
export async function cancelBooking(bookingId: string) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  );

  const { error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId);

  if (error) {
    console.error(error);
    return { success: false };
  }

  // find backups waiting on this booking, oldest request first
  const { data: backups } = await supabase
    .from("bookings")
    .select("id")
    .eq("backup_for_booking_id", bookingId)
    .eq("status", "backup")
    .order("created_at", { ascending: true })
    .limit(1);

  // promote the first one in line, if any exist
  if (backups && backups.length > 0) {
    const promotedId = backups[0].id;

    await supabase
      .from("bookings")
      .update({ status: "accepted" })
      .eq("id", promotedId);

    await notifyByBookingId(promotedId, "backup_promoted");
  }

  return { success: true };
}

// fetches all pending (not yet accepted/declined) bookings for this business
export async function getPendingRequests(businessId: string) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  );

  const { data, error } = await supabase
    .from("bookings")
    .select("*, services (name, price)")
    .eq("business_id", businessId)
    .eq("status", "pending")
    .order("start_time");

  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

// accepts one booking and demotes any other pending bookings that overlap its time range to "backup"
export async function acceptBooking(bookingId: string) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  );

  // grab the booking being accepted so we know its business, start, and end times
  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("business_id, start_time, end_time")
    .eq("id", bookingId)
    .single();

  if (fetchError || !booking) {
    console.error(fetchError);
    return { success: false };
  }

  // mark this one as accepted
  const { error: acceptError } = await supabase
    .from("bookings")
    .update({ status: "accepted" })
    .eq("id", bookingId);

  if (acceptError) {
    console.error(acceptError);
    return { success: false };
  }

  await notifyByBookingId(bookingId, "accepted");

  // find other still-pending bookings for this business whose time range overlaps this one
  const { data: overlapping, error: overlapError } = await supabase
    .from("bookings")
    .select("id")
    .eq("business_id", booking.business_id)
    .eq("status", "pending")
    .neq("id", bookingId)
    .lt("start_time", booking.end_time)
    .gt("end_time", booking.start_time);

  if (overlapError) {
    console.error(overlapError);
    return { success: true }; // the accept itself still worked
  }

  // demote each overlapping pending booking to "backup"
  if (overlapping && overlapping.length > 0) {
    await supabase
      .from("bookings")
      .update({ status: "backup", backup_for_booking_id: bookingId })
      .in(
        "id",
        overlapping.map((b) => b.id),
      );
  }

  return { success: true };
}

// marks a pending booking as declined
export async function declineBooking(bookingId: string) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  );

  const { error } = await supabase
    .from("bookings")
    .update({ status: "declined" })
    .eq("id", bookingId);

  if (error) {
    console.error(error);
    return { success: false };
  }
  return { success: true };

  await notifyByBookingId(bookingId, "declined");
}

// fetches every customer who's booked with this business
export async function getCustomers(businessId: string) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  );

  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("business_id", businessId)
    .order("name");

  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

// fetches all bookings tied to one specific customer
export async function getBookingHistory(customerId: string) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  );

  const { data, error } = await supabase
    .from("bookings")
    .select("*, services (name, price)")
    .eq("customer_id", customerId)
    .order("start_time", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

// calculates revenue, booking count, and top services for accepted bookings in a date range
export async function getStats(businessId: string, start: string, end: string) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  );

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("*, services (name, price)")
    .eq("business_id", businessId)
    .eq("status", "accepted")
    .gte("start_time", start)
    .lte("start_time", end);

  if (error) {
    console.error(error);
    return { revenue: 0, count: 0, topServices: [] };
  }

  // adds up every booking's service price
  const revenue = bookings.reduce(
    (sum, b) => sum + (b.services?.price || 0),
    0,
  );

  // counts how many bookings exist per service name
  const serviceCounts: Record<string, number> = {};
  bookings.forEach((b) => {
    const name = b.services?.name || "Unknown";
    serviceCounts[name] = (serviceCounts[name] || 0) + 1;
  });

  // turns that count object into a sorted array, highest count first
  const topServices = Object.entries(serviceCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  return { revenue, count: bookings.length, topServices };
}

// shifts every remaining booking today forward by delayMinutes
export async function applyDelay(
  businessId: string,
  date: string,
  delayMinutes: number,
) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  );

  // grabs today's remaining accepted bookings, from right now onward
  const now = new Date().toISOString();
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("id, start_time, end_time")
    .eq("business_id", businessId)
    .eq("status", "accepted")
    .gte("start_time", now)
    .lte("start_time", `${date}T23:59:59`);

  if (error) {
    console.error(error);
    return { success: false };
  }

  // shifts each one's start and end time forward by delayMinutes, one update per booking
  for (const booking of bookings) {
    const newStart = new Date(
      new Date(booking.start_time).getTime() + delayMinutes * 60000,
    );
    const newEnd = new Date(
      new Date(booking.end_time).getTime() + delayMinutes * 60000,
    );

    await supabase
      .from("bookings")
      .update({
        start_time: newStart.toISOString(),
        end_time: newEnd.toISOString(),
      })
      .eq("id", booking.id);

    // notification sending is stubbed for now — just logs, real Resend/Twilio wiring comes next phase
    await notifyByBookingId(booking.id, "running_late");
  }

  return { success: true };
}

// checks if moving a booking to a new time conflicts with any other accepted booking
export async function rescheduleBooking(
  bookingId: string,
  newStart: string,
  newEnd: string,
) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  );

  // need this booking's business_id to only check conflicts within the same business
  const { data: booking } = await supabase
    .from("bookings")
    .select("business_id")
    .eq("id", bookingId)
    .single();

  if (!booking) return { success: false };

  // finds any OTHER accepted booking whose time range overlaps the proposed new time
  const { data: conflicts } = await supabase
    .from("bookings")
    .select("id")
    .eq("business_id", booking.business_id)
    .eq("status", "accepted")
    .neq("id", bookingId)
    .lt("start_time", newEnd)
    .gt("end_time", newStart);

  // if any conflicts exist, don't move it — flag it for the owner to resolve instead
  if (conflicts && conflicts.length > 0) {
    return {
      success: false,
      needsApproval: true,
      conflictCount: conflicts.length,
    };
  }

  // no conflicts — safe to just move it
  const { error } = await supabase
    .from("bookings")
    .update({ start_time: newStart, end_time: newEnd })
    .eq("id", bookingId);

  if (error) {
    console.error(error);
    return { success: false };
  }
  return { success: true };
}

// updates the business's own name
export async function updateBusinessProfile(businessId: string, name: string) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  );

  const { error } = await supabase
    .from("businesses")
    .update({ name })
    .eq("id", businessId);

  if (error) {
    console.error(error);
    return { success: false };
  }
  return { success: true };
}

// updates the business's Cash App tag
export async function updateCashAppTag(businessId: string, tag: string) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  );

  const { error } = await supabase
    .from("businesses")
    .update({ cashapp_tag: tag })
    .eq("id", businessId);

  if (error) {
    console.error(error);
    return { success: false };
  }
  return { success: true };
}

// flips the sms_enabled toggle on or off
export async function toggleSmsEnabled(businessId: string, enabled: boolean) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  );

  const { error } = await supabase
    .from("businesses")
    .update({ sms_enabled: enabled })
    .eq("id", businessId);

  if (error) {
    console.error(error);
    return { success: false };
  }
  return { success: true };
}
