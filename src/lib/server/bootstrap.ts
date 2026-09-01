import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { credentialFromSeq, newId, qrPayload } from "@/lib/ids";
import { audit, track } from "./helpers";
import { ensureSeed } from "./seed";

export const bootstrapWorkspace = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureSeed(sql);
    const userId = context.userId;
    const hid = "fst_higalaay2026";
    let me = await sql.query<{ id: string; full_name: string }>(
      `select id, full_name from participants where festival_id = $1 and user_id = $2`,
      [hid, userId],
    );
    if (!me[0]) {
      const seqRow = await sql.query<{ n: number }>(`select count(*)::int as n from epasses`);
      const cred = credentialFromSeq(1900 + (seqRow[0]?.n ?? 0));
      const pid = newId("par");
      await sql.query(
        `insert into participants (id, festival_id, user_id, full_name, email, city, age_bracket, status)
         values ($1,$2,$3,$4,'','Cagayan de Oro','25-34','active')`,
        [pid, hid, userId, "Festival guest"],
      );
      await sql.query(
        `insert into epasses (id, festival_id, participant_id, credential_id, qr_payload, status, expires_at)
         values ($1,$2,$3,$4,$5,'active','2026-08-29T23:59:00+08:00')`,
        [newId("eps"), hid, pid, cred, qrPayload(cred)],
      );
      for (const ev of ["evt_kahimunan", "evt_msme", "evt_watch", "evt_culinary"]) {
        await sql.query(
          `insert into event_registrations (id, event_id, participant_id, status)
           values ($1,$2,$3,'registered') on conflict do nothing`,
          [newId("reg"), ev, pid],
        );
      }
      await sql.query(
        `insert into participant_points (participant_id, festival_id, points) values ($1,$2,40) on conflict do nothing`,
        [pid, hid],
      );
      await track(sql, { name: "participant_registered", festivalId: hid, userId, participantId: pid });
      await track(sql, { name: "epass_issued", festivalId: hid, userId, participantId: pid });
      me = [{ id: pid, full_name: "Festival guest" }];
    }
    await audit(sql, userId, "workspace.bootstrap", "user", userId);
    const epass = await sql.query<{ credential_id: string }>(
      `select credential_id from epasses where participant_id = $1`,
      [me[0].id],
    );
    return {
      userId,
      participantId: me[0].id,
      credentialId: epass[0]?.credential_id ?? null,
      festivalId: hid,
    };
  });
