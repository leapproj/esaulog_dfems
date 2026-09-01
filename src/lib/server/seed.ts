import type { Sql } from "@/lib/db";
import { qrPayload } from "@/lib/ids";
import { hashPass } from "./crypto-pass";

async function insert(sql: Sql, table: string, rows: Record<string, unknown>[]) {
  for (const row of rows) {
    const keys = Object.keys(row);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(",");
    await sql.query(
      `insert into ${table} (${keys.join(",")}) values (${placeholders}) on conflict do nothing`,
      keys.map((k) => row[k]),
    );
  }
}

export async function runSeed(sql: Sql) {
  const flagged = await sql.query<{ value: string }>(`select value from app_meta where key = 'seeded'`);
  if (flagged[0]?.value === "1") return;

  await insert(sql, "organizations", [
    { id: "org_tukodph", name: "TukodPH", kind: "platform", city: "Cagayan de Oro", province: "Misamis Oriental" },
    { id: "org_cdo", name: "Cagayan de Oro City", kind: "lgu", city: "Cagayan de Oro", province: "Misamis Oriental" },
    { id: "org_iligan", name: "Iligan City", kind: "lgu", city: "Iligan", province: "Lanao del Norte" },
    { id: "org_camiguin", name: "Province of Camiguin", kind: "lgu", city: "Mambajao", province: "Camiguin" },
    { id: "org_bacolod", name: "Bacolod City", kind: "lgu", city: "Bacolod", province: "Negros Occidental" },
    { id: "org_cebu", name: "Cebu City", kind: "lgu", city: "Cebu", province: "Cebu" },
  ]);

  await insert(sql, "festivals", [
    {
      id: "fst_higalaay2026",
      organization_id: "org_cdo",
      name: "Higalaay 2026",
      slug: "higalaay-2026",
      tagline: "The festival of friendship.",
      description:
        "Cagayan de Oro’s city-wide celebration of kinship, street culture, and Kagay-anon craft. Physical stages, night markets, and a digital watch party run as one tenant.",
      logo_text: "HG",
      city: "Cagayan de Oro",
      province: "Misamis Oriental",
      starts_on: "2026-08-16",
      ends_on: "2026-08-28",
      timezone: "Asia/Manila",
      status: "LIVE",
      organizer_name: "City Tourism & Culture Office",
      contact_email: "higalaay@cdo.gov.ph",
      contact_phone: "+63 88 857 2251",
      primary_color: "#FEC513",
      hero_kicker: "Now live in the city of golden friendship",
      created_by: "system",
    },
    {
      id: "fst_diyandi2026",
      organization_id: "org_iligan",
      name: "Diyandi 2026",
      slug: "diyandi-2026",
      tagline: "Falls, faith, and fire.",
      description: "Iligan’s festival of water, industry, and devotion — currently in operational setup.",
      logo_text: "DY",
      city: "Iligan",
      province: "Lanao del Norte",
      starts_on: "2026-09-20",
      ends_on: "2026-09-29",
      timezone: "Asia/Manila",
      status: "SETUP",
      organizer_name: "Iligan City Tourism",
      contact_email: "diyandi@iligan.gov.ph",
      contact_phone: "+63 63 221 3032",
      primary_color: "#1C93F7",
      hero_kicker: "Setup window — staff and venues being assigned",
      created_by: "system",
    },
    {
      id: "fst_lanzones2026",
      organization_id: "org_camiguin",
      name: "Lanzones 2026",
      slug: "lanzones-2026",
      tagline: "Island harvest, island welcome.",
      description: "Camiguin’s harvest festival — tenant is in setup, program still locking venues.",
      logo_text: "LZ",
      city: "Mambajao",
      province: "Camiguin",
      starts_on: "2026-10-15",
      ends_on: "2026-10-20",
      timezone: "Asia/Manila",
      status: "SETUP",
      organizer_name: "Camiguin Provincial Tourism",
      contact_email: "lanzones@camiguin.gov.ph",
      contact_phone: "+63 88 387 1095",
      primary_color: "#A5D620",
      hero_kicker: "Harvest week on an island of volcanoes",
      created_by: "system",
    },
    {
      id: "fst_masskara2026",
      organization_id: "org_bacolod",
      name: "MassKara 2026",
      slug: "masskara-2026",
      tagline: "The smiling festival.",
      description: "Bacolod’s mask and street-dance spectacle. Tenant still in draft configuration.",
      logo_text: "MK",
      city: "Bacolod",
      province: "Negros Occidental",
      starts_on: "2026-10-01",
      ends_on: "2026-10-20",
      timezone: "Asia/Manila",
      status: "DRAFT",
      organizer_name: "Bacolod City Government",
      contact_email: "masskara@bacolod.gov.ph",
      contact_phone: "+63 34 434 5621",
      primary_color: "#FF2D32",
      hero_kicker: "Draft tenant — program not yet published",
      created_by: "system",
    },
    {
      id: "fst_sinulog2027",
      organization_id: "org_cebu",
      name: "Sinulog 2027",
      slug: "sinulog-2027",
      tagline: "One beat, one people.",
      description: "Cebu’s grandest devotion and street ritual. Planning horizon for 2027.",
      logo_text: "SN",
      city: "Cebu",
      province: "Cebu",
      starts_on: "2027-01-10",
      ends_on: "2027-01-18",
      timezone: "Asia/Manila",
      status: "PLANNING",
      organizer_name: "Sinulog Foundation",
      contact_email: "sinulog@cebu.gov.ph",
      contact_phone: "+63 32 255 8186",
      primary_color: "#E019D6",
      hero_kicker: "Planning the 2027 pit señor",
      created_by: "system",
    },
  ]);

  await insert(sql, "venues", [
    { id: "ven_gaston", festival_id: "fst_higalaay2026", name: "Gaston Park", address: "Corrales Ave", capacity: 8000, kind: "outdoor", notes: "Opening & civic rites" },
    { id: "ven_xu", festival_id: "fst_higalaay2026", name: "Xavier University Grounds", address: "Corrales Avenue", capacity: 5000, kind: "campus", notes: "Street dance spillover" },
    { id: "ven_divisoria", festival_id: "fst_higalaay2026", name: "Divisoria Night Market", address: "RN Abejuela St", capacity: 12000, kind: "market", notes: "MSME corridor" },
    { id: "ven_cityhall", festival_id: "fst_higalaay2026", name: "City Hall Grounds", address: "Capistrano St", capacity: 3000, kind: "civic", notes: "Forum & press" },
    { id: "ven_limketkai", festival_id: "fst_higalaay2026", name: "Limketkai Atrium", address: "Limketkai Center", capacity: 2200, kind: "indoor", notes: "Coronation" },
    { id: "ven_pelaez", festival_id: "fst_higalaay2026", name: "Pelaez Sports Center", address: "Velez St", capacity: 6500, kind: "arena", notes: "Sports clinic" },
    { id: "ven_digital", festival_id: "fst_higalaay2026", name: "Digital Stage", address: "esaulog.ph/live", capacity: 50000, kind: "digital", notes: "Hybrid watch party" },
    { id: "ven_esplanade", festival_id: "fst_higalaay2026", name: "CDO River Esplanade", address: "Yacapin Extension", capacity: 4000, kind: "outdoor", notes: "Culinary trail" },
    { id: "ven_maria", festival_id: "fst_diyandi2026", name: "Maria Cristina Falls View", address: "Mendoza Park", capacity: 4000, kind: "outdoor", notes: "" },
    { id: "ven_lanzones", festival_id: "fst_lanzones2026", name: "Mambajao Town Plaza", address: "Mambajao Poblacion", capacity: 3500, kind: "outdoor", notes: "Harvest parade" },
  ]);

  await insert(sql, "event_categories", [
    { id: "cat_civic", festival_id: "fst_higalaay2026", name: "Civic Rites", slug: "civic" },
    { id: "cat_street", festival_id: "fst_higalaay2026", name: "Street Culture", slug: "street" },
    { id: "cat_msme", festival_id: "fst_higalaay2026", name: "MSME & Food", slug: "msme" },
    { id: "cat_stage", festival_id: "fst_higalaay2026", name: "Stage & Night", slug: "stage" },
    { id: "cat_digital", festival_id: "fst_higalaay2026", name: "Digital", slug: "digital" },
    { id: "cat_youth", festival_id: "fst_higalaay2026", name: "Youth & Sport", slug: "youth" },
  ]);

  await insert(sql, "sponsors", [
    { id: "spn_coke", festival_id: "fst_higalaay2026", name: "Coca-Cola", tier: "presenting", logo_text: "CC", website: "https://coca-cola.com", contact: "ph@coke.example" },
    { id: "spn_smart", festival_id: "fst_higalaay2026", name: "Smart Communications", tier: "official", logo_text: "SM", website: "https://smart.com.ph", contact: "events@smart.example" },
    { id: "spn_cdo", festival_id: "fst_higalaay2026", name: "CDO Invest", tier: "civic", logo_text: "CI", website: "", contact: "invest@cdo.gov.ph" },
  ]);

  const events = [
    {
      id: "evt_opening",
      festival_id: "fst_higalaay2026",
      venue_id: "ven_gaston",
      category_id: "cat_civic",
      name: "Higalaay Opening Ceremony",
      description: "Civic opening, flag rite, and friendship declaration at Gaston Park.",
      organizer: "City Tourism",
      event_type: "physical",
      starts_at: "2026-08-16T16:00:00+08:00",
      ends_at: "2026-08-16T19:00:00+08:00",
      capacity: 8000,
      registration_mode: "open",
      access_mode: "epass",
      status: "completed",
      published: true,
      emergency_contact: "CDRRMO 911",
      sponsor_id: "spn_coke",
      engagement_notes: "Opening survey closed",
    },
    {
      id: "evt_kahimunan",
      festival_id: "fst_higalaay2026",
      venue_id: "ven_xu",
      category_id: "cat_street",
      name: "Kahimunan Street Dance",
      description: "Competing barangay contingents. People’s Choice vote is open on the participant portal.",
      organizer: "Higalaay Committee",
      event_type: "physical",
      starts_at: "2026-08-22T16:00:00+08:00",
      ends_at: "2026-08-22T19:30:00+08:00",
      capacity: 5000,
      registration_mode: "open",
      access_mode: "epass",
      status: "live",
      published: true,
      emergency_contact: "CDRRMO 911",
      sponsor_id: "spn_coke",
      engagement_notes: "People’s Choice voting",
    },
    {
      id: "evt_msme",
      festival_id: "fst_higalaay2026",
      venue_id: "ven_divisoria",
      category_id: "cat_msme",
      name: "Divisoria MSME Night Market",
      description: "Local makers, food stalls, and festival coupons along the night market corridor.",
      organizer: "CDO Trade Office",
      event_type: "physical",
      starts_at: "2026-08-22T18:00:00+08:00",
      ends_at: "2026-08-23T00:00:00+08:00",
      capacity: 12000,
      registration_mode: "open",
      access_mode: "open",
      status: "live",
      published: true,
      emergency_contact: "CDRRMO 911",
      sponsor_id: "spn_cdo",
      engagement_notes: "MSME booster listings",
    },
    {
      id: "evt_watch",
      festival_id: "fst_higalaay2026",
      venue_id: "ven_digital",
      category_id: "cat_digital",
      name: "Higalaay Digital Watch Party",
      description: "Hybrid stream of the street dance with live chat missions and sponsor activations.",
      organizer: "TukodPH Digital",
      event_type: "digital",
      starts_at: "2026-08-22T16:00:00+08:00",
      ends_at: "2026-08-22T20:00:00+08:00",
      capacity: 50000,
      registration_mode: "open",
      access_mode: "epass",
      status: "live",
      published: true,
      emergency_contact: "digital@esaulog.ph",
      sponsor_id: "spn_smart",
      engagement_notes: "Digital sponsor inventory",
    },
    {
      id: "evt_culinary",
      festival_id: "fst_higalaay2026",
      venue_id: "ven_esplanade",
      category_id: "cat_msme",
      name: "River Esplanade Culinary Trail",
      description: "Kagay-anon kitchens, tasting stamps, and vendor coupons along the river.",
      organizer: "CDO Food Council",
      event_type: "physical",
      starts_at: "2026-08-23T17:00:00+08:00",
      ends_at: "2026-08-23T22:00:00+08:00",
      capacity: 4000,
      registration_mode: "open",
      access_mode: "epass",
      status: "published",
      published: true,
      emergency_contact: "CDRRMO 911",
      sponsor_id: "spn_coke",
      engagement_notes: "",
    },
    {
      id: "evt_friendship",
      festival_id: "fst_higalaay2026",
      venue_id: "ven_limketkai",
      category_id: "cat_stage",
      name: "Friendship Night",
      description: "Coronation, concerts, and the closing friendship rite.",
      organizer: "Higalaay Committee",
      event_type: "hybrid",
      starts_at: "2026-08-28T19:00:00+08:00",
      ends_at: "2026-08-28T23:00:00+08:00",
      capacity: 2200,
      registration_mode: "open",
      access_mode: "epass",
      status: "published",
      published: true,
      emergency_contact: "CDRRMO 911",
      sponsor_id: "spn_smart",
      engagement_notes: "",
    },
    {
      id: "evt_diyandi_open",
      festival_id: "fst_diyandi2026",
      venue_id: "ven_maria",
      category_id: null,
      name: "Diyandi Opening at the Falls",
      description: "Opening rites overlooking Maria Cristina Falls.",
      organizer: "Iligan City Tourism",
      event_type: "physical",
      starts_at: "2026-09-20T16:00:00+08:00",
      ends_at: "2026-09-20T19:00:00+08:00",
      capacity: 4000,
      registration_mode: "open",
      access_mode: "epass",
      status: "draft",
      published: false,
      emergency_contact: "Iligan CDRRMO",
      sponsor_id: null,
      engagement_notes: "",
    },
    {
      id: "evt_lanzones_parade",
      festival_id: "fst_lanzones2026",
      venue_id: "ven_lanzones",
      category_id: null,
      name: "Lanzones Harvest Parade",
      description: "Island harvest parade through Mambajao.",
      organizer: "Camiguin Provincial Tourism",
      event_type: "physical",
      starts_at: "2026-10-17T08:00:00+08:00",
      ends_at: "2026-10-17T12:00:00+08:00",
      capacity: 3500,
      registration_mode: "open",
      access_mode: "epass",
      status: "draft",
      published: false,
      emergency_contact: "Camiguin PDRRMO",
      sponsor_id: null,
      engagement_notes: "",
    },
  ];
  await insert(sql, "events", events);

  const people = [
    { id: "par_van", festival_id: "fst_higalaay2026", user_id: null, full_name: "Van Zambrano", email: "van@example.ph", phone: "+63 917 000 1821", city: "Cagayan de Oro", age_bracket: "25-34", status: "active" },
    { id: "par_lara", festival_id: "fst_higalaay2026", user_id: null, full_name: "Lara Kagay-anon", email: "lara@example.ph", phone: "", city: "Cagayan de Oro", age_bracket: "18-24", status: "active" },
    { id: "par_jun", festival_id: "fst_higalaay2026", user_id: null, full_name: "Jun Pelaez", email: "jun@example.ph", phone: "", city: "Iligan", age_bracket: "35-44", status: "registered" },
    { id: "par_nia", festival_id: "fst_higalaay2026", user_id: null, full_name: "Nia Camiguin", email: "nia@example.ph", phone: "", city: "Mambajao", age_bracket: "25-34", status: "active" },
  ];
  await insert(sql, "participants", people);

  await insert(sql, "epasses", [
    { id: "eps_van", festival_id: "fst_higalaay2026", participant_id: "par_van", credential_id: "ESA-0001821", qr_payload: qrPayload("ESA-0001821"), nfc_id: null, status: "active", issued_at: "2026-08-10T08:00:00+08:00", expires_at: "2026-08-29T23:59:00+08:00" },
    { id: "eps_lara", festival_id: "fst_higalaay2026", participant_id: "par_lara", credential_id: "ESA-0001822", qr_payload: qrPayload("ESA-0001822"), nfc_id: null, status: "active", issued_at: "2026-08-10T08:00:00+08:00", expires_at: "2026-08-29T23:59:00+08:00" },
    { id: "eps_jun", festival_id: "fst_higalaay2026", participant_id: "par_jun", credential_id: "ESA-0001823", qr_payload: qrPayload("ESA-0001823"), nfc_id: null, status: "active", issued_at: "2026-08-11T08:00:00+08:00", expires_at: "2026-08-29T23:59:00+08:00" },
    { id: "eps_nia", festival_id: "fst_higalaay2026", participant_id: "par_nia", credential_id: "ESA-0001824", qr_payload: qrPayload("ESA-0001824"), nfc_id: null, status: "active", issued_at: "2026-08-12T08:00:00+08:00", expires_at: "2026-08-29T23:59:00+08:00" },
  ]);

  const regs: Record<string, unknown>[] = [];
  for (const p of people) {
    for (const ev of ["evt_kahimunan", "evt_msme", "evt_watch", "evt_culinary", "evt_opening"]) {
      regs.push({ id: `reg_${p.id}_${ev}`, event_id: ev, participant_id: p.id, status: "registered" });
    }
  }
  await insert(sql, "event_registrations", regs);

  await insert(sql, "gates", [
    { id: "gate_a", festival_id: "fst_higalaay2026", event_id: "evt_kahimunan", name: "Gate A" },
    { id: "gate_b", festival_id: "fst_higalaay2026", event_id: "evt_kahimunan", name: "Gate B" },
    { id: "gate_open", festival_id: "fst_higalaay2026", event_id: "evt_opening", name: "Main Gate" },
    { id: "gate_night", festival_id: "fst_higalaay2026", event_id: "evt_friendship", name: "Night Gate" },
    { id: "gate_diyandi", festival_id: "fst_diyandi2026", event_id: "evt_diyandi_open", name: "Falls Gate" },
    { id: "gate_lanzones", festival_id: "fst_lanzones2026", event_id: "evt_lanzones_parade", name: "Plaza Gate" },
  ]);

  await insert(sql, "gate_access_keys", [
    { id: "key_gate_a", festival_id: "fst_higalaay2026", event_id: "evt_kahimunan", gate_id: "gate_a", code: "HIGALAAY-GATE-A", staff_role: "usher", valid_from: "2026-08-22T00:00:00+08:00", valid_until: "2026-08-23T02:00:00+08:00", max_devices: 12, permission_scope: "checkin", active: true },
    { id: "key_open", festival_id: "fst_higalaay2026", event_id: "evt_opening", gate_id: "gate_open", code: "HIGALAAY-OPENING", staff_role: "usher", valid_from: "2026-08-16T00:00:00+08:00", valid_until: "2026-08-17T02:00:00+08:00", max_devices: 20, permission_scope: "checkin", active: true },
    { id: "key_night", festival_id: "fst_higalaay2026", event_id: "evt_friendship", gate_id: "gate_night", code: "HIGALAAY-NIGHT", staff_role: "supervisor", valid_from: "2026-08-28T00:00:00+08:00", valid_until: "2026-08-29T02:00:00+08:00", max_devices: 8, permission_scope: "checkin", active: true },
    { id: "key_diyandi_a", festival_id: "fst_diyandi2026", event_id: "evt_diyandi_open", gate_id: "gate_diyandi", code: "DIYANDI-GATE-A", staff_role: "usher", valid_from: "2026-09-20T00:00:00+08:00", valid_until: "2026-09-30T02:00:00+08:00", max_devices: 10, permission_scope: "checkin", active: true },
    { id: "key_lanzones_a", festival_id: "fst_lanzones2026", event_id: "evt_lanzones_parade", gate_id: "gate_lanzones", code: "LANZONES-GATE-A", staff_role: "usherette", valid_from: "2026-10-15T00:00:00+08:00", valid_until: "2026-10-21T02:00:00+08:00", max_devices: 8, permission_scope: "checkin", active: true },
  ]);

  await insert(sql, "checkins", [
    { id: "chk_van_open", epass_id: "eps_van", event_id: "evt_opening", gate_id: "gate_open", access_key_id: "key_open", result: "valid", reason: "", checked_in_at: "2026-08-16T16:12:00+08:00" },
    { id: "chk_lara_open", epass_id: "eps_lara", event_id: "evt_opening", gate_id: "gate_open", access_key_id: "key_open", result: "valid", reason: "", checked_in_at: "2026-08-16T16:18:00+08:00" },
  ]);

  await insert(sql, "badges", [
    { id: "bdg_explorer", festival_id: "fst_higalaay2026", name: "Festival Explorer", description: "Complete three festival events", icon_key: "compass" },
    { id: "bdg_friend", festival_id: "fst_higalaay2026", name: "Higala", description: "Checked in to opening rites", icon_key: "heart" },
  ]);
  await insert(sql, "missions", [
    { id: "msn_three", festival_id: "fst_higalaay2026", title: "Complete 3 festival events", description: "Check in to three programme moments.", points: 100, badge_id: "bdg_explorer", condition_type: "checkins", condition_value: 3, active: true },
    { id: "msn_open", festival_id: "fst_higalaay2026", title: "Opening witness", description: "Be at Gaston Park for the opening.", points: 40, badge_id: "bdg_friend", condition_type: "checkins", condition_value: 1, active: true },
  ]);
  await insert(sql, "participant_points", [
    { participant_id: "par_van", festival_id: "fst_higalaay2026", points: 40 },
  ]);
  await insert(sql, "participant_badges", [
    { participant_id: "par_van", badge_id: "bdg_friend" },
  ]);

  await insert(sql, "rewards", [
    { id: "rwd_coke", festival_id: "fst_higalaay2026", name: "Coke festival cup", description: "Claim at any Coca-Cola booth.", points_cost: 80, inventory: 400, sponsor_id: "spn_coke" },
  ]);
  await insert(sql, "sponsor_campaigns", [
    { id: "cmp_coke", sponsor_id: "spn_coke", festival_id: "fst_higalaay2026", name: "Coca-Cola Festival Challenge", description: "Visit an event, scan, complete a mission, claim a cup.", mission_id: "msn_three", status: "live", scans: 1280, participants_count: 640 },
  ]);

  await insert(sql, "vendors", [
    { id: "vnd_kagay", festival_id: "fst_higalaay2026", user_id: null, name: "Kagay Kakanin", category: "food", description: "Sticky rice and festival sweets.", location: "Divisoria Stall 12", booster: "booster", contact: "kakanin@cdo.ph" },
    { id: "vnd_loom", festival_id: "fst_higalaay2026", user_id: null, name: "Higaonon Loom", category: "craft", description: "Handwoven textiles.", location: "Night Market Row B", booster: "free", contact: "loom@cdo.ph" },
    { id: "vnd_brew", festival_id: "fst_higalaay2026", user_id: null, name: "CDO River Brew", category: "beverage", description: "Local coffee on the esplanade.", location: "Esplanade Cart 4", booster: "booster", contact: "brew@cdo.ph" },
  ]);
  await insert(sql, "products", [
    { id: "prd_puto", vendor_id: "vnd_kagay", name: "Puto festival box", description: "Shareable kakanin.", price_php: 180, available: true },
    { id: "prd_malong", vendor_id: "vnd_loom", name: "Malong wrap", description: "Handwoven.", price_php: 850, available: true },
    { id: "prd_drip", vendor_id: "vnd_brew", name: "Cold brew", description: "Bukidnon beans.", price_php: 140, available: true },
  ]);
  await insert(sql, "offers", [
    { id: "off_kagay", vendor_id: "vnd_kagay", festival_id: "fst_higalaay2026", title: "Buy 2 kakanin boxes", description: "Festival coupon.", kind: "coupon", code: "HIGALAAY-SWEET", active: true },
  ]);

  await insert(sql, "surveys", [
    { id: "srv_open", festival_id: "fst_higalaay2026", event_id: "evt_opening", title: "Opening night pulse", status: "closed" },
    { id: "srv_live", festival_id: "fst_higalaay2026", event_id: "evt_kahimunan", title: "Street dance experience", status: "open" },
  ]);
  await insert(sql, "survey_questions", [
    { id: "q_open_1", survey_id: "srv_open", prompt: "How was the opening rite?", kind: "choice" },
    { id: "q_live_1", survey_id: "srv_live", prompt: "Which contingent should win People’s Choice?", kind: "choice" },
  ]);

  await insert(sql, "festival_pages", [
    { id: "pg_h_home", festival_id: "fst_higalaay2026", slug: "home", title: "Higalaay 2026", body: "The festival of friendship is live in Cagayan de Oro.", published: true },
    { id: "pg_h_about", festival_id: "fst_higalaay2026", slug: "about", title: "About Higalaay", body: "Higalaay is Cagayan de Oro’s city-wide celebration of kinship.", published: true },
    { id: "pg_h_guide", festival_id: "fst_higalaay2026", slug: "guide", title: "Visitor guide", body: "Get an ePASS, pick events, and explore Divisoria at night.", published: true },
    { id: "pg_d_home", festival_id: "fst_diyandi2026", slug: "home", title: "Diyandi 2026", body: "Falls, faith, and fire — Iligan’s festival in setup.", published: true },
    { id: "pg_l_home", festival_id: "fst_lanzones2026", slug: "home", title: "Lanzones 2026", body: "Island harvest, island welcome.", published: true },
  ]);

  await insert(sql, "ai_recommendations", [
    { id: "ai_staff", festival_id: "fst_higalaay2026", title: "Friendship Night has thin gate coverage", body: "Assign two more ushers from the standby roster before 28 August.", severity: "warn", status: "open", kind: "ops" },
    { id: "ai_survey", festival_id: "fst_higalaay2026", title: "Culinary trail has no survey", body: "Add a two-question pulse so MSME satisfaction lands in M&E.", severity: "info", status: "open", kind: "readiness" },
  ]);

  await sql.query(`insert into app_meta (key, value) values ('seeded','1') on conflict do nothing`);
}

