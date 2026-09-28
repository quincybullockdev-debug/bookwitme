"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

// Login page — separate client-side Supabase client (uses the public anon key, safe for the browser)
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // runs when the login form is submitted
  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    // attempts login — data holds the user object if successful
    const { data, error } = await supabaseBrowser.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    // block access if they haven't clicked the verification link in their email yet
    if (!data.user.email_confirmed_at) {
      setError("Please verify your email before logging in.");
      await supabaseBrowser.auth.signOut();
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <form onSubmit={handleLogin} className="max-w-md mx-auto p-6 space-y-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border p-2 rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border p-2 rounded"
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button className="w-full bg-black text-white p-2 rounded">Log in</button>
    </form>
  );
}
