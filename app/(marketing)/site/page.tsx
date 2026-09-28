import { headers } from "next/headers";
import { businessContentMap } from "@/lib/business-content/index";
import HomePageClient from "./HomePageClient";

export default async function HomePage() {
  const headersList = await headers();
  const subdomain = headersList.get("x-subdomain") || "";
  const business = businessContentMap[subdomain];

  return <HomePageClient business={business} />;
}