import type { Sql } from "@/lib/db";
import { isoText } from "@/lib/format";
import type { EventReadiness, FestivalEvent } from "@/lib/types";

export function mapEvent(row: Record<string, unknown>): FestivalEvent {
  return {
    id: String(row.id),
    festival_id: String(row.festival_id),
    venue_id: row.venue_id ? String(row.venue_id) : null,
    category_id: row.category_id ? String(row.category_id) : null,
    name: String(row.name),
    description: String(row.description ?? ""),
    organizer: String(row.organizer ?? ""),
    event_type: (row.event_type as FestivalEvent["event_type"]) ?? "physical",
    starts_at: isoText(row.starts_at),
    ends_at: isoText(row.ends_at),
    capacity: Number(row.capacity ?? 0),
    registration_mode: String(row.registration_mode ?? "open"),
    access_mode: String(row.access_mode ?? "epass"),
    status: (row.status as FestivalEvent["status"]) ?? "draft",
    published: Boolean(row.published),
    emergency_contact: String(row.emergency_contact ?? ""),
    sponsor_id: row.sponsor_id ? String(row.sponsor_id) : null,
    engagement_notes: String(row.engagement_notes ?? ""),
    venue_name: row.venue_name ? String(row.venue_name) : null,
    category_name: row.category_name ? String(row.category_name) : null,
    registered_count: row.registered_count != null ? Number(row.registered_count) : undefined,
    checkin_count: row.checkin_count != null ? Number(row.checkin_count) : undefined,
  };
}

export async function track(
  sql: Sql,
  input: {
    name: string;
    festivalId?: string | null;
    userId?: string | null;
    participantId?: string | null;
    payload?: Record<string, unknown>;
  },
) {
  const { newId } = await import("@/lib/ids");
  await sql.query(
    `insert into analytics_events (id, festival_id, user_id, participant_id, name, payload_json)
     values ($1,$2,$3,$4,$5,$6)`,
    [
      newId("an"),
      input.festivalId ?? null,
      input.userId ?? null,
      input.participantId ?? null,
      input.name,
      JSON.stringify(input.payload ?? {}),
    ],
  );
}

export async function audit(
  sql: Sql,
  actor: string,
  action: string,
  entity: string,
  entityId: string,
  meta: Record<string, unknown> = {},
) {
  const { newId } = await import("@/lib/ids");
  await sql.query(
    `insert into audit_logs (id, actor_user_id, action, entity, entity_id, meta_json)
     values ($1,$2,$3,$4,$5,$6)`,
    [newId("aud"), actor, action, entity, entityId, JSON.stringify(meta)],
  );
}

export async function eventReadiness(sql: Sql, eventId: string): Promise<EventReadiness> {
  const rows = await sql.query<Record<string, unknown>>(
    `select e.*, v.id as venue_ok,
            (select count(*)::int from gate_access_keys k where k.event_id = e.id and k.active) as gate_keys,
            (select count(*)::int from surveys s where s.event_id = e.id) as surveys
     from events e
     left join venues v on v.id = e.venue_id
     where e.id = $1`,
    [eventId],
  );
  const e = rows[0];
  if (!e) return { score: 0, items: [] };
  const items = [
    { key: "info", label: "Event information", ok: Boolean(e.name && e.description) },
    { key: "venue", label: "Venue", ok: Boolean(e.venue_id) },
    { key: "registration", label: "Registration", ok: Boolean(e.registration_mode) },
    { key: "epass", label: "ePASS", ok: e.access_mode === "epass" || e.access_mode === "open" },
    { key: "gate", label: "Gate staff", ok: Number(e.gate_keys) > 0, warn: Number(e.gate_keys) === 0 },
    { key: "sponsor", label: "Sponsor", ok: Boolean(e.sponsor_id) },
    { key: "survey", label: "Survey", ok: Number(e.surveys) > 0 },
    {
      key: "emergency",
      label: "Emergency contact",
      ok: Boolean(String(e.emergency_contact ?? "").trim()),
      warn: !String(e.emergency_contact ?? "").trim(),
    },
  ];
  const score = Math.round((items.filter((i) => i.ok).length / items.length) * 100);
  return { score, items };
}

export async function requireSsp(sql: Sql, userId: string) {
  const rows = await sql.query<{ kind: string }>(
    `select kind from operator_accounts where id = $1`,
    [userId],
  );
  if (rows[0]?.kind === "ssp") return;
  throw new Error("SSP access required");
}

export async function grantSspOperators(sql: Sql, festivalId: string) {
  const ops = await sql.query<{ id: string }>(
    `select id from operator_accounts where kind = 'ssp'`,
  );
  for (const op of ops) {
    await sql.query(
      `insert into festival_members (festival_id, user_id, role) values ($1,$2,'admin') on conflict do nothing`,
      [festivalId, op.id],
    );
  }
}

export async function requireFestivalMember(sql: Sql, userId: string, festivalId: string) {
  const acc = await sql.query<{ kind: string }>(
    `select kind from operator_accounts where id = $1`,
    [userId],
  );
  if (acc[0]?.kind === "ssp") return "admin";
  const rows = await sql.query<{ role: string }>(
    `select role from festival_members where user_id = $1 and festival_id = $2`,
    [userId, festivalId],
  );
  if (!rows[0]) throw new Error("Festival access required");
  return rows[0].role;
}

export async function isSsp(sql: Sql, userId: string) {
  const rows = await sql.query<{ kind: string }>(
    `select kind from operator_accounts where id = $1`,
    [userId],
  );
  return rows[0]?.kind === "ssp";
}
