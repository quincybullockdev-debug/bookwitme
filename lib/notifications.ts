// Resend client — this SDK gives us a `.emails.send()` method so we don't hand-build API requests
import { Resend } from "resend";
// Twilio client — same idea as Resend, prebuilt SDK instead of raw API calls
import twilio from "twilio";
// Reuses the same admin Supabase client you already use elsewhere for server-side writes
import { supabaseAdmin } from "@/lib/supabase";

// Pulls your key from .env.local — never hardcode secrets directly in code
const resend = new Resend(process.env.RESEND_API_KEY);
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

// Sends one email; returns true/false so callers know if it worked without needing try/catch everywhere
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<boolean> {
  try {
    // Resend's send() call — "from" needs to match your verified sending domain later, using their test address for now
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    // Log the failure but don't crash the booking flow over a failed email
    console.error("sendEmail failed:", error);
    return false;
  }
}

// Same shape as sendEmail (returns true/false) so notifyCustomer doesn't need to know it's stubbed
export async function sendSMS(to: string, body: string): Promise<boolean> {
  try {
    // STUBBED: A2P registration isn't approved yet, so we log instead of actually sending.
    // Swap this block for the real twilioClient.messages.create() call once A2P clears.
    console.log(`[SMS STUB] Would send to ${to}: ${body}`);
    return true;

    // Real version, ready to uncomment later:
    // await twilioClient.messages.create({
    //   to,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   body,
    // });
    // return true;
  } catch (error) {
    console.error("sendSMS failed:", error);
    return false;
  }
}

type NotificationLog = {
  business_id: string;
  booking_id: string;
  type: string; // e.g. "booking_confirmation_email", "reminder_sms"
  status: "sent" | "failed";
};

export async function logNotification(log: NotificationLog) {
  const { error } = await supabaseAdmin.from("notifications_log").insert(log);
  if (error) console.error("logNotification failed:", error);
}

// Shape notifyCustomer expects — caller fetches this (joins booking + customer + business + service) before calling
type NotifyBooking = {
  id: string;
  business_id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  business_name: string;
  service_name: string;
  start_time: string; // ISO date string
};

// Builds the subject/email/text content for each notification type — one place to edit wording later
function getMessageContent(type: string, booking: NotifyBooking) {
  const when = new Date(booking.start_time).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const templates: Record<string, { subject: string; body: string }> = {
    booking_confirmation: {
      subject: `Request received — ${booking.business_name}`,
      body: `Hi ${booking.customer_name}, we got your request for ${booking.service_name} at ${booking.business_name} on ${when}. You'll hear back soon.`,
    },
    accepted: {
      subject: `Confirmed — ${booking.business_name}`,
      body: `Hi ${booking.customer_name}, your ${booking.service_name} at ${booking.business_name} on ${when} is confirmed!`,
    },
    declined: {
      subject: `Update on your request — ${booking.business_name}`,
      body: `Hi ${booking.customer_name}, unfortunately ${booking.business_name} couldn't confirm your request for ${when}.`,
    },
    backup_promoted: {
      subject: `Confirmed — ${booking.business_name}`,
      body: `Hi ${booking.customer_name}, a spot opened up — your ${booking.service_name} at ${booking.business_name} on ${when} is now confirmed!`,
    },
    running_late: {
      subject: `Running late — ${booking.business_name}`,
      body: `Hi ${booking.customer_name}, ${booking.business_name} is running a bit behind. Your ${when} appointment time has shifted — check your booking for the new time.`,
    },
    reminder: {
      subject: `Reminder — ${booking.business_name}`,
      body: `Hi ${booking.customer_name}, reminder: your ${booking.service_name} at ${booking.business_name} is on ${when}.`,
    },
    review_request: {
      subject: `How was your visit? — ${booking.business_name}`,
      body: `Hi ${booking.customer_name}, thanks for visiting ${booking.business_name}! We'd love a quick review.`,
    },
  };

  return (
    templates[type] ?? { subject: "Update", body: "You have a booking update." }
  );
}

// Owner notifications: email only for now — no phone column exists for owners yet
export async function notifyOwner(
  businessId: string,
  bookingId: string,
  type: string,
) {
  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("owner_id, name")
    .eq("id", businessId)
    .single();

  if (!business?.owner_id) return;

  const { data: userData } = await supabaseAdmin.auth.admin.getUserById(
    business.owner_id,
  );
  const ownerEmail = userData?.user?.email;
  if (!ownerEmail) return;

  const subject = `New booking request — ${business.name}`;
  const body = `You have a new booking request. Log in to your dashboard to review it.`;

  const emailSuccess = await sendEmail(ownerEmail, subject, `<p>${body}</p>`);

  await logNotification({
    business_id: businessId,
    booking_id: bookingId,
    type: `${type}_email`,
    status: emailSuccess ? "sent" : "failed",
  });
}

// The one function every trigger point calls — handles email always, SMS conditionally, logs both
export async function notifyCustomer(booking: NotifyBooking, type: string) {
  const { subject, body } = getMessageContent(type, booking);

  // Check if this business pays for SMS before we try sending one
  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("sms_enabled")
    .eq("id", booking.business_id)
    .single();

  // Email always sends
  const emailSuccess = await sendEmail(
    booking.customer_email,
    subject,
    `<p>${body}</p>`,
  );
  await logNotification({
    business_id: booking.business_id,
    booking_id: booking.id,
    type: `${type}_email`,
    status: emailSuccess ? "sent" : "failed",
  });

  if (business?.sms_enabled) {
    const smsSuccess = await sendSMS(booking.customer_phone, body);
    await logNotification({
      business_id: booking.business_id,
      booking_id: booking.id,
      type: `${type}_sms`,
      status: smsSuccess ? "sent" : "failed",
    });
  }
}

// Convenience wrapper — most trigger points only have a bookingId, not the full joined object.
// Fetches booking + customer + service + business, then calls notifyCustomer.
export async function notifyByBookingId(bookingId: string, type: string) {
  const { data: booking, error } = await supabaseAdmin
    .from("bookings")
    .select(
      `
      id,
      business_id,
      customer_id,
      start_time,
      customers (name, email, phone),
      services (name),
      businesses (name)
    `,
    )
    .eq("id", bookingId)
    .single();

  if (error || !booking) {
    console.error("notifyByBookingId: could not fetch booking", error);
    return;
  }

  //just editor-level warnings, not breaking anything.
  //That's a common Supabase quirk — it types joined tables as arrays by default, so TypeScript complains .name doesn't exist on an array
  await notifyCustomer(
    {
      id: booking.id,
      business_id: booking.business_id,
      customer_id: booking.customer_id,
      customer_name: booking.customers?.[0]?.name ?? "there",
      customer_email: booking.customers?.[0]?.email ?? "",
      customer_phone: booking.customers?.[0]?.phone ?? "",
      business_name: booking.businesses?.[0]?.name ?? "the business",
      service_name: booking.services?.[0]?.name ?? "your service",
      start_time: booking.start_time,
    },
    type,
  );
}
