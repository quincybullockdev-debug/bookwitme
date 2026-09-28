// runs in the browser for form state
"use client";

import { useState, useEffect } from "react";
import {
  getBlockedDates,
  createBlockedDate,
  deleteBlockedDate,
} from "./actions";

export default function BlockOutForm({ businessId }: { businessId: string }) {
  // holds the list of existing blocks
  const [blocks, setBlocks] = useState<any[]>([]);

  // form state — toggles between single-date and recurring-weekly mode
  const [isRecurring, setIsRecurring] = useState(false);
  const [date, setDate] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("0");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");

  // loads existing blocks once on mount
  useEffect(() => {
    async function loadBlocks() {
      const data = await getBlockedDates(businessId);
      setBlocks(data);
    }
    loadBlocks();
  }, [businessId]);

  // builds the block object from form state and saves it
  // builds the block object from form state and saves it
  async function handleCreate() {
    await createBlockedDate(businessId, {
      is_recurring: isRecurring,
      date: isRecurring ? undefined : date,
      day_of_week: isRecurring ? Number(dayOfWeek) : undefined,
      start_time: startTime || undefined,
      end_time: endTime || undefined,
      reason: reason || undefined,
    });

    // refreshes the list and clears the form
    const data = await getBlockedDates(businessId);
    setBlocks(data);
    setDate("");
    setStartTime("");
    setEndTime("");
    setReason("");
  }

  // deletes a block, then refreshes the list
  async function handleDelete(blockId: string) {
    await deleteBlockedDate(blockId);
    const data = await getBlockedDates(businessId);
    setBlocks(data);
  }

  return (
    <div>
      {/* toggle between single-date and recurring-weekly block */}
      <label>
        <input
          type="checkbox"
          checked={isRecurring}
          onChange={(e) => setIsRecurring(e.target.checked)}
        />
        Recurring weekly
      </label>

      {/* shows a date picker OR a day-of-week dropdown depending on the toggle */}
      {isRecurring ? (
        <select
          value={dayOfWeek}
          onChange={(e) => setDayOfWeek(e.target.value)}
        >
          <option value="0">Sunday</option>
          <option value="1">Monday</option>
          <option value="2">Tuesday</option>
          <option value="3">Wednesday</option>
          <option value="4">Thursday</option>
          <option value="5">Friday</option>
          <option value="6">Saturday</option>
        </select>
      ) : (
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      )}

      {/* optional partial-day time range — leave blank to block the whole day */}
      <input
        type="time"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        placeholder="Start (optional)"
      />
      <input
        type="time"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        placeholder="End (optional)"
      />

      <input
        placeholder="Reason (optional)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />

      <button onClick={handleCreate}>Add Block</button>

      {/* list of existing blocks with delete buttons */}
      <ul>
        {blocks.map((block) => (
          <li key={block.id}>
            {block.is_recurring
              ? `Every week — day ${block.day_of_week}`
              : block.date}
            {block.start_time && ` (${block.start_time} - ${block.end_time})`}
            {block.reason && ` — ${block.reason}`}
            <button onClick={() => handleDelete(block.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
