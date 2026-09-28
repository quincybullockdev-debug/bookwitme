import { useBusiness } from "@/lib/business-context";import SmallHero from "@/components/marketing/SmallHero";
 
export default function AboutPage() {
  const business = useBusiness();
  return (
    <div>
      <SmallHero title="About" />

      <div className="px-4 py-12 md:py-20 max-w-2xl md:max-w-3xl mx-auto">
        {business.about.map((paragraph, index) => (
          <p key={index} className="mb-4 md:text-lg">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="px-4 pb-12 md:pb-20 max-w-2xl md:max-w-3xl mx-auto">
        <img
          src="/about-photo.jpg"
          alt={business.name}
          className="w-full rounded mb-8"
        />

        <a
          href="/site/booking"
          className="block text-center bg-black text-white py-3 rounded"
        >
          Book With Us
        </a>
      </div>
    </div>
  );
}
