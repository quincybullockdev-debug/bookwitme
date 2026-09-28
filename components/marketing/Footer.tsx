"use client";
import { useBusiness } from "@/lib/business-context";

export default function Footer() {
  const business = useBusiness(); // add this line

  return (
    <footer className="bg-black text-white px-4 py-10 md:py-16">
      {/* Quick nav links repeated in the footer, common pattern on all 4 reference sites */}
      <nav className="flex flex-col md:flex-row md:justify-center gap-2 md:gap-8 mb-6">
        <a href="/site">Home</a>
        <a href="/site/services">Services</a>
        <a href="/site/about">About</a>
        <a href="/site/contact">Contact</a>
        <a href="/site/policies">Policies</a>
      </nav>

      {/* Social links pulled from the shared content file */}
      <div className="flex justify-center gap-4 mb-6">
        <a href={business.socials.instagram}>Instagram</a>
        <a href={business.socials.facebook}>Facebook</a>
      </div>

      {/* Legal line at the very bottom */}
      <p className="text-sm text-gray-400 text-center">
        © {new Date().getFullYear()} {business.name}. All rights reserved.
      </p>
    </footer>
  );
}
