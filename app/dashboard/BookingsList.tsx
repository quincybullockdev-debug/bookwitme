// runs in the browser for tab state and click handlers
"use client";

import { useState, useEffect } from "react";
import { getBookingsByStatus, cancelBooking } from "./actions";
import { rescheduleBooking } from "./actions";

export default function BookingsList({ businessId }: { businessId: string }) {
  // which tab is currently active
  const [view, setView] = useState<"upcoming" | "past" | "cancelled">(
    "upcoming",
  );

  // holds the new start time input, keyed by booking id so each row has its own input
  const [newTimes, setNewTimes] = useState<Record<string, string>>({});

  // holds any conflict warning message, keyed by booking id
  const [conflicts, setConflicts] = useState<Record<string, string>>({});

  // holds the bookings for whichever tab is active
  const [bookings, setBookings] = useState<any[]>([]);

  // re-fetches whenever the active tab changes
  useEffect(() => {
    async function loadBookings() {
      const data = await getBookingsByStatus(businessId, view);
      setBookings(data);
    }
    loadBookings();
  }, [businessId, view]);

  // cancels a booking, then refreshes the current tab's list
  async function handleCancel(bookingId: string) {
    await cancelBooking(bookingId);
    const data = await getBookingsByStatus(businessId, view);
    setBookings(data);
  }
  // attempts to move a booking to the time typed in for that row
  async function handleReschedule(booking: any) {
    const newStart = newTimes[booking.id];
    if (!newStart) return;

    // keeps the same duration as the original booking, just shifted to the new start time
    const durationMs =
      new Date(booking.end_time).getTime() -
      new Date(booking.start_time).getTime();
    const newEnd = new Date(
      new Date(newStart).getTime() + durationMs,
    ).toISOString();

    const result = await rescheduleBooking(booking.id, newStart, newEnd);

    if (result.needsApproval) {
      setConflicts({
        ...conflicts,
        [booking.id]: `Conflicts with ${result.conflictCount} other booking(s)`,
      });
    } else {
      setConflicts({ ...conflicts, [booking.id]: "" });
      const data = await getBookingsByStatus(businessId, view);
      setBookings(data);
    }
  }

  return (
    <div>
      {/* tab buttons — clicking one switches the active view */}
      <button onClick={() => setView("upcoming")}>Upcoming</button>
      <button onClick={() => setView("past")}>Past</button>
      <button onClick={() => setView("cancelled")}>Cancelled</button>

      {/* the list for whichever tab is active */}
      <ul>
        {bookings.map((booking) => (
          <li key={booking.id}>
            {booking.services?.name} — {booking.start_time} — {booking.status}
            {view === "upcoming" && (
              <button onClick={() => handleCancel(booking.id)}>Cancel</button>
            )}
            {/* reschedule controls, upcoming tab only */}
            {view === "upcoming" && (
              <>
                <input
                  type="datetime-local"
                  onChange={(e) =>
                    setNewTimes({
                      ...newTimes,
                      [booking.id]: new Date(e.target.value).toISOString(),
                    })
                  }
                />
                <button onClick={() => handleReschedule(booking)}>Move</button>
                {conflicts[booking.id] && <span>{conflicts[booking.id]}</span>}
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
