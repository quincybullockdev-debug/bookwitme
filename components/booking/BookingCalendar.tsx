"use client";

import { DayPicker } from "@daypicker/react";
import "@daypicker/react/style.css";
import { useState } from "react";
import { getAvailableSlots } from "@/app/(marketing)/site/booking/actions";

export default function BookingCalendar({
  durationMinutes,
  onConfirm,
}: {
  durationMinutes: number;
  onConfirm: (date: Date, time: string) => void;
}) {
  // Tracks which date the customer has clicked on — starts as undefined (none selected).
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  // Holds the available time slots for the picked date, once fetched.
  const [slots, setSlots] = useState<string[]>([]);
  // Tracks the currently selected time slot.
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  // Tracks whether the calendar grid is showing — collapses to a summary line once a date's picked.
  const [calendarOpen, setCalendarOpen] = useState(true);
  // Tracks whether the time slot grid is showing — collapses to a summary line once a time's picked.
  const [timeOpen, setTimeOpen] = useState(true);

  // Called whenever the customer clicks a date — fetches that date's available slots.
  async function handleSelectDate(date: Date | undefined) {
    setSelectedDate(date);
    setSelectedTime(null);
    setTimeOpen(true); // reset time section back open since the date changed
    setCalendarOpen(false); // collapse the calendar once a date is chosen
    if (!date) return;

    const dateStr = date.toISOString().split("T")[0];
    const availableSlots = await getAvailableSlots(dateStr, durationMinutes);
    setSlots(availableSlots);
  }

  // Called whenever the customer clicks a time slot — collapses the time section.
  function handleSelectTime(time: string) {
    setSelectedTime(time);
    setTimeOpen(false);
  }

  // Converts a "14:30" style 24-hour string into "2:30 PM" for display.
  function formatTime(time: string) {
    const [hourStr, minute] = time.split(":");
    const hour = parseInt(hourStr);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:${minute} ${period}`;
  }

  return (
    <div>
      {/* Collapsed summary row — shows once a date is picked */}
      {!calendarOpen && selectedDate && (
        <div className="flex justify-between items-center p-3 border rounded mb-4">
          <span className="underline">{selectedDate.toDateString()}</span>
          <button
            onClick={() => setCalendarOpen(true)}
            className="text-gray-500"
          >
            ✎ Edit
          </button>
        </div>
      )}

      {/* Full calendar — shows before a date is picked, or when editing */}
      {calendarOpen && (
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={handleSelectDate}
        />
      )}

      {/* Time section only shows once a date is picked and calendar is collapsed */}
      {selectedDate && !calendarOpen && (
        <div className="mt-4">
          {/* Collapsed summary row — shows once a time is picked */}
          {!timeOpen && selectedTime && (
            <div className="flex justify-between items-center p-3 border rounded">
              <span className="underline">{formatTime(selectedTime)}</span>
              <button
                onClick={() => setTimeOpen(true)}
                className="text-gray-500"
              >
                ✎ Edit
              </button>
            </div>
          )}

          {/* Full time slot grid — shows before a time is picked, or when editing */}
          {timeOpen && (
            <>
              <h3 className="font-semibold mb-2">Pick a Time</h3>

              {slots.length === 0 && (
                <p className="text-gray-500 text-sm">
                  No available times this day.
                </p>
              )}

              <div className="grid grid-cols-3 gap-2">
                {slots.map((time) => (
                  <button
                    key={time}
                    onClick={() => handleSelectTime(time)}
                    className={`p-2 rounded border text-sm ${
                      selectedTime === time
                        ? "border-black bg-gray-50"
                        : "border-gray-200"
                    }`}
                  >
                    {formatTime(time)}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Continue button — only shows once both date and time are picked */}
      {selectedDate && selectedTime && (
        <button
          onClick={() => onConfirm(selectedDate, selectedTime)}
          className="w-full mt-6 bg-black text-white py-3 rounded font-semibold"
        >
          Continue
        </button>
      )}
    </div>
  );
}