export async function runErpSeed(sql: Sql) {
  const flagged = await sql.query<{ value: string }>(`select value from app_meta where key = 'erp_seeded'`);
  if (flagged[0]?.value === "1") return;

  await insert(sql, "license_packages", [
    {
      id: "pkg_site",
      slug: "starter-website",
      name: "Starter Festival Website",
      kind: "self_serve",
      price_php: 90000,
      billing: "Full ownership (one-time license)",
      description: "Festival website and TukodPH CMS. Calendar, about, partners, and a public programme — the digital front door.",
      features_json: JSON.stringify([
        "Website + Content Management System (CMS)",
        "Public festival website",
        "Event calendar",
        "Draft content and auto publish to social media APIs",
        "Annual Maintenance",
        "Request reoccurring maintenance (fees applied per request)",
      ]),
      commission_pct: 0,
    },
    {
      id: "pkg_command",
      slug: "organizer-command-center",
      name: "Organizer Command Center",
      kind: "self_serve",
      price_php: 250000,
      billing: "per season",
      description: "Full DFEMS tenant: command center, ePASS, gate staff, participant portal, vendors, and sponsor activation.",
      features_json: JSON.stringify([
        "Everything in Starter",
        "Organizer Command Center",
        "ePASS + printable credentials",
        "Gate-staff access keys",
        "Participant portal",
        "Sponsor activation",
        "Limited Technical Support",
        "Scan QR Devices Exclusive",
      ]),
      commission_pct: 0,
    },
    {
      id: "pkg_intel",
      slug: "smart-festival",
      name: "Smart Festival",
      kind: "self_serve",
      price_php: 490000,
      billing: "per season",
      description: "Command plus turnout analytics, income ledgers, MSME Booster, and the AI Festival Organizer.",
      features_json: JSON.stringify([
        "Everything in Command",
        "Turnout & income analytics",
        "AI Festival Organizer",
        "Trade Fair Expo Cashless Transactions (Limited 2 Expo)",
        "MSME Booster",
        "Scan QR Devices Exclusive",
      ]),
      commission_pct: 0,
    },
    {
      id: "pkg_copartner_lite",
      slug: "digital-festival-lite",
      name: "Digital Festival Lite (Digital Partner)",
      kind: "copartner",
      price_php: 0,
      billing: "25% revenue share",
      description: "TukodPH as digital festival consultant creates, operates the digital festival, and finds digital festival sponsors. Digital festival income commissioned at 25%.",
      features_json: JSON.stringify([
        "Everything in Smart Festival",
        "TukodPH Team Support from Start to Finish",
        "LGU / Main organizer provide event staff",
        "Limited Festival and event Planning",
        "QR scan device and digital terminal Exclusive",
        "LGU / Organizer Incentivize TukodPH Team",
      ]),
      commission_pct: 25,
    },
    {
      id: "pkg_copartner_pro",
      slug: "smart-festival-pro",
      name: "Smart Festival Pro (Digital Organizer)",
      kind: "copartner",
      price_php: 0,
      billing: "40% revenue share",
      description: "TukodPH as digital festival consultant creates, operates the digital festival, and finds digital festival sponsors. Digital festival income commissioned at 40%.",
      features_json: JSON.stringify([
        "Everything in Smart Festival",
        "Full scale Smart Festival Organization",
        "TukodPH Team Support from Start to Finish",
        "Pre-event planning and sponsors outsourcing",
        "TukodPH team work with LGU/Organizer during Festival event",
        "Post-event Data Evaluation Report",
      ]),
      commission_pct: 40,
    },
  ]);

  // Backward compatibility check for existing packages
  await sql.query(`update license_packages set name = 'Starter Festival Website', price_php = 90000, billing = 'Full ownership (one-time license)', description = 'Festival website and TukodPH CMS. Calendar, about, partners, and a public programme — the digital front door.', features_json = $1 where id = 'pkg_site'`, [
    JSON.stringify([
      "Website + Content Management System (CMS)",
      "Public festival website",
      "Event calendar",
      "Draft content and auto publish to social media APIs",
      "Annual Maintenance",
      "Request reoccurring maintenance (fees applied per request)",
    ])
  ]);
  await sql.query(`update license_packages set name = 'Organizer Command Center', price_php = 250000, billing = 'per season', description = 'Full DFEMS tenant: command center, ePASS, gate staff, participant portal, vendors, and sponsor activation.', features_json = $1 where id = 'pkg_command'`, [
    JSON.stringify([
      "Everything in Starter",
      "Organizer Command Center",
      "ePASS + printable credentials",
      "Gate-staff access keys",
      "Participant portal",
      "Sponsor activation",
      "Limited Technical Support",
      "Scan QR Devices Exclusive",
    ])
  ]);
  await sql.query(`update license_packages set name = 'Smart Festival', price_php = 490000, billing = 'per season', description = 'Command plus turnout analytics, income ledgers, MSME Booster, and the AI Festival Organizer.', features_json = $1 where id = 'pkg_intel'`, [
    JSON.stringify([
      "Everything in Command",
      "Turnout & income analytics",
      "AI Festival Organizer",
      "Trade Fair Expo Cashless Transactions (Limited 2 Expo)",
      "MSME Booster",
      "Scan QR Devices Exclusive",
    ])
  ]);
  await sql.query(`update license_packages set id = 'pkg_copartner_lite', slug = 'digital-festival-lite', name = 'Digital Festival Lite (Digital Partner)', billing = '25% revenue share', commission_pct = 25, description = 'TukodPH as digital festival consultant creates, operates the digital festival and find digital festival sponsor. Digital festival income is commissioned at 25%.', features_json = $1 where id = 'pkg_copartner'`, [
    JSON.stringify([
      "Everything in Smart Festival",
      "TukodPH Team Support from Start to Finish",
      "LGU/Main organizer provide event staff",
      "Limited Festival and event Planning",
      "QR scan device and digital terminal Exclusive",
      "LGU/Organizer Incentivize TukodPH Team",
    ])
  ]);

  await sql.query(`update festivals set package_id = 'pkg_intel', copartner = false where id = 'fst_higalaay2026'`);
  await sql.query(`update festivals set package_id = 'pkg_copartner_lite', copartner = true where id = 'fst_diyandi2026'`);
  await sql.query(`update festivals set package_id = 'pkg_command', copartner = false where id = 'fst_lanzones2026'`);

  const plan = [
    { key: "identity", label: "Festival identity & dates" },
    { key: "calendar", label: "Event calendar" },
    { key: "sponsors", label: "Activate sponsors" },
    { key: "cms", label: "Build festival website (CMS)" },
    { key: "participant_portal", label: "Participant portal" },
    { key: "gate_staff", label: "Gate-staff portal" },
    { key: "go_live", label: "Ready to publish" },
  ];
  for (const fid of ["fst_higalaay2026", "fst_diyandi2026", "fst_lanzones2026", "fst_masskara2026", "fst_sinulog2027"]) {
    const live = fid === "fst_higalaay2026";
    for (const item of plan) {
      await sql.query(
        `insert into planning_items (id, festival_id, key, label, done) values ($1,$2,$3,$4,$5) on conflict do nothing`,
        [`pln_${fid}_${item.key}`, fid, item.key, item.label, live || item.key === "identity"],
      );
    }
  }

  await insert(sql, "cms_blocks", [
    { id: "blk_h_hero", page_id: "pg_h_home", festival_id: "fst_higalaay2026", kind: "hero", heading: "Higalaay 2026", body: "The festival of friendship. Now live in Cagayan de Oro.", meta_json: "{}", sort_order: 0, visible: true },
    { id: "blk_h_prog", page_id: "pg_h_home", festival_id: "fst_higalaay2026", kind: "text", heading: "This week", body: "Street dance, night market, culinary trail, and a digital watch party — one tenant, one ePASS.", meta_json: "{}", sort_order: 1, visible: true },
  ]);

  await insert(sql, "sponsor_income", [
    { id: "inc_coke_p", festival_id: "fst_higalaay2026", sponsor_id: "spn_coke", channel: "physical", amount_php: 2500000, recognized_on: "2026-08-01", note: "Booths and pouring rights" },
    { id: "inc_coke_d", festival_id: "fst_higalaay2026", sponsor_id: "spn_coke", channel: "digital", amount_php: 680000, recognized_on: "2026-08-08", note: "Watch party + missions" },
    { id: "inc_smart_d", festival_id: "fst_higalaay2026", sponsor_id: "spn_smart", channel: "digital", amount_php: 420000, recognized_on: "2026-08-10", note: "Connectivity + stream" },
    { id: "inc_diyandi_d", festival_id: "fst_diyandi2026", sponsor_id: null, channel: "digital", amount_php: 310000, recognized_on: "2026-09-01", note: "Pre-sale digital inventory" },
  ]);

  await insert(sql, "copartner_agreements", [
    { id: "cpa_diyandi", festival_id: "fst_diyandi2026", user_id: "op_ssp_van", status: "active", commission_pct: 30, notes: "TukodPH operates the digital festival. 30% of digital sponsor income." },
  ]);

  await insert(sql, "festival_licenses", [
    { id: "lic_h", festival_id: "fst_higalaay2026", package_id: "pkg_intel", user_id: "op_higalaay", status: "active" },
    { id: "lic_d", festival_id: "fst_diyandi2026", package_id: "pkg_copartner_lite", user_id: "op_diyandi", status: "active" },
    { id: "lic_l", festival_id: "fst_lanzones2026", package_id: "pkg_command", user_id: "op_lanzones", status: "active" },
  ]);

  await insert(sql, "tenant_applications", [
    {
      id: "app_seed_diyandi",
      user_id: "op_diyandi",
      organization_name: "Iligan City Tourism",
      festival_name: "Diyandi 2026",
      city: "Iligan",
      province: "Lanao del Norte",
      contact_name: "City Tourism",
      contact_email: "diyandi@iligan.gov.ph",
      package_id: "pkg_copartner_lite",
      notes: "Request TukodPH as digital co-partner.",
      status: "active",
      festival_id: "fst_diyandi2026",
    },
    {
      id: "app_seed_pending",
      user_id: "system",
      organization_name: "Butuan City Tourism",
      festival_name: "Balangay Festival",
      city: "Butuan",
      province: "Agusan del Norte",
      contact_name: "City Tourism Office",
      contact_email: "tourism@butuan.gov.ph",
      package_id: "pkg_command",
      notes: "Requesting Organizer Command for the 2027 season.",
      status: "pending",
      festival_id: null,
    },
  ]);

  await sql.query(`insert into app_meta (key, value) values ('erp_seeded','1') on conflict do nothing`);
}

