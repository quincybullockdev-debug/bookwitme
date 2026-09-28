// this runs in the browser, not the server — needed since this component has clicks/state (picking a day, opening a booking)
"use client";

// useState holds data that changes (like which date is selected), useEffect runs code on load or when something changes
import { useState, useEffect } from "react";

// pulls in the function we built to fetch bookings
import { getBookingsForRange } from "./actions";

import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/monarch/theme.css";
import "@fullcalendar/react/themes/monarch/palettes/purple.css";

import themePlugin from "@fullcalendar/react/themes/monarch";

// the FullCalendar component itself — renders the whole calendar UI
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";

// component takes the businessId so it knows whose bookings to fetch
export default function DashboardCalendar({
  businessId,
}: {
  businessId: string;
}) {
  // holds the list of bookings once fetched — starts empty
  const [bookings, setBookings] = useState<any[]>([]);

  // holds which date the user currently has selected on the calendar — starts as today
  const [selectedDate, setSelectedDate] = useState(new Date());

  // runs automatically whenever selectedDate changes (including on first load)
  useEffect(() => {
    // marks this as an async function so we can use "await" inside for the DB call
    async function loadBookings() {
      // builds the start of the visible range — first day of selectedDate's month
      const start = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        1,
      ).toISOString();
      // builds the end of the visible range — last day of selectedDate's month
      const end = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth() + 1,
        0,
      ).toISOString();
      // calls the Server Action, passing business and date range
      const data = await getBookingsForRange(businessId, start, end);
      // stores what came back so the component re-renders with real bookings
      setBookings(data);
    }
    loadBookings();
  }, [selectedDate]);

  // FullCalendar wants events shaped as {title, start}, not our raw booking rows — this converts them
  const calendarEvents = bookings.map((booking) => ({
    title: booking.services?.name || "Booking",
    start: booking.start_time,
  }));

  return (
    <FullCalendar
      // loads the month/week grid view capability
      plugins={[dayGridPlugin]}
      // which view shows by default when the calendar loads
      initialView="dayGridMonth"
      // feeds our reshaped bookings in as calendar events
      events={calendarEvents}
    />
  );
}
