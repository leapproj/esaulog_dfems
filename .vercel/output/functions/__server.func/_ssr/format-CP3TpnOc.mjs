import { n as format, t as parseISO } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/format-CP3TpnOc.js
function php(amount) {
	return new Intl.NumberFormat("en-PH", {
		style: "currency",
		currency: "PHP",
		maximumFractionDigits: 0
	}).format(amount);
}
function compact(n) {
	return new Intl.NumberFormat("en-PH").format(n);
}
function asDate(value) {
	if (value instanceof Date) return Number.isNaN(value.getTime()) ? /* @__PURE__ */ new Date(0) : value;
	const raw = String(value ?? "").trim();
	if (!raw) return /* @__PURE__ */ new Date(0);
	const normalized = raw.includes("T") ? raw : raw.replace(" ", "T");
	const parsed = parseISO(normalized);
	if (!Number.isNaN(parsed.getTime())) return parsed;
	const fallback = new Date(raw);
	return Number.isNaN(fallback.getTime()) ? /* @__PURE__ */ new Date(0) : fallback;
}
function shortDay(value) {
	return format(asDate(value), "d MMM");
}
function rangeLabel(start, end) {
	const s = asDate(start);
	const e = asDate(end);
	if (format(s, "yyyy-MM-dd") === format(e, "yyyy-MM-dd")) return `${format(s, "EEE d MMM")} · ${format(s, "h:mm a")} – ${format(e, "h:mm a")}`;
	return `${format(s, "d MMM h:mm a")} – ${format(e, "d MMM h:mm a")}`;
}
function isoText(value) {
	if (value instanceof Date) return value.toISOString();
	if (typeof value === "string") return value;
	return String(value ?? "");
}
function stampLabel(value) {
	if (!value) return "Never";
	const d = asDate(value);
	if (d.getTime() === 0) return "Never";
	return format(d, "d MMM yyyy, h:mm a");
}
//#endregion
export { shortDay as a, rangeLabel as i, isoText as n, stampLabel as o, php as r, compact as t };
