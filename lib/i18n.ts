/**
 * Bilingual (English / French) UI dictionary for the invitation chrome:
 * section titles, button labels, the RSVP form, navigation, etc.
 *
 * Couple-authored PROSE (the invitation message, story text, dress-code
 * description, gift message…) lives in lib/config.ts with `*Fr` companion
 * fields — see `localizeConfig`. This file is only the fixed interface text.
 */

export type Lang = "en" | "fr";

export const LANGS: Lang[] = ["en", "fr"];

const en = {
  langName: "English",
  envelope: {
    invited: "You are invited",
    weddingOf: "The wedding of",
    open: "Open Invitation",
    tap: "Tap the seal to open",
    intro: "joyfully invite you to celebrate their wedding"
  },
  hero: {
    together: "Together with their families",
    and: "and",
    ceremony: "Ceremony",
    reception: "Reception",
    scroll: "Scroll"
  },
  cta: {
    rsvp: "RSVP",
    viewDetails: "View Details",
    location: "Location",
    addToCalendar: "Add to Calendar",
    openInMaps: "Open in Google Maps"
  },
  countdown: {
    eyebrow: "Counting Down",
    script: "The moment",
    title: "Until We Say I Do",
    days: "Days",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
    today: "Today is the day, let the celebration begin!"
  },
  story: { eyebrow: "Our Journey", script: "Once upon a time", title: "Our Story" },
  details: {
    eyebrow: "The Celebration",
    script: "Join us",
    title: "Wedding Details",
    ceremonyKicker: "The Ceremony",
    vows: "Vows",
    receptionKicker: "The Reception",
    celebration: "Celebration",
    dressCode: "Dress Code",
    seePalette: "See palette",
    contact: "Contact",
    goodToKnow: "Good to Know",
    unplugged: "An unplugged ceremony",
    bePresent: "Please be fully present with us."
  },
  location: {
    eyebrow: "Find Your Way",
    script: "Where",
    title: "Location",
    parking: "Parking",
    travel: "Travel & Stay"
  },
  dress: {
    eyebrow: "Attire",
    script: "Dressed in love",
    title: "Dress Code",
    suggested: "Suggested",
    avoid: "Kindly Avoid"
  },
  gallery: { eyebrow: "Moments", script: "Captured", title: "Gallery" },
  gift: {
    eyebrow: "With Gratitude",
    script: "Your presence",
    title: "Gifts",
    registry: "Registry",
    comingSoon: "Coming soon.",
    honeymoon: "Honeymoon Fund",
    bank: "Bank Contribution"
  },
  rsvp: {
    eyebrow: "Kindly Respond",
    script: "Will you join us?",
    title: "RSVP",
    intro: "We would be honored to have you celebrate with us. Please respond by",
    replyCard: "Reply Card",
    withPleasure: "With pleasure",
    joining: "Will you be joining us?",
    fullName: "Full Name",
    email: "Email",
    phone: "Phone",
    guestCount: "Number of Guests",
    additionalNames: "Names of Additional Guests",
    mealPreference: "Meal Preference",
    dietary: "Dietary Restrictions / Allergies",
    accommodation: "I would like assistance with accommodation / travel",
    message: "A Message to the Couple",
    messagePlaceholder: "Share your warm wishes…",
    consent: "Keep me updated with wedding news and reminders.",
    send: "Send RSVP",
    sending: "Sending…",
    nameRequired: "Please enter your name",
    emailInvalid: "Enter a valid email",
    serverError: "Something went wrong. Please try again.",
    thankYou: "Thank You",
    received: "Your reply has been received with joy.",
    editResponse: "Edit Response",
    demoMode: "Demo mode — connect Supabase to store responses permanently.",
    guests: "guests",
    guest: "guest",
    namePlaceholder: "Your full name"
  },
  attendance: {
    attending: "Joyfully attending",
    not_attending: "Sadly cannot attend",
    maybe: "Not sure yet"
  },
  meals: {
    "Beef Tenderloin": "Beef Tenderloin",
    "Herb-Roasted Chicken": "Herb-Roasted Chicken",
    "Pan-Seared Salmon": "Pan-Seared Salmon",
    "Vegetarian / Plant-based": "Vegetarian / Plant-based",
    "Kids Meal": "Kids Meal"
  } as Record<string, string>,
  nav: {
    home: "Home",
    story: "Story",
    details: "Details",
    rsvp: "RSVP",
    more: "More",
    explore: "Explore",
    invitation: "Invitation",
    countdown: "Countdown",
    location: "Location",
    dresscode: "Dress Code",
    gallery: "Gallery",
    gift: "Gifts"
  },
  greeting: { dear: "Dear", fallback: "you are warmly invited to share in our joy." },
  thankYou: {
    title: "Thank You",
    body: "Your RSVP has been received. We are so grateful you took the time to respond.",
    yourResponse: "Your Response",
    addGoogle: "Add to Google Calendar",
    downloadIcs: "Download .ics",
    return: "Return to Invitation"
  }
};

