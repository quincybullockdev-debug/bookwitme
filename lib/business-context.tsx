"use client";
import { createContext, useContext } from "react";
import { businessContentMap } from "./business-content/index";

type BusinessContent =
  (typeof businessContentMap)[keyof typeof businessContentMap];

const BusinessContext = createContext<BusinessContent | null>(null);

// Wraps the marketing pages, holds the looked-up business content
export function BusinessProvider({
  business,
  children,
}: {
  business: BusinessContent;
  children: React.ReactNode;
}) {
  return (
    <BusinessContext.Provider value={business}>
      {children}
    </BusinessContext.Provider>
  );
}

// Every component/page calls this instead of importing business-content directly
export function useBusiness() {
  const business = useContext(BusinessContext);
  if (!business)
    throw new Error("useBusiness must be used inside BusinessProvider");
  return business;
}
