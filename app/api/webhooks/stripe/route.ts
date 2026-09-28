// brings in Stripe's SDK to verify the webhook signature
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase";

// same Stripe connection as the signup route
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// handles incoming webhook events from Stripe
export async function POST(req: Request) {
  // raw text of the request body — needed as-is (not parsed JSON) to verify the signature
  const body = await req.text();

  // Stripe signs every webhook with this header — proves the request really came from Stripe
  const signature = req.headers.get("stripe-signature")!;

  // verifies the signature against your webhook secret — throws if the request wasn't really from Stripe
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    // signature didn't match — reject, don't process anything
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  // check if we've already handled this event — Stripe can send duplicates
  const { data: alreadyProcessed } = await supabaseAdmin
    .from("processed_events")
    .select("id")
    .eq("stripe_event_id", event.id)
    .maybeSingle();

  // if we've seen it, tell Stripe "ok" and stop — don't process it twice
  if (alreadyProcessed) {
    return Response.json({ received: true });
  }

  // log this event as processed, before doing anything else
  await supabaseAdmin
    .from("processed_events")
    .insert({ stripe_event_id: event.id });

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const businessId = session.metadata?.business_id;
    const customerId = session.customer as string;

    // flip the business from pending to active now that payment cleared
    await supabaseAdmin
      .from("businesses")
      .update({ status: "active" })
      .eq("id", businessId);

    // create the subscription record, linking this business to its Stripe customer
    await supabaseAdmin.from("subscriptions").insert({
      business_id: businessId,
      stripe_customer_id: customerId,
      status: "active",
    });
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId = invoice.customer as string;

    // find the subscription row matching this Stripe customer, to get the business_id
    const { data: subscription } = await supabaseAdmin
      .from("subscriptions")
      .select("business_id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();

    // suspend that business
    if (subscription) {
      await supabaseAdmin
        .from("businesses")
        .update({ status: "suspended" })
        .eq("id", subscription.business_id);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    // find the business tied to this Stripe customer
    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("business_id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();

    // deactivate that business
    if (sub) {
      await supabaseAdmin
        .from("businesses")
        .update({ status: "deactivated" })
        .eq("id", sub.business_id);
    }
  }

  // tells Stripe everything was handled successfully
  return Response.json({ received: true });
}
