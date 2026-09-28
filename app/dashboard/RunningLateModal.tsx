// runs in the browser for the delay input and button
"use client";

import { useState } from "react";
import { applyDelay } from "./actions";

export default function RunningLateModal({
  businessId,
}: {
  businessId: string;
}) {
  // holds the chosen delay amount
  const [delay, setDelay] = useState("15");

  // shows a confirmation message after applying
  const [applied, setApplied] = useState(false);

  // applies the delay to today's remaining bookings
  async function handleApply() {
    const today = new Date().toISOString().split("T")[0];
    await applyDelay(businessId, today, Number(delay));
    setApplied(true);
  }

  return (
    <div>
      <h3>Running Late</h3>
      <select value={delay} onChange={(e) => setDelay(e.target.value)}>
        <option value="10">10 minutes</option>
        <option value="15">15 minutes</option>
        <option value="20">20 minutes</option>
        <option value="30">30 minutes</option>
      </select>
      <button onClick={handleApply}>Apply Delay</button>
      {applied && <p>Remaining bookings shifted.</p>}
    </div>
  );
}
