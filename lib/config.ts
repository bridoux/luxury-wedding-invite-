/**
 * ════════════════════════════════════════════════════════════════
 *  GLOBAL WEDDING CONFIG
 *  ----------------------------------------------------------------
 *  This is the SINGLE source of truth for all wedding content.
 *  Edit this file to customize the entire invitation — names, dates,
 *  venues, colours, registry, story, gallery, everything.
 *  No need to touch component code for content changes.
 * ════════════════════════════════════════════════════════════════
 */

import { DEFAULT_THEME } from "@/lib/theme";
import { DEFAULT_VISIBILITY } from "@/lib/visibility";

export const weddingConfig = {
  // ── Couple ──────────────────────────────────────────────
  couple: {
    partnerOne: "Ruth",
    partnerTwo: "Eric",
    combined: "Ruth & Eric",
    initials: "R & E",
    hashtag: "#RuthAndEricForever"
  },

  // ── Key dates ───────────────────────────────────────────
  // ISO date string used for the countdown + add-to-calendar.
  date: {
    iso: "2026-08-18T15:00:00",
    display: "August 18, 2026",
    dayOfWeek: "Tuesday",
    shortDisplay: "18.08.2026"
  },

  // ── Headline invitation message ─────────────────────────
  // `*Fr` fields hold the French version; the EN field is the fallback.
  invitation: {
    intro: "Joyfully invite you to celebrate their wedding",
    introFr: "ont la joie de vous convier à leur mariage",
    message:
      "Together with their families, Ruth and Eric request the honor of your presence as they celebrate their wedding: a day of love, laughter, and the beginning of forever.",
    messageFr:
      "Avec leurs familles, Ruth et Eric ont l'honneur de vous convier à leur mariage : une journée d'amour, de rires et le commencement de toujours.",
    teaser: "An evening of celebration, music, and joy awaits.",
    teaserFr: "Une soirée de célébration, de musique et de joie vous attend."
  },

  // ── Ceremony ────────────────────────────────────────────
  ceremony: {
    time: "3:00 PM",
    venue: "St. Mary's Cathedral",
    address: "12 Cathedral Lane, Garden City",
    notes: "Guests are kindly asked to be seated by 2:45 PM.",
    notesFr: "Les invités sont priés d'être assis pour 14h45."
  },

  // ── Reception ───────────────────────────────────────────
  reception: {
    time: "6:00 PM",
    venue: "The Grand Rosewood Pavilion",
    address: "48 Rosewood Estate Drive, Garden City",
    notes: "Dinner, dancing & celebration into the evening.",
    notesFr: "Dîner, danse et célébration jusqu'au bout de la soirée."
  },

  // ── Location / Maps ─────────────────────────────────────
  location: {
    primaryVenue: "The Grand Rosewood Pavilion",
    fullAddress: "48 Rosewood Estate Drive, Garden City, 10001",
    // Replace with your real Google Maps share link.
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=The+Grand+Rosewood+Pavilion",
    // Embeddable map (place query). Swap for a precise embed URL when ready.
    googleMapsEmbed:
      "https://www.google.com/maps?q=Rosewood+Estate&output=embed",
    parking: "Complimentary valet parking is available at the main entrance.",
    parkingFr: "Un service de voiturier gratuit est disponible à l'entrée principale.",
    travel:
      "A limited block of rooms is reserved at The Rosewood Hotel. Mention the Ruth & Eric wedding when booking.",
    travelFr:
      "Un bloc de chambres est réservé au Rosewood Hotel. Mentionnez le mariage de Ruth & Eric lors de la réservation."
  },

  // ── Dress code ──────────────────────────────────────────
  dressCode: {
    formality: "Formal / Black Tie Optional",
    formalityFr: "Tenue de soirée / cravate noire optionnelle",
    description:
      "We invite you to dress in elegant formal attire that complements our celebration's palette.",
    descriptionFr:
      "Nous vous invitons à porter une tenue de soirée élégante, en accord avec la palette de notre célébration.",
    palette: [
      { name: "Cream", nameFr: "Crème", hex: "#EFE7D1" },
      { name: "Camel", nameFr: "Camel", hex: "#D7AA7E" },
      { name: "Chestnut", nameFr: "Châtaigne", hex: "#6E3C2A" },
      { name: "Espresso", nameFr: "Espresso", hex: "#3A2620" }
    ],
    suggested: [
      "Floor-length gowns or elegant cocktail dresses",
      "Tailored suits or tuxedos in neutral tones",
      "Soft, romantic fabrics and refined accessories"
    ],
    suggestedFr: [
      "Robes longues ou élégantes robes de cocktail",
      "Costumes ou smokings ajustés dans des tons neutres",
      "Tissus doux et romantiques, accessoires raffinés"
    ],
    cultural:
      "Traditional and cultural attire is warmly welcomed and celebrated.",
    culturalFr:
      "Les tenues traditionnelles et culturelles sont chaleureusement les bienvenues.",
    avoid: ["Bright white (reserved for the bride)", "Casual denim or sneakers"],
    avoidFr: ["Le blanc éclatant (réservé à la mariée)", "Le jean décontracté ou les baskets"]
  },

  // ── Gift / Registry ─────────────────────────────────────
  gift: {
    message:
      "Your presence is the greatest gift of all. However, should you wish to honor us with a gift, we are deeply grateful for your generosity.",
    messageFr:
      "Votre présence est le plus beau des cadeaux. Si toutefois vous souhaitez nous honorer d'un présent, nous vous en sommes profondément reconnaissants.",
    registryName: "Our Wedding Registry",
    registryUrl: "", // e.g. a registry link — leave empty to show "coming soon"
    cashFund: {
      enabled: true,
      title: "Honeymoon Fund",
      description: "Help us create unforgettable memories on our first journey as a married couple."
    },
    bank: {
      enabled: true,
      accountName: "Ruth & Eric",
      details: "Bank details available on request; please contact us."
    },
    privacyNote: "All gift contributions are kept entirely private."
  },

  // ── Contact ─────────────────────────────────────────────
  contact: {
    name: "Grace (Wedding Coordinator)",
    phone: "+1 (555) 012-3456",
    email: "hello@ruthanderic.wedding"
  },

  // ── RSVP ────────────────────────────────────────────────
  rsvp: {
    deadlineDisplay: "July 18, 2026"
  },

  // ── Our Story timeline ──────────────────────────────────
  story: [
    {
      title: "How We Met",
      titleFr: "Notre rencontre",
      date: "Spring 2019",
      dateFr: "Printemps 2019",
      text: "A chance encounter at a friend's garden party turned into hours of conversation under the fairy lights. Neither of us wanted the night to end.",
      textFr: "Une rencontre fortuite lors d'un jardin entre amis s'est transformée en des heures de conversation sous les guirlandes lumineuses. Aucun de nous ne voulait que la soirée se termine.",
      image: "/images/story-1.jpg"
    },
    {
      title: "The Journey",
      titleFr: "Le chemin parcouru",
      date: "2019 to 2023",
      dateFr: "2019 à 2023",
      text: "Through cities, seasons, and countless adventures, we grew together, learning that home was never a place, but each other.",
      textFr: "À travers les villes, les saisons et d'innombrables aventures, nous avons grandi ensemble, comprenant que le foyer n'était jamais un lieu, mais l'autre.",
      image: "/images/story-2.jpg"
    },
    {
      title: "The Proposal",
      titleFr: "La demande",
      date: "Winter 2024",
      dateFr: "Hiver 2024",
      text: "On a quiet evening by the sea, with the sky painted in gold, Eric knelt down and asked the question that began our forever.",
      textFr: "Par une douce soirée au bord de la mer, sous un ciel doré, Eric s'est agenouillé et a posé la question qui a marqué le début de notre toujours.",
      image: "/images/story-3.jpg"
    },
    {
      title: "The Celebration",
      titleFr: "La célébration",
      date: "August 2026",
      dateFr: "Août 2026",
      text: "And now, surrounded by those we love most, we invite you to witness the next beautiful chapter of our story.",
      textFr: "Et aujourd'hui, entourés de ceux que nous aimons le plus, nous vous invitons à être témoins du prochain beau chapitre de notre histoire.",
      image: "/images/story-4.jpg"
    }
  ],

  // ── Gallery ─────────────────────────────────────────────
  // Use local paths in /public/images or remote URLs.
  // If a path is missing, an elegant gradient placeholder is shown.
  gallery: [
    { src: "/images/gallery-1.jpg", caption: "The first dance", captionFr: "La première danse" },
    { src: "/images/gallery-2.jpg", caption: "Golden hour", captionFr: "L'heure dorée" },
    { src: "/images/gallery-3.jpg", caption: "Together", captionFr: "Ensemble" },
    { src: "/images/gallery-4.jpg", caption: "Laughter", captionFr: "Éclats de rire" },
    { src: "/images/gallery-5.jpg", caption: "Forever begins", captionFr: "Le début de toujours" },
    { src: "/images/gallery-6.jpg", caption: "Our adventure", captionFr: "Notre aventure" }
  ],

  // ── Music ───────────────────────────────────────────────
  music: {
    enabled: true,
    // Place an audio file at /public/audio/theme.mp3 to enable playback.
    src: "/audio/theme.mp3",
    title: "Our Wedding Theme"
  },

  // ── Theme (admin-editable colors; see lib/theme.ts) ─────
  theme: DEFAULT_THEME,

  // ── Section visibility (admin can hide sections; see lib/visibility.ts) ─
  visibility: DEFAULT_VISIBILITY,

  // ── Misc ────────────────────────────────────────────────
  meta: {
    siteName: "Ruth & Eric · Wedding Invitation",
    description:
      "Join us as we celebrate the wedding of Ruth & Eric on August 18, 2026.",
    themeColor: "#B98A5E"
  }
} as const;

export type WeddingConfig = typeof weddingConfig;

// Meal options offered in the RSVP form.
export const mealOptions = [
  "Beef Tenderloin",
  "Herb-Roasted Chicken",
  "Pan-Seared Salmon",
  "Vegetarian / Plant-based",
  "Kids Meal"
] as const;

export const attendanceOptions = [
  { value: "attending", label: "Joyfully attending", icon: "💛" },
  { value: "not_attending", label: "Sadly cannot attend", icon: "💔" },
  { value: "maybe", label: "Not sure yet", icon: "🤍" }
] as const;
