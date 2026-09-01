import { format, parseISO } from "date-fns";

export function php(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function compact(n: number) {
  return new Intl.NumberFormat("en-PH").format(n);
}

export function asDate(value: string | Date) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? new Date(0) : value;
  }
  const raw = String(value ?? "").trim();
  if (!raw) return new Date(0);
  const normalized = raw.includes("T") ? raw : raw.replace(" ", "T");
  const parsed = parseISO(normalized);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  const fallback = new Date(raw);
  return Number.isNaN(fallback.getTime()) ? new Date(0) : fallback;
}

export function dayLabel(value: string | Date) {
  return format(asDate(value), "EEE, d MMM yyyy");
}

export function shortDay(value: string | Date) {
  return format(asDate(value), "d MMM");
}

export function timeLabel(value: string | Date) {
  return format(asDate(value), "h:mm a");
}

export function rangeLabel(start: string | Date, end: string | Date) {
  const s = asDate(start);
  const e = asDate(end);
  if (format(s, "yyyy-MM-dd") === format(e, "yyyy-MM-dd")) {
    return `${format(s, "EEE d MMM")} · ${format(s, "h:mm a")} – ${format(e, "h:mm a")}`;
  }
  return `${format(s, "d MMM h:mm a")} – ${format(e, "d MMM h:mm a")}`;
}

export function isoText(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return String(value ?? "");
}

export function stampLabel(value: string | Date | null | undefined) {
  if (!value) return "Never";
  const d = asDate(value);
  if (d.getTime() === 0) return "Never";
  return format(d, "d MMM yyyy, h:mm a");
}
