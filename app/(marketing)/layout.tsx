import { headers } from "next/headers";
import { businessContentMap } from "@/lib/business-content/index";
import { BusinessProvider } from "@/lib/business-context";
import Header from "@/components/marketing/Header";
import Footer from "@/components/marketing/Footer";
import CookieBanner from "@/components/marketing/CookieBanner";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const subdomain = headersList.get("x-subdomain") || "";
  const business = businessContentMap[subdomain];

  return (
    <BusinessProvider business={business}>
      <Header />
      <main>{children}</main>
      <Footer />
      <CookieBanner />
    </BusinessProvider>
  );
}
