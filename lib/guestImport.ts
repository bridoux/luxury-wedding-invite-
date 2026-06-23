/**
 * Parse + validate a guest list uploaded as CSV or Excel (.xlsx) for bulk import.
 *
 * The heavy parsers (papaparse / read-excel-file) are dynamically imported so
 * they only load when an admin actually imports a file — they stay out of the
 * initial admin bundle.
 *
 * Recognized columns (case-insensitive, dashes/underscores ignored):
 *   name (required), max_guests, email, phone, greeting.
 * Invite codes are derived from names (or a supplied `code` column) and made
 * unique + schema-valid automatically.
 */

export type LogicalField = "full_name" | "guest_code" | "max_guests" | "email" | "phone" | "greeting";

export interface ImportGuest {
  full_name: string;
  guest_code: string;
  party_label: string;
  max_guests: number;
  email: string | null;
  phone: string | null;
  greeting: string | null;
}

export interface SkippedRow {
  row: number;
  reason: string;
}

export interface ParsedImport {
  valid: ImportGuest[];
  skipped: SkippedRow[];
  totalRows: number;
  /** The header text matched to each field, or null if not found. */
  matched: Record<LogicalField, string | null>;
  /** True when the file had no recognizable header and column 1 was assumed to be names. */
  assumedNoHeader: boolean;
}

// Mirror of the guests.guest_code CHECK constraint in the DB schema.
const CODE_RE = /^[a-z0-9][a-z0-9-]{1,48}$/;
const DEFAULT_MAX_GUESTS = 2;
const MAX_NAME_LEN = 120;

const HEADER_ALIASES: Record<LogicalField, string[]> = {
  full_name: ["name", "full name", "fullname", "guest", "guest name", "party", "family", "names"],
  guest_code: ["code", "invite code", "guest code", "slug", "link", "invitecode"],
  max_guests: ["max", "max guests", "seats", "count", "party size", "guests", "pax", "number of guests", "allowed", "qty"],
  email: ["email", "e mail", "email address", "mail"],
  phone: ["phone", "tel", "telephone", "mobile", "cell", "phone number", "whatsapp", "contact"],
  greeting: ["greeting", "message", "personal greeting", "note", "notes"]
};

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}

function toMaxGuests(raw: string): number {
  const n = parseInt(raw.replace(/[^0-9]/g, ""), 10);
  if (Number.isNaN(n) || n < 1) return DEFAULT_MAX_GUESTS;
  return Math.min(n, 20);
}

/** Turn any string into a schema-valid code, falling back to guest-N. */
function toValidCode(source: string, index: number): string {
  const slug = slugify(source);
  if (CODE_RE.test(slug)) return slug;
  return `guest-${index}`;
}

async function readRows(file: File): Promise<string[][]> {
  const isCsv = /\.csv$/i.test(file.name) || file.type === "text/csv";
  if (isCsv) {
    const Papa = (await import("papaparse")).default;
    const text = await file.text();
    const res = Papa.parse<string[]>(text, { skipEmptyLines: "greedy" });
    return res.data.map((r) => r.map((c) => (c == null ? "" : String(c))));
  }
  // Main-thread browser build (no web-worker bundling needed; guest lists are small).
  const readXlsxFile = (await import("read-excel-file/browser")).default;
  const sheet = (await readXlsxFile(file)) as unknown as unknown[][];
  return sheet.map((r) => r.map((c) => (c == null ? "" : String(c))));
}

export async function parseGuestFile(file: File): Promise<ParsedImport> {
  const rows = await readRows(file);
  const emptyMatched: Record<LogicalField, string | null> = {
    full_name: null,
    guest_code: null,
    max_guests: null,
    email: null,
    phone: null,
    greeting: null
  };

  const headerIdx = rows.findIndex((r) => r.some((c) => c.trim() !== ""));
  if (headerIdx === -1) {
    return { valid: [], skipped: [], totalRows: 0, matched: emptyMatched, assumedNoHeader: false };
  }

  const headerCells = rows[headerIdx];
  const header = headerCells.map(normalizeHeader);
  const colIndex: Record<LogicalField, number> = {
    full_name: -1,
    guest_code: -1,
    max_guests: -1,
    email: -1,
    phone: -1,
    greeting: -1
  };
  const matched = { ...emptyMatched };

  (Object.keys(HEADER_ALIASES) as LogicalField[]).forEach((field) => {
    const idx = header.findIndex((h) => HEADER_ALIASES[field].includes(h));
    if (idx !== -1) {
      colIndex[field] = idx;
      matched[field] = headerCells[idx];
    }
  });

  const anyMatched = (Object.values(colIndex) as number[]).some((i) => i !== -1);
  // No recognizable header → assume the file is just names in column 1.
  const assumedNoHeader = !anyMatched;
  if (assumedNoHeader) colIndex.full_name = 0;
  const dataStart = assumedNoHeader ? headerIdx : headerIdx + 1;

  const valid: ImportGuest[] = [];
  const skipped: SkippedRow[] = [];
  const usedCodes = new Set<string>();
  let totalRows = 0;

  const cell = (r: string[], field: LogicalField): string =>
    colIndex[field] !== -1 ? (r[colIndex[field]] ?? "").trim() : "";

  for (let i = dataStart; i < rows.length; i++) {
    const r = rows[i];
    if (!r.some((c) => c.trim() !== "")) continue; // ignore blank lines
    totalRows++;
    const rowNum = i + 1; // 1-based source line for the admin

    const name = cell(r, "full_name");
    if (!name) {
      skipped.push({ row: rowNum, reason: "missing name" });
      continue;
    }
    if (name.length > MAX_NAME_LEN) {
      skipped.push({ row: rowNum, reason: `name longer than ${MAX_NAME_LEN} characters` });
      continue;
    }

    const rawCode = cell(r, "guest_code");
    const base = toValidCode(rawCode || name, totalRows);
    let code = base;
    let n = 2;
    while (usedCodes.has(code)) {
      code = `${base}-${n++}`.slice(0, 49);
    }
    usedCodes.add(code);

    valid.push({
      full_name: name,
      party_label: name,
      guest_code: code,
      max_guests: colIndex.max_guests !== -1 ? toMaxGuests(cell(r, "max_guests")) : DEFAULT_MAX_GUESTS,
      email: cell(r, "email") || null,
      phone: cell(r, "phone") || null,
      greeting: cell(r, "greeting") || null
    });
  }

  return { valid, skipped, totalRows, matched, assumedNoHeader };
}
