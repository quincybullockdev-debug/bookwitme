// This object is the single source of truth for all business-specific content.
// Every page component imports from here instead of hardcoding text — swap this file to onboard a new client.
export const business = {
  name: "N Natural Hair Studio",

  businessId: "ceffc709-d073-4aa6-8538-996f587ccce8",

  heroVariant: "A", // "A" or "B" — determines which hero component renders on Home

  cashappTag: "nnaturaltest",
  cashappProfilePic: "/cashapp-profile.jpg", // business's Cash App profile photo, shown on the post-booking deposit screen
  // Brand colors used across buttons, announcement bar, and accents — swap these per client.
  colors: {
    primary: "#7a5c3e", // warm brown, matches their earthy/natural aesthetic
    secondary: "#e8ddc7", // soft tan/cream accent
  },

  // Short line used in the announcement bar at the very top of every page.
  announcement: "WE ARE NOW ACCEPTING NEW CLIENTS. BOOK YOUR APPOINTMENT TODAY",

  // One-liner used in the hero with the typewriter effect.
  heroTagline: "WE DO NATURAL HAIR THE N WAY",

  // Short paragraph under the hero tagline, used on the intro blurb section.
  intro: {
    heading: "Timeless Natural Styles",
    body: "We are your full-service, natural hair salon, focused on textured hair care. At N Natural Hair Studio, we honor the integrity of naturally textured hair, promoting an afro-centered aesthetic that makes space for your kinks, coils and curls to flourish.",
  },

  // About page story paragraphs.
  about: [
    "Blessed, Spirited, Magical, Innovative — these are the exact words the team at N Natural uses to describe themselves. With over 81 years of combined experience, the team is passionate about giving you an experience that empowers your spirit, beautifies your hair, and values your time.",
    "We take pride in promoting an afro-centered aesthetic that makes space for your beautiful kinks, coils and curls to flourish. Welcome to N Natural Hair Studio — we can't wait to meet you.",
  ],

  // Contact info — using the White Oak location as the primary test location.
  contact: {
    address: "11207B Lockwood Drive, Silver Spring, MD 20901",
    phone: "(301) 901-8047",
    hours: [
      { day: "Mon", hours: "Closed" },
      { day: "Tue - Fri", hours: "9:00 AM - 6:00 PM" },
      { day: "Sat", hours: "8:00 AM - 4:00 PM" },
      { day: "Sun", hours: "Closed" },
    ],
  },

  socials: {
    instagram: "https://www.instagram.com/nnaturalhairstudio/",
    facebook: "https://www.facebook.com/nnaturalhairstudio/",
  },

  // Placeholder service menu — real prices weren't publicly listed, so these are realistic stand-ins.
  services: [
    {
      category: "Natural Hair Care",
      items: [
        { name: "Wash & Style", duration: "60 min", price: "$65" },
        {
          name: "Deep Conditioning Treatment",
          duration: "45 min",
          price: "$45",
        },
        {
          name: "Silk Press",
          duration: "90 min",
          price: "$85",
          addons: [
            {
              name: "Deep Conditioning Boost",
              price: "$15",
              duration: "15 min",
            },
            { name: "Trim", price: "$10", duration: "10 min" },
          ],
        },
      ],
    },
    {
      category: "Braids & Twists",
      items: [
        { name: "Box Braids", duration: "3 hr", price: "$150" },
        { name: "Two-Strand Twists", duration: "2 hr", price: "$110" },
        { name: "Cornrows", duration: "90 min", price: "$90" },
      ],
    },
    {
      category: "Locs",
      items: [
        { name: "Loc Retwist", duration: "75 min", price: "$70" },
        { name: "Loc Starter", duration: "2.5 hr", price: "$200" },
      ],
    },
  ],

  // Hardcoded reviews — swap text/image via these placeholders per client.
  reviews: [
    {
      text: "I appreciated the advice for my hair. She recommended ways to address my problem and was very honest with me when I asked her opinion on styles. She also styled my hair nicely. I will definitely book with her again!",
      author: "— Jasmine R.",
      logo: "/assets/logos/google.png", // swap to instagram.png if pulling from IG instead
    },
  ],
};
