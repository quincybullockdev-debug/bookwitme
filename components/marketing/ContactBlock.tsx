"use client";

import { useBusiness } from "@/lib/business-context"; // add this line
export default function ContactBlock() {
  const business = useBusiness(); // add this line

  return (
    <div>
      {/* Address and phone straight from the content file */}
      <p className="mb-2 font-semibold">{business.contact.address}</p>
      <p className="mb-6">{business.contact.phone}</p>

      {/* Loop over the hours array, one row per line */}
      <h2 className="text-xl font-semibold mb-2">Hours</h2>
      {business.contact.hours.map((entry, index) => (
        <p key={index}>
          {entry.day}: {entry.hours}
        </p>
      ))}

      {/* Embedded Google Map, using the business address as the search query */}
      <iframe
        src={`https://www.google.com/maps?q=${encodeURIComponent(business.contact.address)}&output=embed`}
        className="w-full h-64 rounded mt-6 border-0"
        loading="lazy"
      />
    </div>
  );
}
