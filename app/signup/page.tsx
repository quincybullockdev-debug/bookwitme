// tells Next.js "this runs in the browser" — required because useState only works client-side
"use client";
import { useState } from "react";

// export default = this is the page Next.js loads for the /signup route
export default function SignupPage() {
  // memory slot for business name input
  const [businessName, setBusinessName] = useState("");
  // memory slot for subdomain input
  const [subdomain, setSubdomain] = useState("");
  // memory slot for email input
  const [email, setEmail] = useState("");
  // memory slot for password input
  const [password, setPassword] = useState("");

  // runs when the form is submitted -  stops the page from doing a full reload (browser default behavior)
  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    // sends the 4 fields to your backend
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessName, subdomain, email, password }),
    });

    // turns the backend's response into usable JS data
    const data = await res.json();

    // if signup succeeded, send them to Stripe's payment page
    if (res.ok) {
      window.location.href = data.checkoutUrl;
    }
  };

  return (
    // wraps all 4 inputs — onSubmit fires when the button inside is clicked
    <form onSubmit={handleSubmit}>
      {/* input box wired to businessName memory — value shows it, onChange updates it */}
      <input
        placeholder="Business name"
        className="border border-gray-500 p-2 text-white"
        value={businessName}
        onChange={(e) => setBusinessName(e.target.value)}
      />
      {/* input box wired to subdomain memory */}
      <input
        placeholder="Subdomain"
        className="border border-gray-500 p-2 text-white"
        value={subdomain}
        onChange={(e) => setSubdomain(e.target.value)}
      />{" "}
      {/* input box wired to email memory */}
      <input
        placeholder="Email"
        className="border border-gray-500 p-2 text-white"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />{" "}
      {/* type="password" hides the characters as you type */}
      <input
        type="password"
        placeholder="Password"
        className="border border-gray-500 p-2 text-white"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" className="border border-gray-500 p-2 text-white">
        Sign up
      </button>
    </form>
  );
}
