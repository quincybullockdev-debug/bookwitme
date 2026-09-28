"use client";
import { useBusiness } from "@/lib/business-context";import { supabasePublic } from "@/lib/supabase-public";
import { useState, useEffect } from "react";
import BookingDrawer from "@/components/booking/BookingDrawer";
 
export default function BookingPage() {
  const business = useBusiness();
  // Holds the real services fetched from Supabase, replacing the old hardcoded business.services.
  const [services, setServices] = useState<any[]>([]);
  // Tracks whether the fetch is still in progress, so we can show a loading state.
  const [loading, setLoading] = useState(true);
  // Tracks which service the customer has clicked on — starts as null (none selected), also controls whether the drawer is open.
  const [selectedService, setSelectedService] = useState<any>(null);
  // Tracks which add-ons are checked — array of addon names.
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  // Holds the confirmed date + time once the customer clicks Continue in the drawer.
  const [confirmedDateTime, setConfirmedDateTime] = useState<{
    date: Date;
    time: string;
  } | null>(null);

  useEffect(() => {
    // Fetches all services for this business, plus each service's add-ons in one nested query.
    async function fetchServices() {
      const { data, error } = await supabasePublic
        .from("services")
        .select("*, service_addons(*)")
        .eq("business_id", business.businessId);

      if (!error && data) setServices(data);
      setLoading(false);
    }

    fetchServices();
  }, []);

  // Adds up the base service duration/price plus every currently selected add-on — DB values are already numbers.
  const totalDuration = selectedService
    ? selectedService.duration_minutes +
      (selectedService.service_addons ?? [])
        .filter((a: any) => selectedAddons.includes(a.name))
        .reduce((sum: number, a: any) => sum + a.duration_minutes, 0)
    : 0;

  const totalPrice = selectedService
    ? selectedService.price +
      (selectedService.service_addons ?? [])
        .filter((a: any) => selectedAddons.includes(a.name))
        .reduce((sum: number, a: any) => sum + a.price, 0)
    : 0;

  // Toggles one add-on on/off in the selectedAddons array — passed down into the drawer.
  function toggleAddon(name: string) {
    setSelectedAddons((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  }

  // Closes the drawer and clears add-on selections, so picking a new service starts fresh.
  function closeDrawer() {
    setSelectedService(null);
    setSelectedAddons([]);
  }

  // Called when the customer confirms their date/time in the drawer.
  function handleConfirmDateTime(date: Date, time: string) {
    setConfirmedDateTime({ date, time });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold px-4 pt-12 text-center">
        Book an Appointment
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Select a service to get started
      </p>

      <div className="px-4 max-w-2xl mx-auto">
        {/* Loading state while Supabase fetch is in progress */}
        {loading && (
          <p className="text-center text-gray-500">Loading services...</p>
        )}

        {/* Flat loop over real services fetched from Supabase */}
        {!loading &&
          services.map((service) => (
            <button
              key={service.id}
              onClick={() => setSelectedService(service)}
              className="w-full flex justify-between p-4 mb-2 rounded border border-gray-200"
            >
              <span>
                {service.name} | {service.duration_minutes} min
              </span>
              <span>${service.price}</span>
            </button>
          ))}
      </div>

      {/* Drawer only renders once a service is selected */}
      {selectedService && (
        <BookingDrawer
          service={selectedService}
          selectedAddons={selectedAddons}
          onToggleAddon={toggleAddon}
          onClose={closeDrawer}
          totalDuration={totalDuration}
          totalPrice={totalPrice}
          onConfirmDateTime={handleConfirmDateTime}
          confirmedDateTime={confirmedDateTime}
        />
      )}
    </div>
  );
}
