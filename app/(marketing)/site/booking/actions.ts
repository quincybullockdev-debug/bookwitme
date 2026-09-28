"use server";

import { supabasePublic } from "@/lib/supabase-public";
import { randomUUID } from "crypto";
import { notifyCustomer, notifyOwner } from "@/lib/notifications";
import { businessContentMap } from "@/lib/business-content/index";
import { headers } from "next/headers";

// looks up the current request's business by subdomain
async function getCurrentBusiness() {
  const headersList = await headers();
  const subdomain = headersList.get("x-subdomain") || "";
  return businessContentMap[subdomain];
}

const business = await getCurrentBusiness();
// Given a date and how long the appointment needs to be, returns every available start time.
export async function getAvailableSlots(
  dateStr: string,
  durationMinutes: number,
) {
  // Convert the date string into a Date object, then get its day of week (0=Sun, 6=Sat).
  const date = new Date(`${dateStr}T12:00:00`);
  const dayOfWeek = date.getDay();

  // Map day index to the key used in businesses.hours jsonb (matches your seeded data: "mon", "tue", etc).
  const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const dayKey = dayKeys[dayOfWeek];

  // Fetch the business's hours object.
  const { data: businessData } = await supabasePublic
    .from("businesses")
    .select("hours, buffer_minutes")
    .eq("id", business.businessId)
    .single();

  const todayHours = businessData?.hours?.[dayKey];

  // If closed today (hours entry is null), no slots are possible.
  if (!todayHours) return [];

  // Fetch any blocked_dates rows that apply to this specific date OR recurring to this day of week.
  const { data: blocks } = await supabasePublic
    .from("blocked_dates")
    .select("start_time, end_time, date, is_recurring, day_of_week")
    .eq("business_id", business.businessId);

  const relevantBlocks = (blocks ?? []).filter(
    (b) =>
      (b.is_recurring && b.day_of_week === dayOfWeek) || b.date === dateStr,
  );

  // Fetch existing bookings on this date (only accepted/pending ones count as taken).
  const dayStart = `${dateStr}T00:00:00`;
  const dayEnd = `${dateStr}T23:59:59`;
  const { data: existingBookings } = await supabasePublic
    .from("bookings")
    .select("start_time, end_time")
    .eq("business_id", business.businessId)
    .gte("start_time", dayStart)
    .lte("start_time", dayEnd)
    .neq("status", "declined");

  // more logic added next

  // Generate candidate start times every 15 minutes from open to close.
  const [openHour, openMin] = todayHours.open.split(":").map(Number);
  const [closeHour, closeMin] = todayHours.close.split(":").map(Number);

  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;

  const availableSlots: string[] = [];

  for (let start = openMinutes; start < closeMinutes; start += 15) {
    const end = start + durationMinutes + (businessData?.buffer_minutes ?? 0);

    // Slot must start during business hours — can spill past close, matching your spec.
    if (start >= closeMinutes) break;

    // Convert this candidate slot's start/end into actual Date objects for comparison.
    const slotStart = new Date(
      `${dateStr}T${String(Math.floor(start / 60)).padStart(2, "0")}:${String(start % 60).padStart(2, "0")}:00`,
    );
    const slotEnd = new Date(
      `${dateStr}T${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}:00`,
    );

    // Check against blocked_dates — reject if this slot overlaps any blocked time range.
    const blockedOverlap = relevantBlocks.some((b) => {
      if (!b.start_time || !b.end_time) return true; // whole-day block
      const blockStart = new Date(`${dateStr}T${b.start_time}`);
      const blockEnd = new Date(`${dateStr}T${b.end_time}`);
      return slotStart < blockEnd && slotEnd > blockStart;
    });

    // Check against existing bookings — reject if this slot overlaps any taken time range.
    const bookingOverlap = (existingBookings ?? []).some((bk) => {
      const bookedStart = new Date(bk.start_time);
      const bookedEnd = new Date(bk.end_time);
      return slotStart < bookedEnd && slotEnd > bookedStart;
    });

    if (!blockedOverlap && !bookingOverlap) {
      availableSlots.push(
        `${String(Math.floor(start / 60)).padStart(2, "0")}:${String(start % 60).padStart(2, "0")}`,
      );
    }
  }

  return availableSlots;
}

// Creates a customer (or reuses an existing one by phone), then the booking, then any selected add-ons.
export async function submitBooking(params: {
  name: string;
  phone: string;
  email: string;
  serviceId: string;
  addonIds: string[];
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (24hr)
  durationMinutes: number;
}) {
  // Check if this customer already exists (matched by phone) for this business, to avoid duplicate customer rows.
  const { data: existingCustomer } = await supabasePublic
    .from("customers")
    .select("id")
    .eq("business_id", business.businessId)
    .eq("phone", params.phone)
    .maybeSingle();

  let customerId = existingCustomer?.id;

  // If no existing customer, create one.
  if (!customerId) {
    const newCustomerId = randomUUID();

    const { error: customerError } = await supabasePublic
      .from("customers")
      .insert({
        id: newCustomerId,
        business_id: business.businessId,
        name: params.name,
        phone: params.phone,
        email: params.email,
      });

    if (customerError) return { error: customerError.message };
    customerId = newCustomerId;
  }

  // Convert the HH:MM time string into a full start timestamp, then add duration for the end timestamp.
  const [hour, minute] = params.time.split(":").map(Number);
  const startTime = new Date(
    `${params.date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`,
  );
  const endTime = new Date(
    startTime.getTime() + params.durationMinutes * 60000,
  );

  // Insert the booking itself, status starts as "pending" until the owner accepts/declines.
  const bookingId = randomUUID();

  const { error: bookingError } = await supabasePublic.from("bookings").insert({
    id: bookingId,
    business_id: business.businessId,
    service_id: params.serviceId,
    customer_id: customerId,
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    status: "pending",
  });

  if (bookingError) return { error: bookingError.message };

  // Insert one booking_addons row per selected add-on, if any were chosen.
  if (params.addonIds.length > 0) {
    const addonRows = params.addonIds.map((addonId) => ({
      booking_id: bookingId,
      addon_id: addonId,
    }));

    const { error: addonError } = await supabasePublic
      .from("booking_addons")
      .insert(addonRows);

    if (addonError) return { error: addonError.message };
  }

  // Fetch service name and business name for the notification message content
  const { data: serviceData } = await supabasePublic
    .from("services")
    .select("name")
    .eq("id", params.serviceId)
    .single();

  const { data: businessData } = await supabasePublic
    .from("businesses")
    .select("name")
    .eq("id", business.businessId)
    .single();

  // Fire notifications — customer gets a "we got your request" message, owner gets alerted to check dashboard
  await notifyCustomer(
    {
      id: bookingId,
      business_id: business.businessId,
      customer_id: customerId,
      customer_name: params.name,
      customer_email: params.email,
      customer_phone: params.phone,
      business_name: businessData?.name ?? "the business",
      service_name: serviceData?.name ?? "your service",
      start_time: startTime.toISOString(),
    },
    "booking_confirmation",
  );

  await notifyOwner(business.businessId, bookingId, "new_booking_request");

  return { bookingId };
}
