"use client";
import { useState } from "react";
import BookingCalendar from "@/components/booking/BookingCalendar";
import { submitBooking } from "@/app/(marketing)/site/booking/actions";
import { useRouter } from "next/navigation";

export default function BookingDrawer({
  service,
  selectedAddons,
  onToggleAddon,
  onClose,
  totalDuration,
  totalPrice,
  onConfirmDateTime,
  confirmedDateTime,
}: {
  service: any;
  selectedAddons: string[];
  onToggleAddon: (name: string) => void;
  onClose: () => void;
  totalDuration: number;
  totalPrice: number;
  onConfirmDateTime: (date: Date, time: string) => void;
  confirmedDateTime: { date: Date; time: string } | null;
}) {
  // Tracks the customer's info entered on the review screen.
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Tracks whether the submit is in progress, and any error message from the server.
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();

  // Called when the customer clicks Submit — sends everything to the Server Action.
  async function handleSubmit() {
    if (!confirmedDateTime) return;

    setSubmitting(true);
    setSubmitError(null);

    const addonIds = (service.service_addons ?? [])
      .filter((a: any) => selectedAddons.includes(a.name))
      .map((a: any) => a.id);

    const dateStr = confirmedDateTime.date.toISOString().split("T")[0];

    const result = await submitBooking({
      name,
      phone,
      email,
      serviceId: service.id,
      addonIds,
      date: dateStr,
      time: confirmedDateTime.time,
      durationMinutes: totalDuration,
    });

    setSubmitting(false);

    if (result.error) {
      setSubmitError(result.error);
    } else {
      router.push(`/site/booking/confirmation/${result.bookingId}`);
    }
  }

  return (
    <>
      {/* Dark overlay behind the drawer — clicking it closes the drawer */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Drawer slides in from the right, fixed to the viewport */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white text-black z-50 overflow-y-auto p-6">
        {/* Close button + link back to service selection */}
        <button onClick={onClose} className="mb-4 text-gray-500">
          ✕ Close
        </button>

        {/* Service selection + add-ons + calendar — hidden once date/time is confirmed */}
        {!confirmedDateTime && (
          <>
            <h2 className="text-xl font-bold mb-1">{service.name}</h2>
            <p className="text-gray-600 mb-6">
              {service.duration_minutes} min • ${service.price}
            </p>

            {/* Add-ons, only if this service has any */}
            {service.service_addons && service.service_addons.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Add-ons</h3>
                {service.service_addons.map((addon: any, index: number) => (
                  <label
                    key={index}
                    className="flex justify-between p-3 mb-2 rounded border border-gray-200"
                  >
                    <span>
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={selectedAddons.includes(addon.name)}
                        onChange={() => onToggleAddon(addon.name)}
                      />
                      {addon.name} | {addon.duration_minutes} min
                    </span>
                    <span>${addon.price}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Running total, updates as add-ons are toggled */}
            <div className="flex justify-between font-semibold mb-6 border-t pt-4">
              <span>Total: {totalDuration} min</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>

            {/* Date/time picker lives in the same drawer */}
            <h3 className="font-semibold mb-2">Pick a Date</h3>
            <BookingCalendar
              durationMinutes={totalDuration}
              onConfirm={onConfirmDateTime}
            />
          </>
        )}

        {/* Review screen — shows once date/time is confirmed */}
        {confirmedDateTime && (
          <div>
            <h2 className="text-xl font-bold mb-4">Review Your Booking</h2>

            <div className="mb-6 space-y-1 text-sm">
              <p>
                <span className="font-semibold">Service:</span> {service.name}
              </p>
              {selectedAddons.length > 0 && (
                <p>
                  <span className="font-semibold">Add-ons:</span>{" "}
                  {selectedAddons.join(", ")}
                </p>
              )}
              <p>
                <span className="font-semibold">Date:</span>{" "}
                {confirmedDateTime.date.toDateString()}
              </p>
              <p>
                <span className="font-semibold">Time:</span>{" "}
                {confirmedDateTime.time}
              </p>
              <p className="font-semibold mt-2">
                Total: ${totalPrice.toFixed(2)}
              </p>
              {service.deposit_amount && (
                <p className="text-sm text-gray-600">
                  Minimum deposit required: ${service.deposit_amount} — you may
                  pay this or the full amount plus tip via Cash App.
                </p>
              )}
            </div>

            <p className="text-xs text-gray-500 mb-6">
              Note: other requests may exist for this time slot.
            </p>

            <div className="space-y-3 mb-6">
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border rounded"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 border rounded"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border rounded"
              />
            </div>

            {submitError && (
              <p className="text-red-600 text-sm mb-3">{submitError}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-black text-white py-3 rounded font-semibold disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Booking Request"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
