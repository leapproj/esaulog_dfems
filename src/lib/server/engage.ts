import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { newId } from "@/lib/ids";
import type { Product, Sponsor, Vendor } from "@/lib/types";
import { ensureSeed } from "./seed";

export const getVendorDesk = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureSeed(sql);
    void context.userId;
    const vendors = await sql.query<Vendor>(
      `select * from vendors where festival_id = 'fst_higalaay2026' order by name`,
    );
    const products = await sql.query<Product & { vendor_name: string }>(
      `select p.*, v.name as vendor_name from products p join vendors v on v.id = p.vendor_id
       where v.festival_id = 'fst_higalaay2026'`,
    );
    const offers = await sql.query<{
      id: string;
      title: string;
      code: string;
      vendor_name: string;
      kind: string;
    }>(
      `select o.id, o.title, o.code, o.kind, v.name as vendor_name
       from offers o join vendors v on v.id = o.vendor_id
       where o.festival_id = 'fst_higalaay2026'`,
    );
    const coupons = await sql.query<{ n: number }>(`select count(*)::int as n from coupons`);
    return { vendors, products, offers, couponCount: coupons[0]?.n ?? 0 };
  });

export const addProduct = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { vendorId: string; name: string; price_php: number }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    void context.userId;
    const id = newId("prd");
    await sql.query(
      `insert into products (id, vendor_id, name, description, price_php, available) values ($1,$2,$3,'', $4, true)`,
      [id, data.vendorId, data.name, data.price_php],
    );
    return { id };
  });

export const setVendorBooster = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { vendorId: string; booster: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    void context.userId;
    await sql.query(`update vendors set booster = $1 where id = $2`, [
      data.booster,
      data.vendorId,
    ]);
    return { ok: true };
  });

export const getSponsorDesk = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureSeed(sql);
    void context.userId;
    const sponsors = await sql.query<Sponsor>(
      `select * from sponsors where festival_id = 'fst_higalaay2026'`,
    );
    const campaigns = await sql.query<{
      id: string;
      name: string;
      description: string;
      status: string;
      scans: number;
      participants_count: number;
      sponsor_name: string;
    }>(
      `select c.id, c.name, c.description, c.status, c.scans, c.participants_count, s.name as sponsor_name
       from sponsor_campaigns c join sponsors s on s.id = c.sponsor_id
       where c.festival_id = 'fst_higalaay2026'`,
    );
    return { sponsors, campaigns };
  });

export const bumpCampaignScan = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((campaignId: string) => campaignId)
  .handler(async ({ context, data: campaignId }) => {
    const sql = await getSql();
    void context.userId;
    await sql.query(
      `update sponsor_campaigns set scans = scans + 1, participants_count = participants_count + 1 where id = $1`,
      [campaignId],
    );
    return { ok: true };
  });

export const getHubStats = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureSeed(sql);
    const me = await sql.query<{ id: string; full_name: string }>(
      `select id, full_name from participants where user_id = $1 limit 1`,
      [context.userId],
    );
    const epass = me[0]
      ? await sql.query<{ credential_id: string }>(
          `select credential_id from epasses where participant_id = $1`,
          [me[0].id],
        )
      : [];
    const live = await sql.query<{ n: number }>(
      `select count(*)::int as n from festivals where status = 'LIVE'`,
    );
    return {
      participantName: me[0]?.full_name ?? "Operator",
      credentialId: epass[0]?.credential_id ?? null,
      liveFestivals: live[0]?.n ?? 0,
    };
  });
