import { createServerFn } from "@tanstack/react-start";
import { GoogleGenAI } from "@google/genai";
import { getSql } from "@/lib/db";
import { newId } from "@/lib/ids";
import { tenantMiddleware as MW } from "./operator-auth";
import { eventReadiness, requireFestivalMember } from "./helpers";

export const getAiInbox = createServerFn({ method: "GET" })
  .middleware([MW])
  .validator((festivalId: any) => festivalId)
  .handler(async ({ context, data: festivalId }) => {
    const sql = await getSql();
    await requireFestivalMember(sql, context.userId, festivalId);
    const recs = await sql.query<any>(
      `select id, festival_id, title, body, severity, status, kind, created_at::text as created_at
       from ai_recommendations where festival_id = $1
       order by created_at desc`,
      [festivalId],
    );
    const events = await sql.query<any>(
      `select id, name from events where festival_id = $1 order by starts_at`,
      [festivalId],
    );
    return {
      recs,
      readiness: await Promise.all(
        events.map(async (e: any) => ({
          id: e.id,
          name: e.name,
          ...(await eventReadiness(sql, e.id)),
        })),
      ),
    };
  });

export const setRecommendationStatus = createServerFn({ method: "POST" })
  .middleware([MW])
  .validator((input: any) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireFestivalMember(sql, context.userId, data.festivalId);
    await sql.query<any>(
      `update ai_recommendations set status = $1 where id = $2 and festival_id = $3`,
      [data.status, data.id, data.festivalId],
    );
    return { ok: true };
  });

export const runAiReview = createServerFn({ method: "POST" })
  .middleware([MW])
  .validator((festivalId: any) => festivalId)
  .handler(async ({ context, data: festivalId }) => {
    const sql = await getSql();
    await requireFestivalMember(sql, context.userId, festivalId);
    const compact = (
      await sql.query<any>(
        `select e.id, e.name, e.starts_at::text as starts_at, e.emergency_contact, e.venue_id, e.published,
                (select count(*)::int from gate_access_keys k where k.event_id = e.id and k.active) as gates,
                (select count(*)::int from surveys s where s.event_id = e.id) as surveys
         from events e where e.festival_id = $1 order by e.starts_at`,
        [festivalId],
      )
    ).map((e: any) => ({
      name: e.name,
      starts: e.starts_at,
      gates: e.gates,
      surveys: e.surveys,
      venue: Boolean(e.venue_id),
      emergency: Boolean(String(e.emergency_contact ?? "").trim()),
      published: e.published,
    }));

    const geminiKey = process.env.GEMINI_API_KEY;
    const xaiKey = process.env.XAI_API_KEY;

    let parsed: Array<{ title: string; body: string; severity?: "info" | "warn"; kind?: string }> =
      [];

    if (geminiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: `Festival events (Asia/Manila time, active schedule):\n${JSON.stringify(compact, null, 2)}`,
          config: {
            systemInstruction:
              "You are the eSAULOG AI Festival Operations Director. Analyze festival events, safety parameters, gate readiness, and attendee flow. Propose 2-4 concrete, actionable operational recommendations in JSON array format: [{title: string, body: string, severity: 'info' | 'warn', kind: 'safety' | 'ops' | 'logistics' | 'experience'}]. Return JSON only.",
            responseMimeType: "application/json",
          },
        });
        const text = response.text ?? "[]";
        parsed = JSON.parse(text);
      } catch (err: any) {
        console.error("Gemini AI review error:", err);
      }
    } else if (xaiKey) {
      try {
        const res = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${xaiKey}`,
          },
          body: JSON.stringify({
            model: "grok-4.5",
            max_tokens: 700,
            messages: [
              {
                role: "system",
                content:
                  "You are the eSAULOG AI Festival Organizer. Return 2-4 operational recommendations as JSON array of {title, body, severity: info|warn, kind}. Be specific to the events given. No markdown.",
              },
              {
                role: "user",
                content: `Festival events (Asia/Manila, schedule):\n${JSON.stringify(compact)}`,
              },
            ],
          }),
        });
        if (res.ok) {
          const text = (await res.json()).choices[0]?.message.content ?? "[]";
          const match = text.match(/\[[\s\S]*\]/);
          parsed = JSON.parse(match ? match[0] : text);
        }
      } catch (err: any) {
        console.error("xAI review error:", err);
      }
    }

    // Heuristic fallback for demo/sandbox if no AI key or API fails
    if (!parsed || parsed.length === 0) {
      const generated: typeof parsed = [];
      const unpublished = compact.filter((e: any) => !e.published);
      const noVenue = compact.filter((e: any) => !e.venue);
      const noEmergency = compact.filter((e: any) => !e.emergency);
      const noGates = compact.filter((e: any) => e.gates === 0);

      if (noEmergency.length > 0) {
        generated.push({
          title: `Assign Emergency Contacts for ${noEmergency.length} event(s)`,
          body: `Events like "${noEmergency[0]?.name}" lack designated CDRRMO/PNP emergency coordinators. Establish immediate dispatch radio contacts.`,
          severity: "warn",
          kind: "safety",
        });
      }
      if (noGates.length > 0) {
        generated.push({
          title: `Deploy QR Access Gate Keys (${noGates.length} unassigned)`,
          body: `Events like "${noGates[0]?.name}" do not have active entry gate validation terminals. Generate checkpoint access tokens in Gates management.`,
          severity: "warn",
          kind: "ops",
        });
      }
      if (noVenue.length > 0) {
        generated.push({
          title: `Confirm Venue Allocations`,
          body: `${noVenue.length} event(s) have unassigned stage or grandstand venues. Ensure spatial capacity maps are linked.`,
          severity: "info",
          kind: "logistics",
        });
      }
      if (unpublished.length > 0) {
        generated.push({
          title: `Publish ${unpublished.length} Pending Event Schedules`,
          body: `Upcoming events are still staged in draft status. Review program schedules and broadcast to public portal.`,
          severity: "info",
          kind: "experience",
        });
      }

      if (generated.length === 0) {
        generated.push({
          title: "All Event Gates & Safety Protocols Synchronized",
          body: "All scheduled events have verified venues, emergency dispatch protocols, and operational QR scan keys active.",
          severity: "info",
          kind: "ops",
        });
      }
      parsed = generated;
    }

    const inserted = [];
    for (const rec of parsed.slice(0, 4)) {
      const id = newId("ai");
      await sql.query<any>(
        `insert into ai_recommendations (id, festival_id, title, body, severity, status, kind)
         values ($1,$2,$3,$4,$5,'open',$6)`,
        [
          id,
          festivalId,
          rec.title ?? "Recommendation",
          rec.body ?? "",
          rec.severity === "warn" ? "warn" : "info",
          rec.kind ?? "ops",
        ],
      );
      inserted.push(id);
    }
    return {
      ok: true,
      inserted: inserted.length,
    };
  });


