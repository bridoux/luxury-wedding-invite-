import { weddingConfig as defaultConfig, type WeddingConfig } from "@/lib/config";

/** Format a Date into the compact UTC stamp used by calendar links. */
function toCalStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

interface CalendarEvent {
  title: string;
  description: string;
  location: string;
  start: Date;
  end: Date;
}

function buildEvent(config: WeddingConfig): CalendarEvent {
  const start = new Date(config.date.iso);
  // Default the celebration to a ~6 hour event.
  const end = new Date(start.getTime() + 6 * 60 * 60 * 1000);
  return {
    title: `${config.couple.combined} Wedding`,
    description: config.invitation.intro,
    location: `${config.location.primaryVenue}, ${config.location.fullAddress}`,
    start,
    end
  };
}

/** Google Calendar "add event" link. Pass the live config to reflect edits. */
export function getGoogleCalendarUrl(config: WeddingConfig = defaultConfig): string {
  const e = buildEvent(config);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    details: e.description,
    location: e.location,
    dates: `${toCalStamp(e.start)}/${toCalStamp(e.end)}`
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Downloadable .ics file contents (works with Apple Calendar, Outlook, etc.). */
export function getIcsDataUri(config: WeddingConfig = defaultConfig): string {
  const e = buildEvent(config);
  // Deterministic UID + DTSTAMP (no Date.now()/new Date()): this string is
  // rendered into an <a href> during SSR, so it must match on the client to
  // avoid a hydration mismatch.
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ruth & Eric Wedding//EN",
    "BEGIN:VEVENT",
    "UID:ruth-and-eric-wedding@ruthanderic.wedding",
    `DTSTAMP:${toCalStamp(e.start)}`,
    `DTSTART:${toCalStamp(e.start)}`,
    `DTEND:${toCalStamp(e.end)}`,
    `SUMMARY:${e.title}`,
    `DESCRIPTION:${e.description}`,
    `LOCATION:${e.location}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}
