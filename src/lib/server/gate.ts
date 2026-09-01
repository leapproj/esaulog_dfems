import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { newId } from "@/lib/ids";
import { track } from "./helpers";
import { ensureSeed } from "./seed";

export type GateSession = {
  keyId: string;
  code: string;
  festivalId: string;
  festivalName: string;
  eventId: string;
  eventName: string;
  gateName: string | null;
  staffRole: string;
};

export const redeemAccessKey = createServerFn({ method: "POST" })
  .validator((code: string) => code.trim().toUpperCase())
  .handler(async ({ data: code }) => {
    const sql = await getSql();
    await ensureSeed(sql);
    const rows = await sql.query<{
      id: string;
      code: string;
      festival_id: string;
      event_id: string;
      staff_role: string;
      active: boolean;
      festival_name: string;
      event_name: string;
      gate_name: string | null;
    }>(
      `select k.id, k.code, k.festival_id, k.event_id, k.staff_role, k.active,
              f.name as festival_name, e.name as event_name, g.name as gate_name
       from gate_access_keys k
       join festivals f on f.id = k.festival_id
       join events e on e.id = k.event_id
       left join gates g on g.id = k.gate_id
       where k.code = $1`,
      [code],
    );
    const k = rows[0];
    if (!k || !k.active) return { ok: false as const, reason: "Unknown or inactive access key" };
    await track(sql, { name: "gate_access", festivalId: k.festival_id, payload: { code } });
    const session: GateSession = {
      keyId: k.id,
      code: k.code,
      festivalId: k.festival_id,
      festivalName: k.festival_name,
      eventId: k.event_id,
      eventName: k.event_name,
      gateName: k.gate_name,
      staffRole: k.staff_role,
    };
    return { ok: true as const, session };
  });

function parseCredential(raw: string) {
  const t = raw.trim();
  if (t.startsWith("esaulog:epass:")) return t.slice("esaulog:epass:".length);
  return t.toUpperCase().startsWith("ESA-") ? t.toUpperCase() : t;
}

export const scanEpass = createServerFn({ method: "POST" })
  .validator((input: { code: string; credential: string }) => input)
  .handler(async ({ data }) => {
    const sql = await getSql();
    await ensureSeed(sql);
    const keyRows = await sql.query<{
      id: string;
      event_id: string;
      gate_id: string | null;
      festival_id: string;
      active: boolean;
    }>(
      `select id, event_id, gate_id, festival_id, active from gate_access_keys where code = $1`,
      [data.code.trim().toUpperCase()],
    );
    const key = keyRows[0];
    if (!key || !key.active) {
      return { ok: false as const, reason: "Invalid access key" };
    }
    const cred = parseCredential(data.credential);
    const ep = await sql.query<{
      id: string;
      credential_id: string;
      status: string;
      participant_id: string;
      full_name: string;
      festival_id: string;
    }>(
      `select ep.id, ep.credential_id, ep.status, ep.participant_id, p.full_name, ep.festival_id
       from epasses ep join participants p on p.id = ep.participant_id
       where ep.credential_id = $1 or ep.qr_payload = $2`,
      [cred, data.credential.trim()],
    );
    const pass = ep[0];
    if (!pass) {
      await sql.query(
        `insert into checkins (id, epass_id, event_id, gate_id, access_key_id, result, reason)
         select $1, ep.id, $2, $3, $4, 'invalid', 'Unknown credential' from epasses ep limit 0`,
        [newId("chk"), key.event_id, key.gate_id, key.id],
      );
      return { ok: false as const, reason: "Unknown ePASS" };
    }
    if (pass.status !== "active") {
      return {
        ok: false as const,
        reason: `Credential ${pass.status}`,
        participant: { name: pass.full_name, credentialId: pass.credential_id },
      };
    }
    const registered = await sql.query(
      `select id from event_registrations where event_id = $1 and participant_id = $2`,
      [key.event_id, pass.participant_id],
    );
    if (!registered[0]) {
      await sql.query(
        `insert into checkins (id, epass_id, event_id, gate_id, access_key_id, result, reason)
         values ($1,$2,$3,$4,$5,'invalid','Not registered for this event')`,
        [newId("chk"), pass.id, key.event_id, key.gate_id, key.id],
      );
      return {
        ok: false as const,
        reason: "Not registered for this event",
        participant: { name: pass.full_name, credentialId: pass.credential_id },
      };
    }
    const already = await sql.query(
      `select id from checkins where epass_id = $1 and event_id = $2 and result = 'valid'`,
      [pass.id, key.event_id],
    );
    if (already[0]) {
      return {
        ok: false as const,
        reason: "Already checked in",
        participant: { name: pass.full_name, credentialId: pass.credential_id },
      };
    }
    await sql.query(
      `insert into checkins (id, epass_id, event_id, gate_id, access_key_id, result, reason)
       values ($1,$2,$3,$4,$5,'valid','')`,
      [newId("chk"), pass.id, key.event_id, key.gate_id, key.id],
    );
    await track(sql, {
      name: "checkin_completed",
      festivalId: key.festival_id,
      participantId: pass.participant_id,
      payload: { eventId: key.event_id },
    });
    const event = await sql.query<{ name: string }>(`select name from events where id = $1`, [
      key.event_id,
    ]);
    return {
      ok: true as const,
      participant: {
        name: pass.full_name,
        credentialId: pass.credential_id,
        participantId: pass.participant_id,
        eventName: event[0]?.name ?? "",
      },
    };
  });

export const listRecentCheckins = createServerFn({ method: "GET" })
  .validator((code: string) => code.trim().toUpperCase())
  .handler(async ({ data: code }) => {
    const sql = await getSql();
    const key = await sql.query<{ event_id: string }>(
      `select event_id from gate_access_keys where code = $1`,
      [code],
    );
    if (!key[0]) return [];
    return sql.query<{
      id: string;
      result: string;
      reason: string;
      full_name: string;
      credential_id: string;
      checked_in_at: string;
    }>(
      `select c.id, c.result, c.reason, p.full_name, ep.credential_id, c.checked_in_at::text as checked_in_at
       from checkins c
       join epasses ep on ep.id = c.epass_id
       join participants p on p.id = ep.participant_id
       where c.event_id = $1
       order by c.checked_in_at desc
       limit 12`,
      [key[0].event_id],
    );
  });
