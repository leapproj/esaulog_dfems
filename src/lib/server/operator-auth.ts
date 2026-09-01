import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { newId } from "@/lib/ids";
import type { OperatorKind, OperatorProfile } from "@/lib/operator-session";
import { hashPass, signOperator, verifyOperatorToken, verifyPass } from "./crypto-pass";
import { ensureSeed } from "./seed";

class OperatorUnauthorized extends Error {
  readonly status = 401;
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

export const tenantMiddleware = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const { getOperatorToken } = await import("@/lib/operator-session");
    return next({ sendContext: { operatorToken: getOperatorToken() ?? undefined } });
  })
  .server(async ({ next, context }) => {
    let token = context.operatorToken as string | undefined;
    if (!token) {
      const { getCookie } = await import("@tanstack/react-start/server");
      token = getCookie("esaulog_op");
    }
    const session = verifyOperatorToken(token);
    if (!session) throw new OperatorUnauthorized();
    return next({ context: { userId: session.id, operator: session } });
  });

export const sspMiddleware = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const { getOperatorToken } = await import("@/lib/operator-session");
    return next({ sendContext: { operatorToken: getOperatorToken() ?? undefined } });
  })
  .server(async ({ next, context }) => {
    let token = context.operatorToken as string | undefined;
    if (!token) {
      const { getCookie } = await import("@tanstack/react-start/server");
      token = getCookie("esaulog_op");
    }
    const session = verifyOperatorToken(token);
    if (!session) throw new OperatorUnauthorized();
    if (session.kind !== "ssp") {
      throw new Error("SSP access required");
    }
    return next({ context: { userId: session.id, operator: session } });
  });

function issue(row: {
  id: string;
  username: string;
  kind: string;
  display_name: string;
}) {
  const profile: OperatorProfile = {
    id: row.id,
    username: row.username,
    kind: row.kind as OperatorKind,
    display_name: row.display_name || row.username,
  };
  const token = signOperator({ ...profile, exp: Date.now() + 1000 * 60 * 60 * 24 * 7 });
  return { token, profile };
}

export const signInTenant = createServerFn({ method: "POST" })
  .validator((input: { username: string; password: string }) => input)
  .handler(async ({ data }) => {
    const sql = await getSql();
    await ensureSeed(sql);
    const username = data.username.trim().toLowerCase();
    const rows = await sql.query<{
      id: string;
      username: string;
      pass_hash: string;
      kind: string;
      display_name: string;
    }>(`select * from operator_accounts where lower(username) = $1`, [username]);
    const row = rows[0];
    if (!row) {
      throw new Error("Invalid tenant User ID or passkey");
    }
    if (row.kind === "ssp") {
      throw new Error(
        "This is a TukodPH Super Admin account, not a Festival Tenant account. Please sign in via TukodPH SSP Headquarters at /ssp/login.",
      );
    }
    if (!verifyPass(data.password, row.pass_hash)) {
      throw new Error("Invalid tenant passkey");
    }
    await sql.query(`update operator_accounts set last_seen_at = now() where id = $1`, [row.id]);
    return issue(row);
  });

export const signInSsp = createServerFn({ method: "POST" })
  .validator((input: { username: string; password: string }) => input)
  .handler(async ({ data }) => {
    const sql = await getSql();
    await ensureSeed(sql);
    const username = data.username.trim().toLowerCase();
    const cleanUsername = username.replace(/^tukodph[_-]/, "");
    const rows = await sql.query<{
      id: string;
      username: string;
      pass_hash: string;
      kind: string;
      display_name: string;
    }>(
      `select * from operator_accounts where 
        lower(username) = $1 
        or lower(username) = $2 
        or ('tukodph_' || lower(username)) = $1 
        or (id = 'op_ssp_van' and $1 in ('van', 'vanz', 'tukodph_van', 'tukodph_vanz'))
        or (id = 'op_ssp_lanz' and $1 in ('lanz', 'tukodph_lanz'))
        or (id = 'op_ssp_marc' and $1 in ('marc', 'tukodph_marc'))`,
      [username, cleanUsername],
    );
    const row = rows[0];
    if (!row) {
      throw new Error("Invalid TukodPH Super Admin User ID");
    }
    if (row.kind !== "ssp") {
      throw new Error(
        "This is a Festival Tenant account, not a Super Admin account. Festival tenants must sign in at the Tenant Portal (/login).",
      );
    }
    if (!verifyPass(data.password, row.pass_hash)) {
      throw new Error("Invalid Super Admin passkey");
    }
    await sql.query(`update operator_accounts set last_seen_at = now() where id = $1`, [row.id]);
    return issue(row);
  });

export const signUpTenant = createServerFn({ method: "POST" })
  .validator(
    (input: {
      username: string;
      password: string;
      display_name: string;
      organization_name: string;
      contact_email: string;
    }) => input,
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    await ensureSeed(sql);
    const username = data.username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
    if (username.length < 3) throw new Error("Username must be at least 3 characters");
    if (data.password.length < 6) throw new Error("Passkey must be at least 6 characters");
    const existing = await sql.query(`select id from operator_accounts where lower(username) = $1`, [
      username,
    ]);
    if (existing[0]) throw new Error("That ID is already taken");
    const id = newId("op");
    await sql.query(
      `insert into operator_accounts (id, username, pass_hash, kind, display_name, organization_name, contact_email)
       values ($1,$2,$3,'tenant',$4,$5,$6)`,
      [
        id,
        username,
        hashPass(data.password),
        data.display_name.trim() || username,
        data.organization_name.trim(),
        data.contact_email.trim(),
      ],
    );
    return issue({
      id,
      username,
      kind: "tenant",
      display_name: data.display_name.trim() || username,
    });
  });

export const demoLogin = createServerFn({ method: "POST" })
  .validator((input: { username: string; targetUrl?: string }) => input)
  .handler(async ({ data }) => {
    const sql = await getSql();
    await ensureSeed(sql);
    const username = data.username.trim().toLowerCase();
    const cleanUsername = username.replace(/^tukodph[_-]/, "");
    
    // Find matching operator account
    const rows = await sql.query<{
      id: string;
      username: string;
      pass_hash: string;
      kind: string;
      display_name: string;
    }>(
      `select * from operator_accounts where 
        lower(username) = $1 
        or lower(username) = $2 
        or ('tukodph_' || lower(username)) = $1 
        or (id = 'op_ssp_van' and $1 in ('van', 'vanz', 'tukodph_van', 'tukodph_vanz'))
        or (id = 'op_ssp_lanz' and $1 in ('lanz', 'tukodph_lanz'))
        or (id = 'op_ssp_marc' and $1 in ('marc', 'tukodph_marc'))
        or (id = 'op_higalaay' and $1 in ('higalaay', 'cdo'))
        or (id = 'op_diyandi' and $1 in ('diyandi', 'iligan'))
        or (id = 'op_lanzones' and $1 in ('lanzones', 'camiguin'))
      limit 1`,
      [username, cleanUsername],
    );

    const row = rows[0];
    if (!row) {
      throw new Error(`Demo account for '${username}' not found.`);
    }

    await sql.query(`update operator_accounts set last_seen_at = now() where id = $1`, [row.id]);
    const issued = issue(row);
    const redirectUrl = data.targetUrl || (row.kind === "ssp" ? "/ssp" : "/hub");
    return { ...issued, redirectUrl };
  });

export const getOperatorMe = createServerFn({ method: "GET" })
  .middleware([tenantMiddleware])
  .handler(async ({ context }) => context.operator);
