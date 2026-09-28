"use client"; // needs browser state + localStorage, so this runs client-side

import { useState, useEffect } from "react";

export default function CookieBanner() {
  // Controls whether the banner shows at all — starts hidden until we check localStorage.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // On page load, check if the user already made a choice before.
    const choice = localStorage.getItem("cookie-consent");
    // Only show the banner if no choice has been saved yet.
    if (!choice) setVisible(true);
  }, []);

  function handleChoice(choice: "accepted" | "rejected") {
    // Save the choice so the banner never shows again on this browser.
    localStorage.setItem("cookie-consent", choice);
    setVisible(false);
  }

  // Render nothing at all if the banner shouldn't show — cleanest way to "hide" it.
  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t px-4 py-4 flex items-center justify-between gap-4 z-50">
      <p className="text-sm">
        We use cookies to improve your experience. Accept or reject below.
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => handleChoice("rejected")}
          className="px-4 py-2 border rounded"
        >
          Reject
        </button>
        <button
          onClick={() => handleChoice("accepted")}
          className="px-4 py-2 bg-black text-white rounded"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
