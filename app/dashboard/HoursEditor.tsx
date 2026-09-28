// runs in the browser for form inputs and state
"use client";

import { useState, useEffect } from "react";
import { getBusinessHours, updateBusinessHours } from "./actions";

// the 7 days, in display order
const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export default function HoursEditor({ businessId }: { businessId: string }) {
  // holds the hours object — starts null until loaded from the DB
  const [hours, setHours] = useState<any>(null);

  // loads the current hours once when the component mounts
  useEffect(() => {
    async function loadHours() {
      const data = await getBusinessHours(businessId);
      // if no hours exist yet, start with all days closed as a default
      const defaultHours = Object.fromEntries(
        DAYS.map((day) => [day, { open: "", close: "", closed: true }]),
      );
      setHours(data || defaultHours);
    }
    loadHours();
  }, [businessId]);

  // updates one field (open, close, or closed) for one day in the hours object
  function updateDay(day: string, field: string, value: string | boolean) {
    setHours({
      ...hours,
      [day]: { ...hours[day], [field]: value },
    });
  }

  // saves the whole hours object back to the DB
  async function handleSave() {
    await updateBusinessHours(businessId, hours);
  }

  // don't render the form until hours has actually loaded
  if (!hours) return <p>Loading...</p>;

  return (
    <div>
      {DAYS.map((day) => (
        <div key={day}>
          <span>{day}</span>
          <input
            type="checkbox"
            checked={hours[day]?.closed || false}
            onChange={(e) => updateDay(day, "closed", e.target.checked)}
          />
          <span>Closed</span>
          <input
            type="time"
            value={hours[day]?.open || ""}
            onChange={(e) => updateDay(day, "open", e.target.value)}
          />
          <input
            type="time"
            value={hours[day]?.close || ""}
            onChange={(e) => updateDay(day, "close", e.target.value)}
          />
        </div>
      ))}
      <button onClick={handleSave}>Save Hours</button>
    </div>
  );
}
