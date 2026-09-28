import { useBusiness } from "@/lib/business-context";
import TransitionShape from "@/components/marketing/TransitionShape";
import { useTypewriter } from "@/lib/useTypewriter";

export default function HeroVariantA() {
  const business = useBusiness(); // add this line

  // Runs the typewriter effect on the hero tagline text.
  const typedTagline = useTypewriter(business.heroTagline);

  return (
    <section
      className="relative h-screen flex flex-col items-center justify-between overflow-hidden"
      style={{ backgroundColor: business.colors.primary }}
    >
      {/* Logo silhouette, faded into the background */}
      <img
        src="/logo-silhouette.png"
        alt=""
        className="absolute inset-0 w-full h-full object-contain opacity-10"
      />

      {/* One-liner sits in the upper portion, centered */}
      <h1 className="mt-24 md:mt-32 text-3xl md:text-5xl text-white font-bold text-center z-10">
        {typedTagline}
      </h1>

      {/* PNG cutout image, takes up the bulk of the middle */}
      <img
        src="/hero-cutout.png"
        alt=""
        className="flex-1 max-h-[60vh] md:max-h-[70vh] object-contain z-10 animate-slide-up"
      />

      {/* Book Now button, low in the viewport, sits over the PNG */}

      <a
        href="/site/booking"
        className="mb-16 bg-white text-black px-6 py-3 rounded font-semibold z-20"
      >
        Book Now
      </a>

      {/* Transition shape at the very bottom of the hero */}
      <div className="absolute bottom-0 left-0 w-full z-10">
        <TransitionShape variant="wave" />
      </div>

      {/* Marker for the sticky header's scroll detection — must be the last thing in the hero */}
      <div id="hero-end-marker" />
    </section>
  );
}
