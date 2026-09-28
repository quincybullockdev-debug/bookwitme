// runs in the browser for search input and click handlers
"use client";

import { useState, useEffect } from "react";
import { getCustomers, getBookingHistory } from "./actions";

export default function CustomersList({ businessId }: { businessId: string }) {
  // holds the full customer list
  const [customers, setCustomers] = useState<any[]>([]);

  // holds what's typed in the search box
  const [search, setSearch] = useState("");

  // tracks which customer is currently expanded to show history, null = none
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // holds the booking history for whichever customer is expanded
  const [history, setHistory] = useState<any[]>([]);

  // loads all customers once on mount
  useEffect(() => {
    async function loadCustomers() {
      const data = await getCustomers(businessId);
      setCustomers(data);
    }
    loadCustomers();
  }, [businessId]);

  // filters the customer list to names matching the search box (case-insensitive)
  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  // clicking a customer toggles their history open/closed and loads it if opening
  async function toggleHistory(customerId: string) {
    if (expandedId === customerId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(customerId);
    const data = await getBookingHistory(customerId);
    setHistory(data);
  }
  return (
    <div>
      {/* search box filters the list live as you type */}
      <input
        placeholder="Search customers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <ul>
        {filteredCustomers.map((customer) => (
          <li key={customer.id}>
            <span onClick={() => toggleHistory(customer.id)}>
              {customer.name} — {customer.phone}
            </span>

            {/* only show history for the customer that's currently expanded */}
            {expandedId === customer.id && (
              <ul>
                {history.map((booking) => (
                  <li key={booking.id}>
                    {booking.services?.name} — {booking.start_time} —{" "}
                    {booking.status}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
