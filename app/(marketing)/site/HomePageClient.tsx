"use client";
import { useState } from "react";
import TransitionShape from "@/components/marketing/TransitionShape";
import ContactBlock from "@/components/marketing/ContactBlock";
import HeroVariantA from "@/components/marketing/HeroVariantA";
import HeroVariantB from "@/components/marketing/HeroVariantB";

export default function HomePageClient({ business }: { business: any }) {  
  // Tracks which review is currently shown (starts at the first one).
  const [currentReview, setCurrentReview] = useState(0);
  // Tracks whether the current review's full text is expanded.
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      {/* Announcement bar — sits above everything, uses the secondary brand color */}
      <div
        className="text-center py-2 text-sm font-medium"
        style={{ backgroundColor: business.colors.secondary }}
      >
        {business.announcement}
      </div>

      {/* Hero section — variant A: solid brand color background */}
      {business.heroVariant === "A" ? <HeroVariantA /> : <HeroVariantB />}

      {/* Intro blurb — centered heading + short paragraph */}
      <section className="px-4 py-16 md:py-24 text-center max-w-xl md:max-w-2xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          {business.intro.heading}
        </h2>
        <p className="text-gray-700 md:text-lg">{business.intro.body}</p>
      </section>

      {/* Transition shape between intro and the next section */}
      <TransitionShape variant="curve" />

      {/* Work showcase — grid of photos, zooms in slightly on hover */}
      <section className="px-4 py-16 md:py-24 max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
          Our Work
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {/* Loop over 6 placeholder photos — swap these paths per client */}
          {[
            "work-1.jpg",
            "work-2.jpg",
            "work-3.jpg",
            "work-4.jpg",
            "work-5.jpg",
            "work-6.jpg",
          ].map((photo, index) => (
            <div key={index} className="overflow-hidden rounded">
              <img
                src={`/${photo}`}
                alt=""
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Transition shape after the work showcase */}
      <TransitionShape variant="zigzag" />

      {/* Book With Us CTA — standalone section between work showcase and reviews */}
      <section className="px-4 py-16 md:py-24 text-center">
        <a
          href="/site/booking"
          className="inline-block bg-black text-white px-8 md:px-12 py-4 md:py-5 rounded font-semibold md:text-lg"
        >
          Book With Us
        </a>
      </section>

      {/* Transition shape after the CTA */}
      <TransitionShape variant="diagonal" />

      {/* Social proof — dark background section holding the review cards */}
      <section className="bg-black py-16 md:py-24 px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8 md:mb-12">
          Happy Customers
        </h2>

        {/* Grab the currently active review from the content file */}
        <div className="max-w-md md:max-w-lg mx-auto bg-neutral-800 rounded-xl p-6 md:p-8">
          {" "}
          {/* Stars — static 5-star display for now */}
          <div className="text-yellow-400 mb-3">★★★★★</div>
          {/* Review text — full text if expanded, otherwise cut to 100 characters */}
          <p className="text-white font-bold mb-2">
            {expanded
              ? business.reviews[currentReview].text
              : business.reviews[currentReview].text.slice(0, 100) + "..."}
          </p>
          {/* Read more toggle — only shows if the text is actually longer than 100 characters */}
          {business.reviews[currentReview].text.length > 100 && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="text-gray-400 text-sm mb-4"
            >
              Read more
            </button>
          )}
          {/* Logo + reviewer name side by side */}
          <div className="flex items-center gap-2 mt-4">
            <img
              src={business.reviews[currentReview].logo}
              alt=""
              className="h-5"
            />
            <span className="text-gray-300 text-sm">
              {business.reviews[currentReview].author}
            </span>
          </div>
        </div>

        {/* Arrow to cycle to the next review, wraps back to the first after the last */}
        <button
          onClick={() => {
            setCurrentReview((prev) => (prev + 1) % business.reviews.length);
            setExpanded(false); // collapse back to short text when switching reviews
          }}
          className="block mx-auto mt-6 text-white text-2xl"
        >
          →
        </button>
      </section>

      {/* Transition shape after reviews */}
      <TransitionShape variant="wave" />

      {/* Contact block — reused component, same content as the dedicated Contact page */}
      <section className="px-4 py-16 md:py-24 max-w-2xl md:max-w-3xl mx-auto">
        <ContactBlock />
      </section>

      {/* Book Online button */}
      <div className="px-4 pb-8 text-center">
        <a
          href="/site/booking"
          className="inline-block bg-black text-white px-8 py-3 rounded font-semibold"
        >
          Book Online
        </a>
      </div>

      {/* Transition shape between contact and follow-us */}
      <TransitionShape variant="curve" />

      {/* Follow Us — social handles + photo grid */}
      <section className="px-4 py-16 md:py-24 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Follow Us</h2>
        <a
          href={business.socials.instagram}
          className="text-gray-600 mb-6 inline-block"
        >
          @nnaturalhairstudio
        </a>

        <div className="grid grid-cols-3 gap-2 md:gap-4 max-w-md md:max-w-lg mx-auto">
          {/* Loop over 3 placeholder social photos */}
          {["social-1.jpg", "social-2.jpg", "social-3.jpg"].map(
            (photo, index) => (
              <img
                key={index}
                src={`/${photo}`}
                alt=""
                className="w-full aspect-square object-cover rounded"
              />
            ),
          )}
        </div>
      </section>

      {/* Transition shape closing out the page before the global footer */}
      <TransitionShape variant="diagonal" />
    </div>
  );
}
