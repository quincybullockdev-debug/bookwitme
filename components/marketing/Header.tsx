"use client"; // this component uses browser interactivity (state + scroll detection), so it must run on the client, not the server

import { useState, useEffect, useRef } from "react";
import { useBusiness } from "@/lib/business-context";

export default function Header() {
  const business = useBusiness(); // add this line

  // Tracks whether we've scrolled past the hero — starts false (normal header) on page load.
  const [isSticky, setIsSticky] = useState(false);

  // A ref to an invisible marker element placed right after the hero, so we can watch when it's off-screen.
  const heroMarkerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set up the observer once when the component mounts.
    const observer = new IntersectionObserver(
      ([entry]) => {
        // isIntersecting is true when the marker is visible — false once it's scrolled out of view.
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: 0 },
    );

    if (heroMarkerRef.current) observer.observe(heroMarkerRef.current);

    // Clean up the observer when the component unmounts to avoid memory leaks.
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Invisible marker sitting right where the hero ends — this is what we're watching, not the hero itself */}
      <div ref={heroMarkerRef} />

      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all ${
          isSticky
            ? "bg-white shadow-md py-3 md:py-4"
            : "bg-transparent py-6 md:py-8"
        }`}
      >
        <div className="flex items-center px-4 md:px-8">
          {isSticky ? (
            // Sticky state: nav on the left, no logo
            <nav className="flex gap-6 md:gap-8 md:text-lg">
              <a href="/site">Home</a>
              <a href="/site/services">Services</a>
              <a href="/site/about">About</a>
              <a href="/site/contact">Contact</a>
              <a href="/site/policies">Policies</a>
            </nav>
          ) : (
            // Normal state: logo centered
            <div className="flex-1 text-center font-bold md:text-lg">
              {business.name}
            </div>
          )}

          {isSticky && (
            // Sticky state only: Book Appointment button on the right
            <a
              href="/site/booking"
              className="ml-auto bg-black text-white px-4 py-2 md:px-6 md:py-3 rounded"
            >
              Book Appointment
            </a>
          )}

          {/* Hamburger menu — only shows in normal (non-sticky) state */}
          {!isSticky && (
            <button className="ml-auto" aria-label="Open menu">
              ☰
            </button>
          )}
        </div>
      </header>
    </>
  );
}
