export type FestivalStatus = "LIVE" | "SETUP" | "DRAFT" | "PLANNING" | "ENDED";
export type EventType = "physical" | "digital" | "hybrid";
export type EventStatus = "draft" | "published" | "live" | "completed";

export type Organization = {
  id: string;
  name: string;
  kind: string;
  city: string;
  province: string;
};

export type Festival = {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  logo_text: string;
  city: string;
  province: string;
  starts_on: string;
  ends_on: string;
  timezone: string;
  status: FestivalStatus;
  organizer_name: string;
  contact_email: string;
  contact_phone: string;
  primary_color: string;
  hero_kicker: string;
  created_by: string;
  package_id?: string | null;
  copartner?: boolean;
};

export type Venue = {
  id: string;
  festival_id: string;
  name: string;
  address: string;
  capacity: number;
  kind: string;
  notes: string;
};

export type EventCategory = {
  id: string;
  festival_id: string;
  name: string;
  slug: string;
};

export type FestivalEvent = {
  id: string;
  festival_id: string;
  venue_id: string | null;
  category_id: string | null;
  name: string;
  description: string;
  organizer: string;
  event_type: EventType;
  starts_at: string;
  ends_at: string;
  capacity: number;
  registration_mode: string;
  access_mode: string;
  status: EventStatus;
  published: boolean;
  emergency_contact: string;
  sponsor_id: string | null;
  engagement_notes: string;
  venue_name?: string | null;
  category_name?: string | null;
  registered_count?: number;
  checkin_count?: number;
};

export type Participant = {
  id: string;
  festival_id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string;
  city: string;
  age_bracket: string;
  status: string;
  credential_id?: string | null;
};

export type Epass = {
  id: string;
  festival_id: string;
  participant_id: string;
  credential_id: string;
  qr_payload: string;
  nfc_id: string | null;
  status: string;
  issued_at: string;
  expires_at: string | null;
};

export type GateAccessKey = {
  id: string;
  festival_id: string;
  event_id: string;
  gate_id: string | null;
  code: string;
  staff_role: string;
  valid_from: string;
  valid_until: string | null;
  max_devices: number;
  permission_scope: string;
  active: boolean;
  event_name?: string;
  gate_name?: string | null;
  festival_name?: string;
};

export type Vendor = {
  id: string;
  festival_id: string;
  user_id: string | null;
  name: string;
  category: string;
  description: string;
  location: string;
  booster: string;
  contact: string;
};

export type Product = {
  id: string;
  vendor_id: string;
  name: string;
  description: string;
  price_php: number;
  available: boolean;
};

export type Sponsor = {
  id: string;
  festival_id: string;
  name: string;
  tier: string;
  logo_text: string;
  website: string;
  contact: string;
};

export type Mission = {
  id: string;
  festival_id: string;
  title: string;
  description: string;
  points: number;
  badge_id: string | null;
  condition_type: string;
  condition_value: number;
  active: boolean;
  badge_name?: string | null;
  progress?: number;
  completed?: boolean;
};

export type Badge = {
  id: string;
  festival_id: string;
  name: string;
  description: string;
  icon_key: string;
};

export type AiRecommendation = {
  id: string;
  festival_id: string;
  title: string;
  body: string;
  severity: string;
  status: string;
  kind: string;
  created_at: string;
};

export type FestivalPage = {
  id: string;
  festival_id: string;
  slug: string;
  title: string;
  body: string;
  published: boolean;
};

export type ReadinessItem = {
  key: string;
  label: string;
  ok: boolean;
  warn?: boolean;
};

export type EventReadiness = {
  score: number;
  items: ReadinessItem[];
};

export type Reward = {
  id: string;
  festival_id: string;
  name: string;
  description: string;
  points_cost: number;
  inventory: number;
  sponsor_id: string | null;
};

export type LicensePackage = {
  id: string;
  slug: string;
  name: string;
  kind: string;
  price_php: number;
  billing: string;
  description: string;
  features_json: string;
  commission_pct: number;
};

export type TenantApplication = {
  id: string;
  user_id: string;
  organization_name: string;
  festival_name: string;
  city: string;
  province: string;
  contact_name: string;
  contact_email: string;
  package_id: string;
  notes: string;
  status: string;
  festival_id: string | null;
  created_at: string;
  package_name?: string;
};

export type PlanningItem = {
  id: string;
  festival_id: string;
  key: string;
  label: string;
  done: boolean;
};

export type CmsBlock = {
  id: string;
  page_id: string;
  festival_id: string;
  kind: string;
  heading: string;
  body: string;
  meta_json: string;
  sort_order: number;
  visible: boolean;
};

export type SponsorIncome = {
  id: string;
  festival_id: string;
  sponsor_id: string | null;
  channel: string;
  amount_php: number;
  recognized_on: string;
  note: string;
  sponsor_name?: string;
};

export type CopartnerAgreement = {
  id: string;
  festival_id: string;
  user_id: string;
  status: string;
  commission_pct: number;
  notes: string;
  festival_name?: string;
};

export type StaffMember = {
  id: string;
  festival_id: string;
  full_name: string;
  role: string;
  phone: string;
  email: string;
  status: string;
  assigned_event_id: string | null;
  notes: string;
  event_name?: string | null;
};

export type PartnerRequest = {
  id: string;
  festival_id: string;
  kind: string;
  organization_name: string;
  contact_name: string;
  contact_email: string;
  notes: string;
  status: string;
  created_at: string;
};

export type GateCheckin = {
  id: string;
  event_id: string;
  participant_id: string;
  result: string;
  created_at: string;
  participant_name?: string;
  credential_id?: string | null;
  event_name?: string;
};
