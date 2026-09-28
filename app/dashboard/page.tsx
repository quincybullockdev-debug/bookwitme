import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import DashboardCalendar from "./DashboardCalendar";
import ServicesManager from "./ServicesManager";
import HoursEditor from "./HoursEditor";
import BlockOutForm from "./BlockOutForm";
import BookingsList from "./BookingsList";
import PendingRequestsQueue from "./PendingRequestsQueue";
import CustomersList from "./CustomersList";
import StatsCards from "./StatsCards";
import RunningLateModal from "./RunningLateModal";
import SettingsForm from "./SettingsForm";

// this page is a Server Component — runs on the server, so it can safely fetch the business id
export default async function DashboardPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("USER:", user);

  // re-fetches the business here since page.tsx doesn't automatically get what layout.tsx fetched
  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", user!.id)
    .single();
  console.log("BUSINESS:", business, "ERROR:", businessError);

  return (
    <div>
      <DashboardCalendar businessId={business!.id} />
      <StatsCards businessId={business!.id} />
      <RunningLateModal businessId={business!.id} />
      <PendingRequestsQueue businessId={business!.id} />
      <ServicesManager businessId={business!.id} />
      <HoursEditor businessId={business!.id} />
      <BlockOutForm businessId={business!.id} />
      <BookingsList businessId={business!.id} />
      <CustomersList businessId={business!.id} />
      <SettingsForm business={business} />
    </div>
  );
}
