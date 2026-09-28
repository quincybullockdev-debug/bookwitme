// runs in the browser to fetch and display stats
"use client";

import { useState, useEffect } from "react";
import { getStats } from "./actions";

export default function StatsCards({ businessId }: { businessId: string }) {
  // holds the stats object once fetched
  const [stats, setStats] = useState({
    revenue: 0,
    count: 0,
    topServices: [] as any[],
  });

  // loads stats for the current month on mount
  useEffect(() => {
    async function loadStats() {
      const now = new Date();
      const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      ).toISOString();
      const end = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
      ).toISOString();
      const data = await getStats(businessId, start, end);
      setStats(data);
    }
    loadStats();
  }, [businessId]);
  return (
    <div>
      <h3>This Month</h3>
      <p>Revenue: ${stats.revenue}</p>
      <p>Bookings: {stats.count}</p>

      <h4>Top Services</h4>
      <ul>
        {stats.topServices.map((s) => (
          <li key={s.name}>
            {s.name} — {s.count} bookings
          </li>
        ))}
      </ul>
    </div>
  );
}
