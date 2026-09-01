import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SECRET = "esaulog-dfems-operator-v1";

export function hashPass(pass: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pass, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPass(pass: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(pass, salt, 32);
  const prev = Buffer.from(hash, "hex");
  if (next.length !== prev.length) return false;
  return timingSafeEqual(prev, next);
}

export type SignedOperator = {
  id: string;
  username: string;
  kind: "tenant" | "ssp";
  display_name: string;
  exp: number;
};

export function signOperator(payload: SignedOperator) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyOperatorToken(token: string | null | undefined): SignedOperator | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expect = createHmac("sha256", SECRET).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expect);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SignedOperator;
    if (!payload?.id || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
