"use client"; // needs browser timers/state, must run client-side

import { useState, useEffect } from "react";

export function useTypewriter(text: string, speed = 80) {
  // Tracks how much of the text has been "typed" so far.
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let index = 0;
    // Adds one more letter every `speed` milliseconds until the full text is shown.
    const interval = setInterval(() => {
      index++;
      setDisplayed(text.slice(0, index));
      if (index === text.length) clearInterval(interval);
    }, speed);

    // Clean up the timer if the component unmounts mid-animation.
    return () => clearInterval(interval);
  }, [text, speed]);

  return displayed;
}