const fr: typeof en = {
  langName: "Français",
  envelope: {
    invited: "Vous êtes invités",
    weddingOf: "Le mariage de",
    open: "Ouvrir l'invitation",
    tap: "Touchez le sceau pour ouvrir",
    intro: "ont la joie de vous convier à leur mariage"
  },
  hero: {
    together: "Avec leurs familles",
    and: "et",
    ceremony: "Cérémonie",
    reception: "Réception",
    scroll: "Défiler"
  },
  cta: {
    rsvp: "RSVP",
    viewDetails: "Voir les détails",
    location: "Lieu",
    addToCalendar: "Ajouter au calendrier",
    openInMaps: "Ouvrir dans Google Maps"
  },
  countdown: {
    eyebrow: "Compte à rebours",
    script: "Le grand jour",
    title: "Avant le grand oui",
    days: "Jours",
    hours: "Heures",
    minutes: "Minutes",
    seconds: "Secondes",
    today: "C'est aujourd'hui, que la fête commence !"
  },
  story: { eyebrow: "Notre parcours", script: "Il était une fois", title: "Notre histoire" },
  details: {
    eyebrow: "La célébration",
    script: "Joignez-vous à nous",
    title: "Détails du mariage",
    ceremonyKicker: "La cérémonie",
    vows: "Les vœux",
    receptionKicker: "La réception",
    celebration: "La fête",
    dressCode: "Code vestimentaire",
    seePalette: "Voir la palette",
    contact: "Contact",
    goodToKnow: "Bon à savoir",
    unplugged: "Une cérémonie sans écrans",
    bePresent: "Soyez pleinement présents avec nous."
  },
  location: {
    eyebrow: "Y arriver",
    script: "Où",
    title: "Lieu",
    parking: "Stationnement",
    travel: "Voyage & hébergement"
  },
  dress: {
    eyebrow: "Tenue",
    script: "Élégance",
    title: "Code vestimentaire",
    suggested: "Suggéré",
    avoid: "À éviter"
  },
  gallery: { eyebrow: "Instants", script: "Capturés", title: "Galerie" },
  gift: {
    eyebrow: "Avec gratitude",
    script: "Votre présence",
    title: "Cadeaux",
    registry: "Liste de mariage",
    comingSoon: "À venir.",
    honeymoon: "Cagnotte lune de miel",
    bank: "Contribution bancaire"
  },
  rsvp: {
    eyebrow: "Merci de répondre",
    script: "Serez-vous des nôtres ?",
    title: "RSVP",
    intro: "Ce serait un honneur de vous compter parmi nous. Merci de répondre avant le",
    replyCard: "Carte-réponse",
    withPleasure: "Avec plaisir",
    joining: "Serez-vous des nôtres ?",
    fullName: "Nom complet",
    email: "Courriel",
    phone: "Téléphone",
    guestCount: "Nombre d'invités",
    additionalNames: "Noms des invités supplémentaires",
    mealPreference: "Choix du repas",
    dietary: "Restrictions alimentaires / allergies",
    accommodation: "Je souhaite de l'aide pour l'hébergement / le transport",
    message: "Un mot pour les mariés",
    messagePlaceholder: "Partagez vos vœux…",
    consent: "Tenez-moi informé des nouvelles du mariage.",
    send: "Envoyer la réponse",
    sending: "Envoi…",
    nameRequired: "Veuillez saisir votre nom",
    emailInvalid: "Saisissez un courriel valide",
    serverError: "Une erreur est survenue. Veuillez réessayer.",
    thankYou: "Merci",
    received: "Votre réponse a été reçue avec joie.",
    editResponse: "Modifier la réponse",
    demoMode: "Mode démo — connectez Supabase pour enregistrer les réponses.",
    guests: "invités",
    guest: "invité",
    namePlaceholder: "Votre nom complet"
  },
  attendance: {
    attending: "Avec joie, je serai présent",
    not_attending: "Hélas, je ne pourrai pas venir",
    maybe: "Je ne suis pas encore sûr"
  },
  meals: {
    "Beef Tenderloin": "Filet de bœuf",
    "Herb-Roasted Chicken": "Poulet rôti aux herbes",
    "Pan-Seared Salmon": "Saumon poêlé",
    "Vegetarian / Plant-based": "Végétarien / végétal",
    "Kids Meal": "Menu enfant"
  },
  nav: {
    home: "Accueil",
    story: "Histoire",
    details: "Détails",
    rsvp: "RSVP",
    more: "Plus",
    explore: "Explorer",
    invitation: "Invitation",
    countdown: "Compte à rebours",
    location: "Lieu",
    dresscode: "Tenue",
    gallery: "Galerie",
    gift: "Cadeaux"
  },
  greeting: { dear: "Cher / Chère", fallback: "vous êtes chaleureusement invités à partager notre joie." },
  thankYou: {
    title: "Merci",
    body: "Votre réponse a bien été reçue. Nous vous remercions du fond du cœur d'avoir pris le temps de répondre.",
    yourResponse: "Votre réponse",
    addGoogle: "Ajouter à Google Agenda",
    downloadIcs: "Télécharger .ics",
    return: "Retour à l'invitation"
  }
};

export const translations: Record<Lang, typeof en> = { en, fr };
export type Translations = typeof en;
