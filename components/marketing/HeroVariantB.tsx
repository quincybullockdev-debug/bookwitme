import { useBusiness } from "@/lib/business-context";
import TransitionShape from "@/components/marketing/TransitionShape";
import { useTypewriter } from "@/lib/useTypewriter";

export default function HeroVariantB() {
  const business = useBusiness(); // add this line

  // Runs the typewriter effect on the hero tagline text — same hook used in Variant A.
  const typedTagline = useTypewriter(business.heroTagline);

  return (
    <section className="relative h-screen flex flex-col items-center justify-between overflow-hidden">
      {/* Looping gif fills the entire hero background, standing in for a video */}
      <img
        src="/hero-loop.gif"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark overlay so the white text stays readable over a busy gif */}
      <div className="absolute inset-0 bg-black/30 z-0" />

      {/* One-liner sits in the upper portion, centered — same position as Variant A */}
      <h1 className="mt-24 md:mt-32 text-3xl md:text-5xl text-white font-bold text-center z-10">
        {typedTagline}
      </h1>

      {/* Book Now button, low in the viewport, sits over the gif */}

      <a
        href="/booking"
        className="mb-16 bg-white text-black px-6 py-3 rounded font-semibold z-20"
      >
        Book Now
      </a>

      {/* Transition shape at the very bottom of the hero — same as Variant A */}
      <div className="absolute bottom-0 left-0 w-full z-10">
        <TransitionShape variant="wave" />
      </div>

      {/* Marker for the sticky header's scroll detection — must be the last thing in the hero */}
      <div id="hero-end-marker" />
    </section>
  );
}
