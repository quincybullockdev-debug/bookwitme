// runs in the browser for click handlers
"use client";

import { useState, useEffect } from "react";
import { getPendingRequests, acceptBooking, declineBooking } from "./actions";

export default function PendingRequestsQueue({
  businessId,
}: {
  businessId: string;
}) {
  // holds the list of pending booking requests
  const [requests, setRequests] = useState<any[]>([]);

  // loads the pending list once on mount
  useEffect(() => {
    async function loadRequests() {
      const data = await getPendingRequests(businessId);
      setRequests(data);
    }
    loadRequests();
  }, [businessId]);

  // accepts a request, then refreshes the list (accepted + demoted bookings drop off since they're no longer pending)
  async function handleAccept(bookingId: string) {
    await acceptBooking(bookingId);
    const data = await getPendingRequests(businessId);
    setRequests(data);
  }

  // declines a request, then refreshes the list
  async function handleDecline(bookingId: string) {
    await declineBooking(bookingId);
    const data = await getPendingRequests(businessId);
    setRequests(data);
  }

  return (
    <div>
      <h3>Pending Requests</h3>
      <ul>
        {requests.map((request) => (
          <li key={request.id}>
            {request.services?.name} — {request.start_time}
            <button onClick={() => handleAccept(request.id)}>Accept</button>
            <button onClick={() => handleDecline(request.id)}>Decline</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
