import { useBusiness } from "@/lib/business-context";import SmallHero from "@/components/marketing/SmallHero";
 
export default function ServicesPage() {
  const business = useBusiness();
  return (
    <div>
      {/* Reused small hero component */}
      <SmallHero title="Services" />

      <div className="px-4 pt-12 md:pt-20 max-w-2xl md:max-w-3xl mx-auto">
        <p className="text-sm md:text-base text-gray-600 mb-8">
          Please review our policies before booking. Prices are subject to
          change based on hair length, texture, and density.
        </p>
      </div>

      <div className="px-4 pb-12 md:pb-20 max-w-2xl md:max-w-3xl mx-auto">
        {/* Outer loop: one block per category (Natural Hair Care, Braids & Twists, Locs) */}
        {business.services.map((category, catIndex) => (
          <div key={catIndex} className="mb-10 md:mb-14">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">
              {category.category}
            </h2>

            {/* Inner loop: each service row within this category */}
            {category.items.map((item, itemIndex) => (
              <div
                key={itemIndex}
                className="flex justify-between mb-2 md:text-lg"
              >
                <span>
                  {item.name} | {item.duration}
                </span>
                <span>{item.price}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
