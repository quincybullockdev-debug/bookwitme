// brings in the shared Supabase connection so this route can query the database
import { supabaseAdmin } from "@/lib/supabase";
// brings in Stripe's SDK to create checkout sessions
import Stripe from "stripe";

// creates one Stripe connection using your secret key from .env.local
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// handles POST requests to /api/signup — Next.js routes by function name matching the HTTP method
export async function POST(req: Request) {
  // reads the request body back into a JS object (form's data)
  const { businessName, subdomain, email, password } = await req.json();

  // businessName is required — reject empty/whitespace-only submissions the frontend might have missed
  if (!businessName.trim()) {
    return Response.json(
      { error: "Business name is required" },
      { status: 400 },
    );
  }

  // same regex as the frontend — lowercase letters, numbers, hyphens, 3-30 chars — backend can't trust the frontend already checked this
  const SUBDOMAIN_REGEX = /^[a-z0-9]([a-z0-9-]{1,28}[a-z0-9])?$/;
  if (!SUBDOMAIN_REGEX.test(subdomain)) {
    return Response.json(
      { error: "Invalid subdomain format" },
      { status: 400 },
    );
  }

  // these words are reserved for system pages/subdomains — can't let a business claim them
  const RESERVED = ["www", "api", "admin", "app", "bookme", "dashboard"];
  if (RESERVED.includes(subdomain)) {
    return Response.json(
      { error: "This subdomain is reserved" },
      { status: 400 },
    );
  }

  // basic email shape check — has an @ and something after a dot
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!EMAIL_REGEX.test(email)) {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }

  // Supabase's default minimum is 6 characters — matching that here so we reject early instead of letting Supabase fail later
  if (password.length < 6) {
    return Response.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 },
    );
  }

  // re-check the DB in case someone grabbed this subdomain in the seconds since the frontend checked
  const { data: existing } = await supabaseAdmin
    .from("businesses")
    .select("id")
    .eq("subdomain", subdomain)
    .maybeSingle();

  // if a matching row came back, the subdomain's taken — reject
  if (existing) {
    return Response.json({ error: "Subdomain already taken" }, { status: 409 });
  }

  // creates the actual login account (email + password) in Supabase Auth
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // false = Supabase sends a verification email, blocks login until they click it
    });

  // if account creation failed (e.g. email already registered), reject
  if (authError) {
    return Response.json({ error: authError.message }, { status: 400 });
  }

  // grabs the newly created user's ID — needed to link the businesses row to this login account
  const userId = authData.user.id;

  // creates the business record, linked to the auth user, starting as "pending" until payment clears
  const { data: business, error: businessError } = await supabaseAdmin
    .from("businesses")
    .insert({
      owner_id: userId,
      name: businessName,
      subdomain,
      status: "pending",
    })
    .select()
    .single();

  // if the insert failed, reject
  if (businessError) {
    return Response.json({ error: businessError.message }, { status: 400 });
  }

  // creates a Stripe Checkout page with both the one-time fee and the subscription in one payment flow
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      { price: "price_1UEcju85XvaDUdCrcP7PpvOL", quantity: 1 }, // setup fee
      { price: "price_1UEclY85XvaDUdCrkLM8MYOF", quantity: 1 }, // monthly subscription
    ],
    metadata: { business_id: business.id }, // lets the webhook know which business this payment belongs to
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/signup/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/signup`,
  });

  // sends the Stripe Checkout URL back to the form, which redirects the browser there
  return Response.json({ checkoutUrl: session.url });
}
