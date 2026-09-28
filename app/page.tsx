// landing page — static, no state, no backend logic
export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917] flex flex-col items-center justify-center px-6">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-bold mb-4">
          Run your booking calendar without the back-and-forth.
        </h1>
        <p className="text-lg text-zinc-600 mb-8">
          Give your customers a link to book instantly — no calls, no texts, no double-bookings.
        </p>
        <p className="text-sm text-zinc-500 mb-6">
          $99.97 setup, then $29.97/month
        </p>
        
        <a  href="/signup"
          className="inline-block bg-[#B45309] text-white px-6 py-3 rounded font-medium"
        >
          Get your booking site
        </a>
      </div>
    </div>
  );
}