import SmallHero from "@/components/marketing/SmallHero";
import ContactBlock from "@/components/marketing/ContactBlock";

export default function ContactPage() {
  return (
    <div>
      <SmallHero title="Contact" />
      <div className="px-4 py-12 md:py-20 max-w-2xl md:max-w-3xl mx-auto">
        <ContactBlock />
      </div>

      {/* Book With Us CTA button */}
      <div className="px-4 pb-12 md:pb-20 max-w-2xl md:max-w-3xl mx-auto">
        <a
          href="/site/booking"
          className="block text-center bg-black text-white py-3 rounded md:text-lg md:py-4"
        >
          Book With Us
        </a>
      </div>
    </div>
  );
}
