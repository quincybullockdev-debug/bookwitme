"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabasePublic } from "@/lib/supabase-public";
import { useBusiness } from "@/lib/business-context"; 
export default function BookingConfirmationPage() {
  const business = useBusiness();
  // Grabs the dynamic [id] segment from the URL.
  const params = useParams();
  const bookingId = params.id as string;

  // Holds the fetched booking data once loaded.
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [copied, setCopied] = useState(false);

  // Copies the business's Cash App tag to the clipboard, shows brief "Copied!" feedback.
  async function handleCopy() {
    await navigator.clipboard.writeText(`$${business.cashappTag}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  useEffect(() => {
    // Fetches this specific booking, plus its related service and customer info, in one query.
    async function fetchBooking() {
      const { data, error } = await supabasePublic
        .from("bookings")
        .select("*, services(name, price, deposit_amount), customers(name)")
        .eq("id", bookingId)
        .single();

      if (!error && data) setBooking(data);
      setLoading(false);
    }

    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return <p className="text-center py-20 text-gray-500">Loading...</p>;
  }

  if (!booking) {
    return (
      <p className="text-center py-20 text-gray-500">Booking not found.</p>
    );
  }

  return (
    <div>
      {" "}
      {booking.status === "pending" && (
        <div className="max-w-md mx-auto px-4 py-16">
          <h1 className="text-xl font-bold mb-4">Thank You</h1>

          <p className="text-sm text-gray-700 mb-6">
            We've received your request. You'll get a text and email within
            10-15 minutes if it's confirmed. Since other requests may exist for
            this time, please submit your deposit below to secure your spot — if
            we're unable to confirm your booking, your deposit will be refunded.
          </p>

          <div className="flex items-center gap-3 mb-2">
            <img
              src={business.cashappProfilePic}
              alt=""
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold">{business.name}</p>
              <p className="text-gray-600">${business.cashappTag}</p>
            </div>
            <button
              onClick={handleCopy}
              className="ml-auto text-sm border px-3 py-1 rounded"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          {booking.services.deposit_amount ? (
            <p className="text-sm text-gray-600 mb-6">
              Minimum deposit: ${booking.services.deposit_amount} — you may pay
              this or the full amount plus tip.
            </p>
          ) : (
            <p className="text-sm text-gray-600 mb-6">
              No deposit required for this service.
            </p>
          )}

          <p className="text-xs text-gray-400 text-center mt-8">
            Powered by BookMe
          </p>
        </div>
      )}
      {booking.status === "accepted" && (
        <div className="max-w-md mx-auto px-4 py-16">
          <h1 className="text-xl font-bold mb-4">You're Confirmed!</h1>

          <p className="text-sm text-gray-700 mb-6">
            Your appointment with {business.name} is booked. See you then!
          </p>

          <div className="border rounded p-4 mb-6 text-sm space-y-1">
            <p>
              <span className="font-semibold">Service:</span>{" "}
              {booking.services.name}
            </p>
            <p>
              <span className="font-semibold">Date:</span>{" "}
              {new Date(booking.start_time).toDateString()}
            </p>
            <p>
              <span className="font-semibold">Time:</span>{" "}
              {new Date(booking.start_time).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
            <p>
              <span className="font-semibold">Location:</span>{" "}
              {business.contact.address}
            </p>
          </div>

          <p className="text-xs text-gray-400 text-center mt-8">
            Powered by BookMe
          </p>
        </div>
      )}
      {booking.status === "declined" && (
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <h1 className="text-xl font-bold mb-4">Booking Not Confirmed</h1>
          <p className="text-sm text-gray-700">
            Unfortunately, this time slot wasn't available. Please visit our
            booking page to try another time.
          </p>
        </div>
      )}
    </div>
  );
}
