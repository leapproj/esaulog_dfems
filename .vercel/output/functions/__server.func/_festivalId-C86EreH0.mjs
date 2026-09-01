import { o as __toESM } from "./_runtime.mjs";
import { r as php, t as compact } from "./_ssr/format-CP3TpnOc.mjs";
import { s as require_react } from "./_libs/@radix-ui/react-collection+[...].mjs";
import { v as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { t as require_jsx_dev_runtime } from "./_libs/react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "./_libs/tanstack__react-query.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { i as Route$2 } from "./_ssr/router-B1c0wy3o.mjs";
import { i as Skeleton } from "./_ssr/operator-gate-DsBp2Hqe.mjs";
import { n as PageHeader, r as Stat, t as Page } from "./_ssr/shell-Cz-vBY6_.mjs";
import { t as StatusBadge } from "./_ssr/status-badge-Dl5pw980.mjs";
import { t as Button } from "./_ssr/button-CYpiddHg.mjs";
import { n as Label, t as Input } from "./_ssr/input-DbAQ-TeF.mjs";
import { i as DialogTitle, n as DialogContent, r as DialogDescription, t as Dialog } from "./_ssr/dialog-DBxbSNlP.mjs";
import { f as updateFestivalIdentity, i as getSspOverview, o as hqGoLive, p as updateFestivalStatus, u as setFestivalCopartner } from "./_ssr/ssp-GAJfNAfc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_festivalId-C86EreH0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_dev_runtime = require_jsx_dev_runtime();
var _jsxFileName = "/app/applet/src/routes/ssp/festivals/$festivalId.tsx?tsr-split=component";
var STATUSES = [
	"DRAFT",
	"PLANNING",
	"SETUP",
	"LIVE",
	"ENDED"
];
function TenantDetail() {
	const { festivalId } = Route$2.useParams();
	const qc = useQueryClient();
	const { data, isLoading } = useQuery({
		queryKey: ["ssp"],
		queryFn: () => getSspOverview()
	});
	const f = data?.festivals?.find((x) => x.id === festivalId);
	const events = (data?.events ?? []).filter((e) => e.festival_id === festivalId);
	const [editOpen, setEditOpen] = (0, import_react.useState)(false);
	const statusMut = useMutation({
		mutationFn: (status) => updateFestivalStatus({ data: {
			id: festivalId,
			status
		} }),
		onSuccess: () => {
			toast.success("Status updated");
			qc.invalidateQueries({ queryKey: ["ssp"] });
		}
	});
	const cpMut = useMutation({
		mutationFn: (copartner) => setFestivalCopartner({ data: {
			id: festivalId,
			copartner
		} }),
		onSuccess: (res) => {
			toast.success(res.copartner ? "Co-partner activated" : "Co-partner removed");
			qc.invalidateQueries({ queryKey: ["ssp"] });
		}
	});
	const goLive = useMutation({
		mutationFn: () => hqGoLive({ data: { id: festivalId } }),
		onSuccess: () => {
			toast.success("Festival is live");
			qc.invalidateQueries({ queryKey: ["ssp"] });
		},
		onError: (e) => toast.error(e.message)
	});
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Page, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Skeleton, { className: "h-8 w-64" }, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 78,
		columnNumber: 9
	}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4",
		children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Skeleton, { className: "h-24 rounded-xl" }, i, false, {
			fileName: _jsxFileName,
			lineNumber: 82,
			columnNumber: 26
		}, this))
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 79,
		columnNumber: 9
	}, this)] }, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 77,
		columnNumber: 12
	}, this);
	if (!f) return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Page, { children: "Tenant not found." }, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 86,
		columnNumber: 18
	}, this);
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Page, { children: [
		/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(PageHeader, {
			eyebrow: "HQ tenant",
			title: f.name,
			description: `${f.city}, ${f.province} · ${f.starts_on} – ${f.ends_on} · ${f.timezone}`,
			actions: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, {
							to: "/admin/$festivalId",
							params: { festivalId: f.id },
							children: "Open command center"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 90,
							columnNumber: 15
						}, this)
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 89,
						columnNumber: 13
					}, this),
					f.status !== "LIVE" && f.status !== "ENDED" ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
						disabled: goLive.isPending,
						onClick: () => goLive.mutate(),
						children: "Go live"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 96,
						columnNumber: 60
					}, this) : null,
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
						variant: "outline",
						onClick: () => setEditOpen(true),
						children: "Edit identity"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 99,
						columnNumber: 13
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
						variant: "outline",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, {
							to: "/admin/$festivalId/events/new",
							params: { festivalId: f.id },
							children: "Create event"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 103,
							columnNumber: 15
						}, this)
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 102,
						columnNumber: 13
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
						variant: "outline",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, {
							to: "/admin/$festivalId/cms",
							params: { festivalId: f.id },
							children: "CMS"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 110,
							columnNumber: 15
						}, this)
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 109,
						columnNumber: 13
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 88,
				columnNumber: 152
			}, this)
		}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 88,
			columnNumber: 7
		}, this),
		/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "grid grid-cols-2 gap-3 lg:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Stat, {
					label: "Participants",
					value: compact(f.participants)
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 119,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Stat, {
					label: "Events",
					value: f.events
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 120,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Stat, {
					label: "Check-ins",
					value: compact(f.checkins ?? 0)
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 121,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Stat, {
					label: "Digital income",
					value: php(f.digital ?? 0),
					hint: f.copartner ? `HQ 30% · ${php(Math.round((f.digital ?? 0) * .3))}` : "Self-serve"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 122,
					columnNumber: 9
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 118,
			columnNumber: 7
		}, this),
		/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "mt-6 grid gap-3 md:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
						className: "text-xs tracking-wide text-muted uppercase",
						children: "License status"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 127,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
							size: "sm",
							variant: f.status === s ? "default" : "outline",
							onClick: () => statusMut.mutate(s),
							children: s
						}, s, false, {
							fileName: _jsxFileName,
							lineNumber: 129,
							columnNumber: 32
						}, this))
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 128,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(StatusBadge, { status: f.status }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 134,
							columnNumber: 13
						}, this)
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 133,
						columnNumber: 11
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 126,
				columnNumber: 9
			}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
						className: "text-xs tracking-wide text-muted uppercase",
						children: "Co-partner model"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 138,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
						className: "mt-2 text-sm text-muted",
						children: f.copartner ? "TukodPH operates the digital festival. 30% of digital sponsor income. Physical sponsors remain with the organizer." : "Self-serve license. Activate co-partner to have HQ run the digital festival."
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 139,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
							size: "sm",
							variant: f.copartner ? "secondary" : "default",
							disabled: cpMut.isPending,
							onClick: () => cpMut.mutate(!f.copartner),
							children: f.copartner ? "Remove co-partner" : "Activate as co-partner"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 143,
							columnNumber: 13
						}, this)
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 142,
						columnNumber: 11
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 137,
				columnNumber: 9
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 125,
			columnNumber: 7
		}, this),
		/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "mt-6 grid gap-3 md:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
					className: "text-xs tracking-wide text-muted uppercase",
					children: "HQ surfaces"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 152,
					columnNumber: 11
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("ul", {
					className: "mt-3 space-y-1 text-sm",
					children: [[
						{
							t: "Command center",
							to: "/admin/$festivalId",
							params: { festivalId: f.id }
						},
						{
							t: "Planning desk",
							to: "/admin/$festivalId/planning",
							params: { festivalId: f.id }
						},
						{
							t: "Event calendar",
							to: "/admin/$festivalId/events",
							params: { festivalId: f.id }
						},
						{
							t: "Staff & volunteers",
							to: "/admin/$festivalId/staff",
							params: { festivalId: f.id }
						},
						{
							t: "Gate keys",
							to: "/admin/$festivalId/gates",
							params: { festivalId: f.id }
						},
						{
							t: "CMS website",
							to: "/admin/$festivalId/cms",
							params: { festivalId: f.id }
						},
						{
							t: "Income ledger",
							to: "/admin/$festivalId/income",
							params: { festivalId: f.id }
						},
						{
							t: "Analytics",
							to: "/admin/$festivalId/analytics",
							params: { festivalId: f.id }
						},
						{
							t: "AI organizer",
							to: "/admin/$festivalId/ai",
							params: { festivalId: f.id }
						}
					].map((s) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", {
						className: "flex items-center justify-between border-b border-border py-1.5 last:border-0",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, {
							to: s.to,
							params: s.params,
							className: "hover:text-accent",
							children: s.t
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 209,
							columnNumber: 17
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
							className: "text-xs text-ok",
							children: "Open"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 212,
							columnNumber: 17
						}, this)]
					}, s.t, true, {
						fileName: _jsxFileName,
						lineNumber: 208,
						columnNumber: 23
					}, this)), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", {
						className: "flex items-center justify-between py-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, {
							to: "/festivals/$slug",
							params: { slug: f.slug },
							className: "hover:text-accent",
							children: "Public preview"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 215,
							columnNumber: 15
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
							className: "text-xs text-ok",
							children: "Open"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 220,
							columnNumber: 15
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 214,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 153,
					columnNumber: 11
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 151,
				columnNumber: 9
			}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
					className: "text-xs tracking-wide text-muted uppercase",
					children: "Identity"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 225,
					columnNumber: 11
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("dl", {
					className: "mt-3 grid gap-3 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("dt", {
							className: "text-muted",
							children: "Organizer"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 228,
							columnNumber: 15
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("dd", {
							className: "mt-0.5",
							children: f.organizer_name
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 229,
							columnNumber: 15
						}, this)] }, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 227,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("dt", {
							className: "text-muted",
							children: "Contact"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 232,
							columnNumber: 15
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("dd", {
							className: "mt-0.5",
							children: f.contact_email
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 233,
							columnNumber: 15
						}, this)] }, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 231,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("dt", {
							className: "text-muted",
							children: "Slug"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 236,
							columnNumber: 15
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("dd", {
							className: "mt-0.5 font-mono",
							children: f.slug
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 237,
							columnNumber: 15
						}, this)] }, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 235,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("dt", {
							className: "text-muted",
							children: "Package"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 240,
							columnNumber: 15
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("dd", {
							className: "mt-0.5",
							children: f.package_name ?? "Unlicensed"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 241,
							columnNumber: 15
						}, this)] }, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 239,
							columnNumber: 13
						}, this),
						f.tagline ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("dt", {
							className: "text-muted",
							children: "Tagline"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 244,
							columnNumber: 17
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("dd", {
							className: "mt-0.5",
							children: f.tagline
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 245,
							columnNumber: 17
						}, this)] }, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 243,
							columnNumber: 26
						}, this) : null
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 226,
					columnNumber: 11
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 224,
				columnNumber: 9
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 150,
			columnNumber: 7
		}, this),
		events.length > 0 ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", {
			className: "mt-10 font-display text-2xl",
			children: "Events on this tenant"
		}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 252,
			columnNumber: 11
		}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "mt-3 divide-y divide-border rounded-xl bg-surface shadow-[var(--shadow-border)]",
			children: events.map((e) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, {
				to: "/admin/$festivalId/events/$eventId",
				params: {
					festivalId: f.id,
					eventId: e.id
				},
				className: "flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-surface-2",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
					className: "font-medium",
					children: e.name
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 258,
					columnNumber: 17
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(StatusBadge, { status: e.status }, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 259,
					columnNumber: 17
				}, this)]
			}, e.id, true, {
				fileName: _jsxFileName,
				lineNumber: 254,
				columnNumber: 37
			}, this))
		}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 253,
			columnNumber: 11
		}, this)] }, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 251,
			columnNumber: 28
		}, this) : null,
		/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(EditIdentityDialog, {
			festival: f,
			open: editOpen,
			onOpenChange: setEditOpen
		}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 264,
			columnNumber: 7
		}, this)
	] }, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 87,
		columnNumber: 10
	}, this);
}
function EditIdentityDialog({ festival, open, onOpenChange }) {
	const qc = useQueryClient();
	const [form, setForm] = (0, import_react.useState)({
		name: "",
		slug: "",
		city: "",
		province: "",
		starts_on: "",
		ends_on: "",
		tagline: "",
		organizer_name: "",
		contact_email: ""
	});
	(0, import_react.useEffect)(() => {
		if (!open) return;
		setForm({
			name: festival.name ?? "",
			slug: festival.slug ?? "",
			city: festival.city ?? "",
			province: festival.province ?? "",
			starts_on: String(festival.starts_on ?? "").slice(0, 10),
			ends_on: String(festival.ends_on ?? "").slice(0, 10),
			tagline: festival.tagline ?? "",
			organizer_name: festival.organizer_name ?? "",
			contact_email: festival.contact_email ?? ""
		});
	}, [open, festival]);
	const mut = useMutation({
		mutationFn: () => updateFestivalIdentity({ data: {
			id: festival.id,
			...form
		} }),
		onSuccess: () => {
			toast.success("Festival identity updated");
			onOpenChange(false);
			qc.invalidateQueries({ queryKey: ["ssp"] });
		},
		onError: (e) => toast.error(e.message)
	});
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogContent, {
			className: "max-h-[90vh] overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogTitle, { children: "Edit festival identity" }, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 320,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogDescription, { children: "Super Admin can change the public identity of any tenant from Headquarters." }, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 321,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("form", {
					className: "mt-4 grid gap-3",
					onSubmit: (e) => {
						e.preventDefault();
						mut.mutate();
					},
					children: [
						[
							["name", "Festival name"],
							["slug", "Slug"],
							["city", "City"],
							["province", "Province"],
							["organizer_name", "Organizer"],
							["contact_email", "Contact email"],
							["tagline", "Tagline"]
						].map(([key, label]) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "grid gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Label, {
								htmlFor: `id-${key}`,
								children: label
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 329,
								columnNumber: 15
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Input, {
								id: `id-${key}`,
								required: key !== "tagline",
								value: form[key],
								onChange: (e) => setForm((prev) => ({
									...prev,
									[key]: e.target.value
								}))
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 330,
								columnNumber: 15
							}, this)]
						}, key, true, {
							fileName: _jsxFileName,
							lineNumber: 328,
							columnNumber: 228
						}, this)),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "grid gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Label, {
									htmlFor: "id-starts",
									children: "Starts"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 337,
									columnNumber: 15
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Input, {
									id: "id-starts",
									type: "date",
									value: form.starts_on,
									onChange: (e) => setForm((prev) => ({
										...prev,
										starts_on: e.target.value
									}))
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 338,
									columnNumber: 15
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 336,
								columnNumber: 13
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "grid gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Label, {
									htmlFor: "id-ends",
									children: "Ends"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 344,
									columnNumber: 15
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Input, {
									id: "id-ends",
									type: "date",
									value: form.ends_on,
									onChange: (e) => setForm((prev) => ({
										...prev,
										ends_on: e.target.value
									}))
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 345,
									columnNumber: 15
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 343,
								columnNumber: 13
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 335,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
							type: "submit",
							disabled: mut.isPending,
							children: mut.isPending ? "Saving…" : "Save identity"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 351,
							columnNumber: 11
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 324,
					columnNumber: 9
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 319,
			columnNumber: 7
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 318,
		columnNumber: 10
	}, this);
}
//#endregion
export { TenantDetail as component };
