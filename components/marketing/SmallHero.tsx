export default function SmallHero({ title }: { title: string }) {
  return (
    <div className="relative h-64 w-full">
      {/* Background image fills the hero area — same image reused across About/Contact/Services for consistency */}
      <img
        src="/hero-small.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Page title overlaps the image, centered */}
      <div className="absolute inset-0 flex items-center justify-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white">{title}</h1>
      </div>
    </div>
  );
}