export async function runOperatorSeed(sql: Sql) {
  await sql.query(`alter table operator_accounts add column if not exists last_seen_at timestamptz`);
  const accounts = [
    { id: "op_ssp_van", username: "vanz", pass: "vanz92624", kind: "ssp", display_name: "Van Zambrano", organization_name: "TukodPH", contact_email: "van@tukodph.com" },
    { id: "op_ssp_lanz", username: "lanz", pass: "lanz615243", kind: "ssp", display_name: "Lanz", organization_name: "TukodPH", contact_email: "lanz@tukodph.com" },
    { id: "op_ssp_marc", username: "marc", pass: "marc000000", kind: "ssp", display_name: "Marc", organization_name: "TukodPH", contact_email: "marc@tukodph.com" },
    { id: "op_higalaay", username: "higalaay", pass: "higalaay2026", kind: "tenant", display_name: "Higalaay Command", organization_name: "Cagayan de Oro City", contact_email: "higalaay@cdo.gov.ph" },
    { id: "op_diyandi", username: "diyandi", pass: "diyandi2026", kind: "tenant", display_name: "Diyandi Command", organization_name: "Iligan City", contact_email: "diyandi@iligan.gov.ph" },
    { id: "op_lanzones", username: "lanzones", pass: "lanzones2026", kind: "tenant", display_name: "Lanzones Command", organization_name: "Province of Camiguin", contact_email: "lanzones@camiguin.gov.ph" },
  ];

  for (const a of accounts) {
    const existing = await sql.query<{ id: string }>(
      `select id from operator_accounts where id = $1 or lower(username) = $2 or lower(username) = $3`,
      [a.id, a.username.toLowerCase(), `tukodph_${a.username.toLowerCase()}`],
    );
    if (existing[0]) {
      await sql.query(
        `update operator_accounts set username = $1, pass_hash = $2, kind = $3, display_name = $4, organization_name = $5, contact_email = $6 where id = $7`,
        [a.username, hashPass(a.pass), a.kind, a.display_name, a.organization_name, a.contact_email, existing[0].id],
      );
    } else {
      await sql.query(
        `insert into operator_accounts (id, username, pass_hash, kind, display_name, organization_name, contact_email)
         values ($1,$2,$3,$4,$5,$6,$7)`,
        [a.id, a.username, hashPass(a.pass), a.kind, a.display_name, a.organization_name, a.contact_email],
      );
    }
  }

  for (const [festivalId, userId] of [
    ["fst_higalaay2026", "op_higalaay"],
    ["fst_diyandi2026", "op_diyandi"],
    ["fst_lanzones2026", "op_lanzones"],
  ] as const) {
    await sql.query(
      `insert into festival_members (festival_id, user_id, role) values ($1,$2,'admin') on conflict do nothing`,
      [festivalId, userId],
    );
  }

  const allFestivals = await sql.query<{ id: string }>(`select id from festivals`);
  const sspOps = await sql.query<{ id: string }>(`select id from operator_accounts where kind = 'ssp'`);
  for (const f of allFestivals) {
    for (const op of sspOps) {
      await sql.query(
        `insert into festival_members (festival_id, user_id, role) values ($1,$2,'admin') on conflict do nothing`,
        [f.id, op.id],
      );
    }
  }

  await insert(sql, "staff_members", [
    { id: "stf_van", festival_id: "fst_higalaay2026", full_name: "Van Zambrano", role: "supervisor", phone: "+63 917 000 1821", email: "van@higalaay.ph", status: "active", assigned_event_id: "evt_kahimunan", notes: "Gate A lead" },
    { id: "stf_lara", festival_id: "fst_higalaay2026", full_name: "Lara Kagay-anon", role: "usherette", phone: "+63 918 555 0101", email: "lara@higalaay.ph", status: "active", assigned_event_id: "evt_opening", notes: "Opening ceremony" },
    { id: "stf_jun", festival_id: "fst_higalaay2026", full_name: "Jun Pelaez", role: "volunteer", phone: "+63 919 555 0202", email: "jun@higalaay.ph", status: "standby", assigned_event_id: null, notes: "Crowd flow" },
    { id: "stf_diyandi", festival_id: "fst_diyandi2026", full_name: "Iligan Gate Team", role: "coordinator", phone: "+63 63 221 3032", email: "gates@iligan.gov.ph", status: "active", assigned_event_id: "evt_diyandi_open", notes: "Falls viewing deck" },
    { id: "stf_lanzones", festival_id: "fst_lanzones2026", full_name: "Camiguin Ushers", role: "usher", phone: "+63 88 387 1095", email: "ushers@camiguin.gov.ph", status: "active", assigned_event_id: "evt_lanzones_parade", notes: "Harvest parade" },
  ]);
}

let seedLock: Promise<void> | null = null;

export async function ensureSeed(sql: Sql) {
  if (!seedLock) {
    seedLock = (async () => {
      await runSeed(sql);
      await runErpSeed(sql);
      await runOperatorSeed(sql);
    })().catch((err) => {
      seedLock = null;
      throw err;
    });
  }
  await seedLock;
}
